"""
FastAPI dependency injection providers.
"""

import logging
from typing import Optional, Tuple
from fastapi import Depends, HTTPException, Request

from .config import settings
from .services.ollama import OllamaService
from .services.vulnerability_analyzer import VulnerabilityAnalyzer

logger = logging.getLogger(__name__)


# Global service instances (will be initialized on startup)
_ollama_service: Optional[OllamaService] = None
_vulnerability_analyzer: Optional[VulnerabilityAnalyzer] = None


async def get_ollama_service() -> OllamaService:
    """Dependency to get Ollama service instance."""
    global _ollama_service
    
    if _ollama_service is None:
        _ollama_service = OllamaService(settings.ollama_host)
    
    return _ollama_service


async def get_vulnerability_analyzer(
    ollama_service: OllamaService = Depends(get_ollama_service)
) -> VulnerabilityAnalyzer:
    """Dependency to get vulnerability analyzer instance."""
    global _vulnerability_analyzer
    
    if _vulnerability_analyzer is None:
        _vulnerability_analyzer = VulnerabilityAnalyzer(ollama_service)
    
    return _vulnerability_analyzer


async def get_rag_components(request: Request) -> Tuple[any, any]:
    """
    Dependency to get RAG components with proper error handling.
    
    Returns:
        Tuple of (vector_store, rag_system)
    """
    app_state = request.app.state
    
    if not getattr(app_state, 'rag_available', False):
        return None, None

    vector_store = getattr(app_state, 'vector_store', None)
    rag_system = getattr(app_state, 'rag_system', None)

    return vector_store, rag_system


async def get_vector_store(request: Request) -> any:
    """Dependency to get vector store instance."""
    vector_store, _ = await get_rag_components(request)
    return vector_store


async def get_rag_system(request: Request) -> any:
    """Dependency to get RAG system instance."""
    _, rag_system = await get_rag_components(request)
    return rag_system


async def cleanup_services():
    """Cleanup function to be called on app shutdown."""
    global _ollama_service
    
    if _ollama_service:
        await _ollama_service.close()
        _ollama_service = None
    
    logger.info("✅ Services cleaned up successfully")