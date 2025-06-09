"""
Application configuration using Pydantic settings.
"""

from pydantic import Field
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for older pydantic versions
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Core settings
    app_name: str = "Vulnerable LLMs API"
    version: str = "2025.1.0"
    description: str = "OWASP LLM Top 10 2025 Vulnerability Demonstration API"
    
    # Environment
    environment: str = "development"
    debug: bool = Field(default=False, description="Enable debug mode (set via DEBUG env var)")
    
    # Logging
    log_level: str = "INFO"
    
    # External services
    ollama_host: str = "http://ollama:11434"
    
    # Database
    chroma_persist_directory: str = "./chroma_db"
    
    # Security
    # WARNING: CORS is intentionally permissive for educational demos
    # In production, replace ["*"] with specific allowed origins
    cors_origins: list[str] = Field(
        default=["*"], 
        description="Allowed CORS origins - intentionally permissive for demos"
    )
    
    # Performance
    max_request_size: int = 10 * 1024 * 1024  # 10MB
    request_timeout: int = 90  # Increased for detailed injection analysis prompt
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"
    
    model_config = {
        "env_file": ".env", 
        "case_sensitive": False
    }


# Global settings instance
settings = Settings()