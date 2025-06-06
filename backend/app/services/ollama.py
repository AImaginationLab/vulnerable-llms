"""
Ollama LLM service for handling model interactions.
"""

import asyncio
import aiohttp
import logging
import time
from typing import Optional, Dict, Any
from ..config import settings
from ..utils.helpers import timing_decorator, clean_text_for_logging

logger = logging.getLogger(__name__)


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
    
    @timing_decorator
    async def call_ollama(
        self, 
        prompt: str, 
        system_prompt: str = "You are a helpful assistant.", 
        model: str = "llama3.2:1b",
        use_new_session: bool = False
    ) -> str:
        """
        Call Ollama API with comprehensive logging and error handling.
        
        Args:
            prompt: User prompt to send to the model
            system_prompt: System prompt to set model behavior
            model: Model name to use
            
        Returns:
            Model response text
        """
        logger.debug(f"🤖 Calling Ollama API with model: {model}")
        logger.debug(f"System prompt: {clean_text_for_logging(system_prompt)}")
        logger.debug(f"User prompt: {clean_text_for_logging(prompt)}")
        
        payload = {
            "model": model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "num_ctx": 4096,  # Set context window to 4096 tokens for better performance
                "temperature": 0.7,
                "top_k": 40,
                "top_p": 0.9
            }
        }
        
        if use_new_session:
            session = await self._create_new_session()
            should_close_session = True
        else:
            session = await self._get_session()
            should_close_session = False
        
        try:
            logger.debug(f"Sending request to {self.host}/api/generate")
            
            async with session.post(f"{self.host}/api/generate", json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    llm_response = data.get("response", "No response received")
                    
                    logger.info(f"✅ Ollama API success: {len(llm_response)} characters returned")
                    logger.debug(f"LLM Response: {clean_text_for_logging(llm_response, 300)}")
                    
                    return llm_response
                else:
                    error_text = await response.text()
                    error_msg = f"Error: Ollama returned status {response.status}"
                    logger.error(f"❌ Ollama API error: {error_msg}")
                    logger.debug(f"Response body: {error_text}")
                    return error_msg
                    
        except asyncio.TimeoutError:
            error_msg = f"Error: Ollama API timeout after {settings.request_timeout} seconds"
            logger.error(f"❌ {error_msg}")
            return error_msg
            
        except aiohttp.ClientConnectionError:
            error_msg = f"Error: Cannot connect to Ollama at {self.host}"
            logger.error(f"❌ {error_msg}")
            return error_msg
            
        except Exception as e:
            error_msg = f"Error calling Ollama: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return error_msg
        finally:
            if should_close_session and session and not session.closed:
                await session.close()
    
    async def test_connection(self) -> bool:
        """Test connection to Ollama service."""
        try:
            response = await self.call_ollama("ping", "test")
            return "Error" not in response
        except Exception as e:
            logger.error(f"Ollama connection test failed: {e}")
            return False
    
    async def get_model_info(self, model: str = "llama3.2:1b") -> Dict[str, Any]:
        """Get information about a specific model."""
        session = await self._get_session()
        
        try:
            async with session.get(f"{self.host}/api/show", 
                                 json={"name": model}) as response:
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