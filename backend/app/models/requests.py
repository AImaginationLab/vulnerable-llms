"""
Request models for the vulnerable LLMs API.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from .enums import AttackLevel, VulnerabilityType, PromptType, VectorSearchType


class LLMRequest(BaseModel):
    """Basic LLM request model."""
    user_input: str = Field(
        ..., 
        min_length=1, 
        max_length=2000, 
        description="User input for the LLM"
    )


class EnhancedLLMRequest(BaseModel):
    """Enhanced LLM request with attack level selection."""
    attack_level: AttackLevel = Field(..., description="Attack difficulty level")
    custom_prompt: Optional[str] = Field(
        None, 
        max_length=1000, 
        description="Custom prompt to use instead of generated ones"
    )


class LLM10Request(BaseModel):
    """Request model for LLM10 unbounded consumption demo."""
    prompt_type: PromptType = Field(..., description="Prompt complexity type")


class AutoAttackRequest(BaseModel):
    """Request model for automated attack sessions."""
    max_attempts: int = Field(
        default=10, 
        ge=1, 
        le=50, 
        description="Maximum number of attack attempts"
    )


class AttackGenerationRequest(BaseModel):
    """Request model for AI-generated attack prompts."""
    vulnerability_type: VulnerabilityType = Field(..., description="Type of vulnerability to target")
    difficulty: str = Field(
        ..., 
        pattern="^(easy|medium|hard)$", 
        description="Attack difficulty level"
    )
    count: int = Field(
        default=5, 
        ge=1, 
        le=20, 
        description="Number of attacks to generate"
    )


class GitHubScrapeRequest(BaseModel):
    """Request model for GitHub content scraping."""
    github_url: str = Field(..., description="GitHub URL to scrape (issue, PR, or repository)")
    include_malicious_examples: bool = Field(
        default=True, 
        description="Whether to add demo malicious comments"
    )


class RAGQueryRequest(BaseModel):
    """Request model for RAG system queries."""
    query: str = Field(
        ..., 
        min_length=1, 
        max_length=500, 
        description="User query for the RAG system"
    )
    max_results: int = Field(
        default=3, 
        ge=1, 
        le=10, 
        description="Number of context documents to retrieve"
    )
    generate_answer: bool = Field(
        default=False,
        description="Whether to generate an answer from retrieved context"
    )
    metadata_filter: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional metadata filter for search"
    )


class RAGPoisonRequest(BaseModel):
    """Request model for RAG poisoning attacks."""
    poison_content: List[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="List of malicious content to inject"
    )


class VectorSearchRequest(BaseModel):
    """Request model for vector search operations."""
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Search query"
    )
    search_type: VectorSearchType = Field(
        default=VectorSearchType.SEMANTIC,
        description="Type of vector search to perform"
    )
    max_results: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results to return"
    )
    similarity_threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Minimum similarity threshold for results"
    )
    metadata_filter: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional metadata filter"
    )


class EmbeddingInversionRequest(BaseModel):
    """Request model for embedding inversion attacks."""
    target_ids: List[str] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Target document IDs to attempt inversion on"
    )
    attack_method: str = Field(
        default="nearest_neighbor",
        pattern="^(nearest_neighbor|gradient_based)$",
        description="Inversion attack method"
    )
    max_candidates: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of inversion candidates to return"
    )
    show_ground_truth: bool = Field(
        default=False,
        description="Whether to show original text (for demo purposes)"
    )


class VectorCleanupRequest(BaseModel):
    """Request model for vector cleanup operations."""
    ids_to_remove: List[str] = Field(
        default=[],
        description="List of document IDs to remove (use ['all'] to clear all documents)"
    )
    cleanup_by_type: Optional[List[str]] = Field(
        None,
        description="Optional list of content types to clean up"
    )


