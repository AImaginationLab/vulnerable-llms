"""
Response models for the vulnerable LLMs API.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from .enums import RiskLevel, SuccessLevel, VectorSearchType


class BaseResponse(BaseModel):
    """Base response model with common fields."""
    timestamp: str = Field(..., description="Response timestamp")


class VulnerabilityInfo(BaseModel):
    """Vulnerability information model."""
    id: str = Field(..., description="Vulnerability ID")
    name: str = Field(..., description="Vulnerability name")
    year: str = Field(..., description="OWASP year")
    has_demo: bool = Field(..., description="Whether demo is available")


class VulnerabilityResponse(BaseResponse):
    """Standard vulnerability demo response."""
    llm_output: str = Field(..., description="LLM response text")
    breakthrough_detected: bool = Field(..., description="Whether security breach was detected")
    detected_issues: List[str] = Field(default_factory=list, description="List of detected security issues")
    system_prompt_hint: Optional[str] = Field(None, description="Hint about system prompt configuration")
    input_length: Optional[int] = Field(None, description="Length of user input")


class EnhancedVulnerabilityResponse(VulnerabilityResponse):
    """Enhanced vulnerability response with scoring."""
    attack_success_score: int = Field(..., description="Attack success score")
    success_level: SuccessLevel = Field(..., description="Attack success level")
    attack_level: str = Field(..., description="Attack difficulty level used")
    custom_prompt_used: bool = Field(..., description="Whether custom prompt was used")


class LLM02Response(VulnerabilityResponse):
    """LLM02 specific response with leaked data tracking."""
    leaked_data: List[str] = Field(default_factory=list, description="List of leaked data patterns")
    context_injection_hint: str = Field(..., description="Context injection information")


class LLM05Response(BaseResponse):
    """LLM05 output handling response."""
    llm_output: str = Field(..., description="LLM response text")
    raw_output: str = Field(..., description="Unsanitized output for demo")
    security_issues: List[str] = Field(default_factory=list, description="Detected security issues")
    risk_level: RiskLevel = Field(..., description="Risk assessment level")
    contains_html: bool = Field(..., description="Whether output contains HTML")
    contains_javascript: bool = Field(..., description="Whether output contains JavaScript")
    warning: str = Field(..., description="Security warning message")


class LLM06Response(BaseResponse):
    """LLM06 excessive agency response."""
    llm_output: str = Field(..., description="LLM response text")
    initial_filesystem: Dict[str, Any] = Field(..., description="Initial filesystem state")
    modified_filesystem: Dict[str, Any] = Field(..., description="Modified filesystem state")
    executed_operations: List[str] = Field(default_factory=list, description="List of executed operations")
    security_violations: List[str] = Field(default_factory=list, description="Security violations detected")
    risk_assessment: RiskLevel = Field(..., description="Risk assessment")
    warning: str = Field(..., description="Security warning")


class LLM07Response(BaseResponse):
    """LLM07 system prompt leakage response."""
    llm_output: str = Field(..., description="LLM response text")
    leaked_elements: List[str] = Field(default_factory=list, description="Leaked system elements")
    security_breach_level: str = Field(..., description="Breach severity level")
    system_prompt_exposure: bool = Field(..., description="Whether system prompt was exposed")
    critical_data_exposed: bool = Field(..., description="Whether critical data was exposed")
    warning: str = Field(..., description="Security warning")
    recommendation: str = Field(..., description="Security recommendation")


class LLM09Response(BaseResponse):
    """LLM09 misinformation response."""
    llm_output: str = Field(..., description="LLM response text")
    detected_misinformation: List[str] = Field(default_factory=list, description="Detected misinformation")
    fact_check_flags: List[str] = Field(default_factory=list, description="Fact-checking flags")
    confidence_score: int = Field(..., description="Information confidence score")
    reliability_level: str = Field(..., description="Information reliability level")
    requires_verification: bool = Field(..., description="Whether verification is needed")
    warning: str = Field(..., description="Information warning")


class LLM10Response(BaseResponse):
    """LLM10 unbounded consumption response."""
    llm_output: str = Field(..., description="LLM response text")
    prompt_type: str = Field(..., description="Prompt type used")
    processing_time_seconds: float = Field(..., description="Processing time in seconds")
    token_count: int = Field(..., description="Token count in response")
    character_count: int = Field(..., description="Character count in response")
    consumption_score: float = Field(..., description="Resource consumption score")
    risk_level: RiskLevel = Field(..., description="Resource consumption risk level")
    resource_metrics: Dict[str, float] = Field(..., description="Simulated resource metrics")
    warnings: List[Optional[str]] = Field(default_factory=list, description="Resource warnings")
    recommendation: str = Field(..., description="Resource management recommendation")


class AutoAttackResponse(BaseResponse):
    """Auto-attack session response."""
    vulnerability: str = Field(..., description="Vulnerability type tested")
    total_attempts: int = Field(..., description="Total attack attempts")
    successful_attacks: int = Field(..., description="Number of successful attacks")
    success_rate: float = Field(..., description="Attack success rate percentage")
    attack_results: List[Dict[str, Any]] = Field(..., description="Individual attack results")
    summary: Dict[str, Any] = Field(..., description="Attack summary and recommendations")


class AttackGenerationResponse(BaseResponse):
    """Attack generation response."""
    vulnerability_type: str = Field(..., description="Vulnerability type")
    difficulty: str = Field(..., description="Attack difficulty")
    count_requested: int = Field(..., description="Number of attacks requested")
    generated_attacks: List[str] = Field(..., description="Generated attack prompts")
    metadata: Dict[str, str] = Field(..., description="Generation metadata")


class RAGResponse(BaseResponse):
    """RAG system response."""
    user_query: str = Field(..., description="Original user query")
    llm_response: str = Field(..., description="LLM response")
    injection_analysis: Dict[str, Any] = Field(..., description="Injection detection analysis")
    context_analysis: Dict[str, Any] = Field(..., description="Context source analysis")
    raw_context: str = Field(..., description="Raw context used")
    vulnerable_prompt_used: str = Field(..., description="Vulnerable prompt sent to LLM")
    mitigation_notes: List[str] = Field(..., description="Security mitigation recommendations")


class EmbeddingInversionResponse(BaseResponse):
    """Embedding inversion response."""
    original_text: Optional[str] = Field(None, description="Original text if provided")
    inverted_candidates: List[Dict[str, float]] = Field(..., description="Inversion candidates with similarity scores")
    reconstructed: Optional[str] = Field(None, description="LLM-reconstructed text if chaining enabled")
    reconstruction_error: Optional[str] = Field(None, description="Reconstruction error if any")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Health status")
    service: str = Field(..., description="Service name")


class ReadinessResponse(HealthResponse):
    """Extended readiness check response."""
    rag_available: bool = Field(..., description="RAG system availability")
    rag_loading: bool = Field(..., description="RAG system loading status")


class RAGQueryResponse(BaseResponse):
    """RAG query response."""
    query: str = Field(..., description="Original query")
    results: List[Dict[str, Any]] = Field(..., description="Search results")
    total_results: int = Field(..., description="Total number of results")
    generated_answer: Optional[str] = Field(None, description="Generated answer from context")
    search_metadata: Dict[str, Any] = Field(..., description="Search metadata")


class RAGPoisonResponse(BaseResponse):
    """RAG poisoning response."""
    attack_type: str = Field(..., description="Type of attack performed")
    injected_documents: int = Field(..., description="Number of documents injected")
    injected_ids: List[str] = Field(..., description="IDs of injected documents")
    effectiveness_score: float = Field(..., description="Attack effectiveness score")
    risk_assessment: str = Field(..., description="Risk assessment level")
    test_results: List[Dict[str, Any]] = Field(..., description="Test query results")
    collection_stats: Dict[str, Any] = Field(..., description="Collection statistics")
    cleanup_info: Dict[str, Any] = Field(..., description="Cleanup information")


class VectorSearchResponse(BaseResponse):
    """Vector search response."""
    query: str = Field(..., description="Original search query")
    search_type: str = Field(..., description="Type of search performed")
    results: List[Dict[str, Any]] = Field(..., description="Search results")
    total_results: int = Field(..., description="Total number of results")
    security_analysis: Dict[str, Any] = Field(..., description="Security analysis")
    search_metadata: Dict[str, Any] = Field(..., description="Search metadata")


class EmbeddingInversionResponse(BaseResponse):
    """Embedding inversion response."""
    attack_method: str = Field(..., description="Attack method used")
    target_count: int = Field(..., description="Number of targets")
    successful_inversions: int = Field(..., description="Number of successful inversions")
    attack_effectiveness: float = Field(..., description="Attack effectiveness percentage")
    risk_assessment: str = Field(..., description="Risk assessment level")
    inversion_results: List[Dict[str, Any]] = Field(..., description="Inversion results")
    attack_metadata: Dict[str, Any] = Field(..., description="Attack metadata")
    mitigation_recommendations: List[str] = Field(..., description="Security recommendations")


class VectorSimilarityResponse(BaseResponse):
    """Vector similarity response."""
    query: str = Field(..., description="Original query")
    similarities: List[Dict[str, Any]] = Field(..., description="Similarity results")
    analysis: Dict[str, Any] = Field(..., description="Analysis results")


class VectorCleanupResponse(BaseResponse):
    """Vector cleanup response."""
    requested_removals: int = Field(..., description="Number of requested removals")
    actual_removals: int = Field(..., description="Number of actual removals")
    collection_stats: Dict[str, Any] = Field(..., description="Collection statistics")
    cleanup_details: Dict[str, Any] = Field(..., description="Cleanup details")