"""
API routers organized by concern.
"""

from .health import router as health_router
from .vulnerabilities import router as vulnerabilities_router
from .attacks import router as attacks_router
from .rag import router as rag_router
from .vectors import router as vectors_router