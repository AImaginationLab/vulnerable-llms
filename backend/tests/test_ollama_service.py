"""
Tests for OllamaService error surfacing and model management.

Regression coverage for GitHub issue #12: a missing model produced
"Error: Ollama returned status 404" as the model's *answer* with HTTP 200,
so the UI reported "Security Check Passed" on a failed call.
"""

import aiohttp
import pytest
from unittest.mock import patch

from app.config import settings
from app.services.ollama import OllamaService, OllamaError


class FakeResponse:
    def __init__(self, status: int, json_data=None, text: str = ""):
        self.status = status
        self._json = json_data if json_data is not None else {}
        self._text = text

    async def json(self):
        return self._json

    async def text(self):
        return self._text

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False


class FakeSession:
    """Minimal stand-in for aiohttp.ClientSession recording calls."""

    closed = False

    def __init__(self, response: FakeResponse = None, exc: Exception = None):
        self.response = response
        self.exc = exc
        self.calls = []

    def post(self, url, json=None, **kwargs):
        self.calls.append(("POST", url, json))
        if self.exc:
            raise self.exc
        return self.response

    def get(self, url, json=None, **kwargs):
        self.calls.append(("GET", url, json))
        if self.exc:
            raise self.exc
        return self.response

    async def close(self):
        self.closed = True


@pytest.fixture
def anyio_backend():
    return "asyncio"


def make_service(session: FakeSession) -> OllamaService:
    service = OllamaService(host="http://fake-ollama:11434")
    service._session = session
    return service


class TestCallOllamaErrors:
    @pytest.mark.anyio
    async def test_missing_model_raises_with_pull_hint(self):
        session = FakeSession(FakeResponse(404, text='{"error":"model not found"}'))
        service = make_service(session)

        with pytest.raises(OllamaError) as exc_info:
            await service.call_ollama("hi", "sys", model="llama3.2:1b")

        message = str(exc_info.value)
        assert "404" in message
        assert "llama3.2:1b" in message
        assert "ollama pull" in message

    @pytest.mark.anyio
    async def test_connection_failure_raises_with_host(self):
        session = FakeSession(exc=aiohttp.ClientConnectionError("refused"))
        service = make_service(session)

        with pytest.raises(OllamaError) as exc_info:
            await service.call_ollama("hi", "sys")

        assert "http://fake-ollama:11434" in str(exc_info.value)

    @pytest.mark.anyio
    async def test_full_response_call_raises_instead_of_returning_error_dict(self):
        session = FakeSession(FakeResponse(500, text="boom"))
        service = make_service(session)

        with pytest.raises(OllamaError):
            await service.call_ollama_full_response("hi", "sys")

    @pytest.mark.anyio
    async def test_success_returns_message_content(self):
        session = FakeSession(FakeResponse(200, {"message": {"content": "hello"}}))
        service = make_service(session)

        assert await service.call_ollama("hi", "sys") == "hello"


class TestModelConfiguration:
    @pytest.mark.anyio
    async def test_default_model_comes_from_settings(self):
        session = FakeSession(FakeResponse(200, {"message": {"content": "ok"}}))
        service = make_service(session)

        with patch.object(settings, "ollama_model", "some-model:latest"):
            await service.call_ollama("hi", "sys")

        _, url, payload = session.calls[0]
        assert url.endswith("/api/chat")
        assert payload["model"] == "some-model:latest"

    @pytest.mark.anyio
    async def test_pull_model_posts_to_pull_endpoint(self):
        session = FakeSession(FakeResponse(200, {"status": "success"}))
        service = make_service(session)

        assert await service.pull_model("llama3.2:1b") is True

        method, url, payload = session.calls[0]
        assert method == "POST"
        assert url == "http://fake-ollama:11434/api/pull"
        assert payload == {"model": "llama3.2:1b", "stream": False}

    @pytest.mark.anyio
    async def test_pull_model_returns_false_when_ollama_unreachable(self):
        session = FakeSession(exc=aiohttp.ClientConnectionError("refused"))
        service = make_service(session)

        assert await service.pull_model("llama3.2:1b") is False

    @pytest.mark.anyio
    async def test_connection_check_uses_tags_not_inference(self):
        session = FakeSession(FakeResponse(200, {"models": []}))
        service = make_service(session)

        assert await service.test_connection() is True

        method, url, _ = session.calls[0]
        assert method == "GET"
        assert url.endswith("/api/tags")


class TestDemoEndpointErrorSurfacing:
    def test_demo_returns_503_when_ollama_fails(self):
        from unittest.mock import MagicMock, AsyncMock
        from fastapi.testclient import TestClient
        from app.main import create_app
        from app.dependencies import get_ollama_service
        from app.services.vulnerability_analyzer import VulnerabilityAnalyzer

        failing_ollama = MagicMock()
        failing_ollama.call_ollama = AsyncMock(
            side_effect=OllamaError("Ollama returned status 404 for model 'llama3.2:1b'")
        )
        failing_ollama.close = AsyncMock(return_value=None)

        app = create_app()
        app.dependency_overrides[get_ollama_service] = lambda: failing_ollama

        with patch("app.dependencies._ollama_service", failing_ollama), \
             patch("app.dependencies._vulnerability_analyzer", VulnerabilityAnalyzer(failing_ollama)):
            with TestClient(app) as client:
                response = client.post(
                    "/api/v1/2025/LLM02/run_demo",
                    json={"user_input": "What is my account number?"},
                )

        assert response.status_code == 503
        body = response.json()
        assert "404" in body["detail"]
        assert body["error"] == "LLM backend unavailable"


class TestReadinessReportsOllama:
    def test_readiness_includes_ollama_model_status(self):
        from fastapi.testclient import TestClient
        from app.main import create_app

        with TestClient(create_app()) as client:
            data = client.get("/health/ready").json()

        assert "ollama_available" in data
        assert "models_ready" in data
        assert data["models"] == [settings.ollama_model, settings.ollama_tool_model]
