"""
Health check endpoints.
"""

import logging
from fastapi import APIRouter, Request
from ..models.responses import HealthResponse, ReadinessResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for Docker startup verification.
    
    Returns basic health status without dependencies.
    """
    return HealthResponse(
        status="healthy", 
        service="vulnerable-llms-backend"
    )


@router.get("/health/ready", response_model=ReadinessResponse)
async def readiness_check(request: Request):
    """
    Extended health check that includes component status.
    
    Returns detailed readiness information including RAG system status.
    """
    app_state = request.app.state
    
    return ReadinessResponse(
        status="healthy",
        service="vulnerable-llms-backend",
        rag_available=getattr(app_state, 'rag_available', False),
        rag_loading=getattr(app_state, 'rag_loading', False)
    )