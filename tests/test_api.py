from fastapi.testclient import TestClient
import pytest

from backend.main import app

client = TestClient(app)

def test_get_vulnerabilities():
    response = client.get("/api/v1/2025/vulnerabilities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10
    # Check structure of first vulnerability
    first = data[0]
    assert "id" in first and "name" in first and "year" in first and "has_demo" in first
    assert first["id"] == "LLM01_2025"

def test_get_content_success():
    response = client.get("/api/v1/2025/content/LLM03_2025")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    content = data["content"]
    assert isinstance(content, dict)
    assert "title" in content and isinstance(content["title"], str)
    assert content["title"].startswith("LLM03")
    assert "content" in content and isinstance(content["content"], str)
    assert content["content"].startswith("# LLM03")

def test_get_content_not_found():
    response = client.get("/api/v1/2025/content/LLM99_2025")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()

def test_invalid_route():
    response = client.get("/api/v1/2025/nonexistent")
    assert response.status_code == 404