"""
Ollama LLM service for handling model interactions.
"""

import asyncio
import aiohttp
import logging
from typing import Optional, Dict, Any
from ..config import settings
from ..utils.helpers import timing_decorator, clean_text_for_logging

logger = logging.getLogger(__name__)

# Pulling a model can take minutes on first run; don't apply the request timeout.
_PULL_TIMEOUT = aiohttp.ClientTimeout(total=None)


class OllamaError(Exception):
    """Raised when Ollama cannot serve a request (unreachable, missing model, bad status)."""


def _pull_hint(model: str) -> str:
    return f"Run: ollama pull {model} (or set OLLAMA_MODEL / OLLAMA_TOOL_MODEL to an installed model)"


class OllamaService:
    """Service for interacting with Ollama LLM API."""

    def __init__(self, host: Optional[str] = None):
        self.host = host or settings.ollama_host
        self.timeout = aiohttp.ClientTimeout(total=settings.request_timeout)
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(timeout=self.timeout)
        return self._session

    async def _create_new_session(self) -> aiohttp.ClientSession:
        """Create a new aiohttp session for parallel requests."""
        return aiohttp.ClientSession(timeout=self.timeout)

    async def close(self):
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def _chat(
        self,
        session: aiohttp.ClientSession,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """POST to /api/chat and return the parsed body, raising OllamaError on any failure."""
        model = payload["model"]
        try:
            logger.debug(f"Sending request to {self.host}/api/chat")
            async with session.post(f"{self.host}/api/chat", json=payload) as response:
                if response.status == 200:
                    return await response.json()

                error_text = await response.text()
                logger.debug(f"Response body: {error_text}")
                message = f"Ollama returned status {response.status} for model '{model}'"
                if response.status == 404:
                    message += f". The model is not installed. {_pull_hint(model)}"
                raise OllamaError(message)

        except OllamaError as e:
            logger.error(f"❌ Ollama API error: {e}")
            raise
        except asyncio.TimeoutError:
            message = f"Ollama API timeout after {settings.request_timeout} seconds (model '{model}')"
            logger.error(f"❌ {message}")
            raise OllamaError(message)
        except aiohttp.ClientConnectionError as e:
            message = f"Cannot connect to Ollama at {self.host} ({e})"
            logger.error(f"❌ {message}")
            raise OllamaError(message)
        except Exception as e:
            message = f"Error calling Ollama: {e}"
            logger.error(f"❌ {message}")
            raise OllamaError(message)

    @timing_decorator
    async def call_ollama(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        model: Optional[str] = None,
        use_new_session: bool = False,
        tools: Optional[list] = None
    ) -> str:
        """
        Call Ollama API using the chat endpoint.

        Args:
            prompt: User prompt to send to the model
            system_prompt: System prompt to set model behavior
            model: Model name to use (defaults to settings.ollama_model)
            tools: Optional list of tools for function calling

        Returns:
            Model response text

        Raises:
            OllamaError: if Ollama is unreachable, the model is missing, or the call fails.
        """
        model = model or settings.ollama_model
        logger.debug(f"🤖 Calling Ollama Chat API with model: {model}")
        logger.debug(f"System prompt: {clean_text_for_logging(system_prompt)}")
        logger.debug(f"User prompt: {clean_text_for_logging(prompt)}")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "num_ctx": 4096,  # Set context window to 4096 tokens for better performance
                "temperature": 0.7,
                "top_k": 40,
                "top_p": 0.9
            }
        }

        # Add tools if provided
        if tools:
            payload["tools"] = tools

        if use_new_session:
            session = await self._create_new_session()
            should_close_session = True
        else:
            session = await self._get_session()
            should_close_session = False

        try:
            data = await self._chat(session, payload)
        finally:
            if should_close_session and session and not session.closed:
                await session.close()

        llm_response = data.get("message", {}).get("content") or "No response received"
        logger.info(f"✅ Ollama API success: {len(llm_response)} characters returned")
        logger.debug(f"LLM Response: {clean_text_for_logging(llm_response, 300)}")
        return llm_response

    async def call_ollama_full_response(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        model: Optional[str] = None,
        tools: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Call Ollama chat API and return the full response (including tool calls).

        This is useful when you need access to tool calls or other metadata.

        Raises:
            OllamaError: if Ollama is unreachable, the model is missing, or the call fails.
        """
        model = model or settings.ollama_tool_model
        logger.debug(f"🤖 Calling Ollama Chat API (full response) with model: {model}")
        logger.debug(f"Tools provided: {len(tools) if tools else 0}")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        if tools:
            payload["tools"] = tools
            logger.debug(f"Tool names: {[t['function']['name'] for t in tools]}")

        session = await self._get_session()
        data = await self._chat(session, payload)

        logger.info("✅ Ollama Chat API success")
        logger.debug(f"Response structure: {list(data.keys())}")
        if 'message' in data:
            logger.debug(f"Message keys: {list(data['message'].keys())}")
            if 'tool_calls' in data['message']:
                logger.debug(f"Tool calls found: {len(data['message']['tool_calls'])}")
        return data

    async def pull_model(self, model: str) -> bool:
        """
        Ask Ollama to download a model if it isn't already present.

        Returns True when the model is available afterwards, False otherwise.
        Never raises: this runs in the background at startup.
        """
        session = await self._get_session()
        logger.info(f"⬇️ Ensuring Ollama model is available: {model}")
        try:
            async with session.post(
                f"{self.host}/api/pull",
                json={"model": model, "stream": False},
                timeout=_PULL_TIMEOUT,
            ) as response:
                if response.status == 200:
                    logger.info(f"✅ Ollama model ready: {model}")
                    return True
                error_text = await response.text()
                logger.error(f"❌ Failed to pull model {model}: status {response.status} {error_text}")
                return False
        except Exception as e:
            logger.error(f"❌ Failed to pull model {model}: {e}")
            return False

    async def test_connection(self) -> bool:
        """Check that Ollama is reachable (no inference performed)."""
        result = await self.list_models()
        return "error" not in result

    async def get_model_info(self, model: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a specific model."""
        model = model or settings.ollama_model
        session = await self._get_session()

        try:
            async with session.post(f"{self.host}/api/show",
                                  json={"model": model}) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"Model info request failed with status {response.status}"}
        except Exception as e:
            return {"error": f"Failed to get model info: {str(e)}"}

    async def list_models(self) -> Dict[str, Any]:
        """List available models."""
        session = await self._get_session()

        try:
            async with session.get(f"{self.host}/api/tags") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"List models request failed with status {response.status}"}
        except Exception as e:
            return {"error": f"Failed to list models: {str(e)}"}
