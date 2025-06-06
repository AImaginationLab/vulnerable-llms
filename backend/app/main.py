"""
Main FastAPI application with modern architecture.
"""

import asyncio
import logging
import logging.config
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Add backend directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .config import settings
from .middleware.cors import add_cors_middleware
from .middleware.logging import LoggingMiddleware
from .middleware.error_handling import ErrorHandlingMiddleware, global_exception_handler
from .dependencies import cleanup_services
from .routers import (
    health_router,
    vulnerabilities_router,
    attacks_router,
    rag_router,
    vectors_router
)

# Configure logging
logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "detailed": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S"
        },
        "simple": {
            "format": "%(levelname)-8s | %(name)s | %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": settings.log_level,
            "formatter": "detailed",
            "stream": "ext://sys.stdout"
        }
    },
    "loggers": {
        "vulnerable_llms": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False
        },
        "uvicorn": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False
        },
        "uvicorn.error": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False
        },
        "uvicorn.access": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
}

logging.config.dictConfig(logging_config)
logger = logging.getLogger("vulnerable_llms")


async def load_heavy_components(app: FastAPI):
    """Load heavy components asynchronously in the background."""
    logger.info("🔄 Starting background initialization of heavy components...")
    app.state.rag_loading = True
    
    try:
        # Initialize RAG components
        from github_scraper import GitHubScraper
        from vector_store import VectorStore, RAGSystem

        logger.info("📦 Loading GitHub scraper...")
        app.state.github_scraper = GitHubScraper()
        
        logger.info("🗄️ Loading vector store (this may take a moment)...")
        app.state.vector_store = VectorStore()
        
        logger.info("🤖 Initializing RAG system...")
        app.state.rag_system = RAGSystem(app.state.vector_store)
        app.state.rag_available = True

        logger.info("✅ RAG system components initialized successfully")
        
        # Seed vector database with demo embeddings if empty
        if app.state.vector_store.collection.count() == 0:
            logger.info("🏷️ Vector DB empty; seeding demo embeddings for inversion demo")
            demo_chunks = [
                {'text': "password encryption system", 'type': 'seed', 'author': 'demo1', 'created_at': '2025-01-01T00:00:00Z', 'url': '', 'comment_id': 'seed1'},
                {'text': "database privacy policy", 'type': 'seed', 'author': 'demo2', 'created_at': '2025-01-01T00:00:00Z', 'url': '', 'comment_id': 'seed2'},
                {'text': "user authentication mechanism", 'type': 'seed', 'author': 'demo3', 'created_at': '2025-01-01T00:00:00Z', 'url': '', 'comment_id': 'seed3'}
            ]
            app.state.vector_store.add_content(demo_chunks)
            logger.info("🌱 Demo embeddings seeded successfully")
        
    except ImportError as e:
        logger.warning(f"Failed to import RAG components: {e}. RAG endpoints will be disabled.")
        app.state.rag_available = False
    except Exception as e:
        logger.error(f"Error initializing RAG components: {e}. RAG endpoints will be disabled.")
        logger.error(f"Exception traceback: {e}")
        app.state.rag_available = False
    finally:
        app.state.rag_loading = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("🚀 FastAPI Application Starting Up")
    logger.info(f"🏭 Environment: {'Production' if settings.is_production else 'Development'}")
    logger.info(f"🔗 Ollama Host: {settings.ollama_host}")

    # Initialize app state
    app.state.rag_available = False
    app.state.rag_loading = False

    # Start heavy component loading in background (don't await!)
    asyncio.create_task(load_heavy_components(app))
    
    logger.info("🎯 All vulnerability endpoints loaded and ready")
    logger.info("📚 Content loader initialized")
    logger.info("🛡️ Security analysis engines ready")
    
    yield
    
    # Shutdown
    logger.info("🛑 FastAPI Application Shutting Down")
    await cleanup_services()
    logger.info("👋 Goodbye!")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description=settings.description,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    logger.info("FastAPI application created successfully")
    logger.info(f"API Title: {app.title}")
    logger.info(f"API Version: {app.version}")
    
    # Add middleware
    add_cors_middleware(app)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    
    # Add global exception handler as backup
    app.add_exception_handler(Exception, global_exception_handler)
    
    logger.info("Middleware configured successfully")
    
    # Include routers
    app.include_router(health_router)
    app.include_router(vulnerabilities_router)
    app.include_router(attacks_router)
    app.include_router(rag_router)
    app.include_router(vectors_router)
    
    logger.info("API routers configured successfully")
    
    # Serve static files in production
    if settings.is_production:
        static_dir = Path(os.getcwd()) / "backend" / "static"
        if static_dir.is_dir():
            app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")
            logger.info(f"Static files mounted from {static_dir}")
            
            @app.get("/")
            async def serve_react_app():
                """Serve the React app."""
                return FileResponse(str(static_dir / "index.html"))

            @app.get("/{path:path}")
            async def serve_react_files(path: str):
                """Serve React static files or fallback to index.html."""
                # Don't intercept API routes
                if path.startswith("api/"):
                    from fastapi import HTTPException
                    raise HTTPException(status_code=404, detail="API endpoint not found")

                file_path = static_dir / path
                if file_path.is_file():
                    return FileResponse(str(file_path))
                else:
                    return FileResponse(str(static_dir / "index.html"))
        else:
            logger.warning(f"Static directory not found: {static_dir}")
    else:
        @app.get("/")
        async def development_info():
            """Development mode info."""
            return {
                "message": "Backend API is running in development mode with FastAPI",
                "frontend_url": "http://localhost:3000",
                "api_base": "/api/v1/2025",
                "status": "development",
                "docs": "/docs"
            }
    
    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=5000, 
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )