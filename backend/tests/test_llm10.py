"""
Tests for the LLM10 Unbounded Consumption demo.

Regression coverage: the LLM10 route called analyzer.run_demo("LLM10") but no
LLM10 demo was ever registered (500), the request enum rejected every value the
frontend sends (422), and the route assigned fields the response model lacked.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import create_app
from app.dependencies import get_ollama_service
from app.models.enums import PromptType
from app.services.vulnerability_analyzer import VulnerabilityAnalyzer


@pytest.fixture
def ollama_stub():
    stub = MagicMock()
    stub.call_ollama = AsyncMock(return_value="A long answer " * 20)
    stub.close = AsyncMock(return_value=None)
    return stub


@pytest.fixture
def client(ollama_stub):
    app = create_app()
    app.dependency_overrides[get_ollama_service] = lambda: ollama_stub
    with patch("app.dependencies._ollama_service", ollama_stub), \
         patch("app.dependencies._vulnerability_analyzer", VulnerabilityAnalyzer(ollama_stub)):
        with TestClient(app) as test_client:
            yield test_client


def test_llm10_demo_is_registered(ollama_stub):
    analyzer = VulnerabilityAnalyzer(ollama_stub)
    assert "LLM10" in analyzer.list_available_demos()


def test_prompt_type_enum_matches_what_frontend_sends():
    assert PromptType("long_text")
    assert PromptType("complex_reasoning")
    assert PromptType("recursive_generation")


def test_llm10_long_text_returns_timing_and_status(client, ollama_stub):
    response = client.post("/api/v1/2025/LLM10/run_demo", json={"prompt_type": "long_text"})

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["response_time_ms"], int)
    assert data["metadata"]["prompt_type"] == "long_text"
    assert data["metadata"]["prompt_length"] > 1000
    assert "llm_output" in data

    # The heavy prompt, not the literal prompt_type string, reaches the model
    sent_prompt = ollama_stub.call_ollama.call_args.args[0]
    assert len(sent_prompt) > 1000


@pytest.mark.parametrize("prompt_type", [p.value for p in PromptType])
def test_every_prompt_type_is_accepted(client, prompt_type):
    response = client.post("/api/v1/2025/LLM10/run_demo", json={"prompt_type": prompt_type})
    assert response.status_code == 200, response.text


def test_unknown_prompt_type_is_rejected(client):
    response = client.post("/api/v1/2025/LLM10/run_demo", json={"prompt_type": "bogus"})
    assert response.status_code == 422
