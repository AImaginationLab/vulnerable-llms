"""
Test configuration and fixtures for backend tests.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app, create_app
from .mock_utils import (
    create_mock_ollama_service,
    create_mock_vector_store,
    create_mock_rag_system,
    create_mock_github_scraper,
    override_dependencies
)


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_ollama():
    """Create a mock Ollama service."""
    return create_mock_ollama_service()


@pytest.fixture
def mock_vector_store():
    """Create a mock vector store."""
    return create_mock_vector_store()


@pytest.fixture
def mock_rag_system():
    """Create a mock RAG system."""
    return create_mock_rag_system()


@pytest.fixture
def mock_github_scraper():
    """Create a mock GitHub scraper."""
    return create_mock_github_scraper()


@pytest.fixture
def mocked_app(mock_ollama, mock_vector_store, mock_rag_system, mock_github_scraper):
    """Create a test app with all services mocked."""
    with patch('vector_store.VectorStore') as mock_vs_class, \
         patch('vector_store.RAGSystem') as mock_rag_class, \
         patch('github_scraper.GitHubScraper') as mock_scraper_class:

        # Configure mocks
        mock_vs_class.return_value = mock_vector_store
        mock_rag_class.return_value = mock_rag_system
        mock_scraper_class.return_value = mock_github_scraper

        # Create app and override dependencies
        app = create_app()
        override_dependencies(app, {
            'ollama': mock_ollama,
            'vector_store': mock_vector_store,
            'rag_system': mock_rag_system,
            'github_scraper': mock_github_scraper
        })

        yield app


@pytest.fixture
def mocked_client(mocked_app):
    """Create a test client with mocked dependencies."""
    return TestClient(mocked_app)
