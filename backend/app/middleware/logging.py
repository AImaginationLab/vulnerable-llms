"""
Request logging middleware.
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..utils.helpers import clean_text_for_logging

logger = logging.getLogger("vulnerable_llms.middleware")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for comprehensive request/response logging."""
    
    async def dispatch(self, request: Request, call_next):
        # Start timing
        start_time = time.time()
        
        # Log incoming request
        logger.info(f"🔄 {request.method} {request.url.path}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Query params: {dict(request.query_params)}")
        
        # Add request ID for tracing
        request_id = f"{int(start_time * 1000)}"
        
        try:
            # Process request
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful response
            logger.info(
                f"✅ {request.method} {request.url.path} -> "
                f"{response.status_code} ({process_time:.3f}s) [ID: {request_id}]"
            )
            
            # Add timing and request ID headers
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error response
            logger.error(
                f"❌ {request.method} {request.url.path} -> "
                f"ERROR ({process_time:.3f}s) [ID: {request_id}]: {str(e)}"
            )
            
            # Re-raise the exception to be handled by error middleware
            raise


async def log_request_body_middleware(request: Request, call_next):
    """
    Middleware function to safely log request bodies for debugging.
    Note: This consumes the request body, so use carefully.
    """
    # Only log for specific endpoints in debug mode
    if (request.url.path.startswith("/api/") and 
        logger.isEnabledFor(logging.DEBUG)):
        
        try:
            body = await request.body()
            if body:
                # Safely log request body (limit size and clean sensitive data)
                body_text = body.decode('utf-8')[:500]  # Limit to 500 chars
                safe_body = clean_text_for_logging(body_text, max_length=200)
                logger.debug(f"Request body: {safe_body}")
        except Exception as e:
            logger.debug(f"Could not log request body: {e}")
    
    response = await call_next(request)
    return response