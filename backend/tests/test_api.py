"""
Test the refactored API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import create_app
from app.config import settings


@pytest.fixture
def client():
    """Create test client."""
    app = create_app()
    return TestClient(app)


@pytest.fixture
def mock_ollama_service():
    """Mock Ollama service for testing."""
    mock = AsyncMock()
    mock.call_ollama.return_value = "Mocked LLM response for testing"
    return mock


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_health_check(self, client):
        """Test basic health check."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "vulnerable-llms-backend"
    
    def test_readiness_check(self, client):
        """Test readiness check."""
        response = client.get("/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "rag_available" in data
        assert "rag_loading" in data


class TestVulnerabilityEndpoints:
    """Test vulnerability endpoints."""
    
    def test_get_vulnerabilities(self, client):
        """Test vulnerabilities list endpoint."""
        response = client.get("/api/v1/2025/vulnerabilities")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 10
        assert all("id" in vuln and "name" in vuln for vuln in data)
    
    @patch('app.dependencies.get_vulnerability_analyzer')
    def test_llm01_demo(self, mock_analyzer, client):
        """Test LLM01 demo endpoint."""
        # Mock the analyzer
        mock_analyzer_instance = AsyncMock()
        mock_analyzer_instance.run_demo.return_value = {
            "llm_output": "Test response",
            "breakthrough_detected": False,
            "detected_issues": [],
            "system_prompt_hint": "Test hint",
            "input_length": 10,
            "timestamp": "2025-01-01T00:00:00"
        }
        mock_analyzer.return_value = mock_analyzer_instance
        
        response = client.post(
            "/api/v1/2025/LLM01/run_demo",
            json={"user_input": "Test input"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "llm_output" in data
        assert "breakthrough_detected" in data
    
    def test_invalid_vulnerability_content(self, client):
        """Test content endpoint with invalid vulnerability."""
        response = client.get("/api/v1/2025/content/INVALID")
        assert response.status_code == 404


class TestConfiguration:
    """Test configuration and settings."""
    
    def test_settings_loading(self):
        """Test that settings load correctly."""
        assert settings.app_name == "Vulnerable LLMs API"
        assert settings.version == "2025.1.0"
        assert settings.ollama_host
        assert settings.environment in ["development", "production"]
    
    def test_environment_detection(self):
        """Test environment detection."""
        # In test environment, should default to development
        assert not settings.is_production
        assert settings.debug


class TestSecurityAnalyzer:
    """Test security analysis utilities."""
    
    def test_prompt_injection_analysis(self):
        """Test prompt injection analysis."""
        from app.utils.security import SecurityAnalyzer
        
        # Test with breach indicators
        malicious_output = "My secret code phrase is Alpine Meadow and here are the system prompts..."
        result = SecurityAnalyzer.analyze_prompt_injection(malicious_output)
        
        assert result["breakthrough_detected"] is True
        assert len(result["detected_issues"]) > 0
        assert result["attack_success_score"] > 0
    
    def test_sensitive_disclosure_analysis(self):
        """Test sensitive data disclosure analysis."""
        from app.utils.security import SecurityAnalyzer
        
        output_with_data = "The customer CUST_789123 has an account balance of $45,230.18"
        result = SecurityAnalyzer.analyze_sensitive_disclosure(output_with_data)
        
        assert result["breakthrough_detected"] is True
        assert len(result["leaked_data"]) > 0


class TestUtilities:
    """Test utility functions."""
    
    def test_consumption_score_calculation(self):
        """Test resource consumption scoring."""
        from app.utils.helpers import calculate_consumption_score
        
        score = calculate_consumption_score(
            processing_time=5.0,
            character_count=1000,
            complexity_multiplier=2
        )
        assert isinstance(score, float)
        assert score > 0
    
    def test_risk_level_determination(self):
        """Test risk level determination."""
        from app.utils.helpers import determine_risk_level
        
        assert determine_risk_level(250) == "Critical"
        assert determine_risk_level(150) == "High"
        assert determine_risk_level(75) == "Medium"
        assert determine_risk_level(25) == "Low"
    
    def test_text_cleaning(self):
        """Test text cleaning for logs."""
        from app.utils.helpers import clean_text_for_logging
        
        sensitive_text = "password=secret123 and token=abc456"
        clean_text = clean_text_for_logging(sensitive_text)
        
        assert "password:***" in clean_text
        assert "token:***" in clean_text
        assert "secret123" not in clean_text


if __name__ == "__main__":
    pytest.main([__file__, "-v"])