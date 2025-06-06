"""
Global error handling middleware.
"""

import logging
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from ..utils.helpers import create_timestamp

logger = logging.getLogger("vulnerable_llms.errors")


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for global exception handling."""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            # Let HTTPExceptions pass through to FastAPI's handler
            raise
        except Exception as exc:
            # Log unhandled exceptions
            logger.error(f"🚨 UNHANDLED EXCEPTION: {type(exc).__name__}: {str(exc)}")
            logger.error(f"🔍 Request: {request.method} {request.url}")
            logger.error(f"📋 Traceback: {traceback.format_exc()}")
            
            # Return generic error response
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "type": type(exc).__name__,
                    "detail": str(exc),
                    "timestamp": create_timestamp()
                }
            )


async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler function (alternative to middleware)."""
    logger.error(f"🚨 UNHANDLED EXCEPTION: {type(exc).__name__}: {str(exc)}")
    logger.error(f"🔍 Request: {request.method} {request.url}")
    logger.error(f"📋 Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "type": type(exc).__name__,
            "detail": str(exc),
            "timestamp": create_timestamp()
        }
    )