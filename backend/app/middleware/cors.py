"""
CORS configuration middleware.
"""

from fastapi.middleware.cors import CORSMiddleware
from ..config import settings


def add_cors_middleware(app):
    """Add CORS middleware to FastAPI app."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app