"""
Vulnerability demonstration endpoints.
"""

import logging
import time
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException

from ..models.enums import PromptType
from ..models.requests import LLMRequest, EnhancedLLMRequest, LLM10Request
from ..models.responses import (
    VulnerabilityInfo, VulnerabilityResponse, EnhancedVulnerabilityResponse,
    LLM06Response, LLM10Response
)
from ..dependencies import get_vulnerability_analyzer, get_ollama_service
from ..services.vulnerability_analyzer import VulnerabilityAnalyzer
from ..services.ollama import OllamaService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/2025", tags=["vulnerabilities"])


@router.get("/vulnerabilities", response_model=List[VulnerabilityInfo])
async def get_vulnerabilities():
    """Get list of OWASP LLM Top 10 vulnerabilities."""
    logger.info("📋 Fetching OWASP LLM Top 10 vulnerabilities list")
    
    vulnerabilities = [
        VulnerabilityInfo(id="LLM01_2025", name="Prompt Injection", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM02_2025", name="Sensitive Information Disclosure", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM03_2025", name="Supply Chain", year="2025", has_demo=False),
        VulnerabilityInfo(id="LLM04_2025", name="Data and Model Poisoning", year="2025", has_demo=False),
        VulnerabilityInfo(id="LLM05_2025", name="Insecure Output Handling", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM06_2025", name="Excessive Agency", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM07_2025", name="System Prompt Leakage", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM08_2025", name="Vector and Embedding Weaknesses", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM09_2025", name="Misinformation", year="2025", has_demo=True),
        VulnerabilityInfo(id="LLM10_2025", name="Unbounded Consumption", year="2025", has_demo=True)
    ]
    
    logger.info(f"✅ Returning {len(vulnerabilities)} vulnerabilities")
    return vulnerabilities


@router.post("/LLM01/run_demo", response_model=VulnerabilityResponse)
async def llm01_prompt_injection(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM01: Prompt Injection."""
    return await analyzer.run_demo("LLM01", request)


@router.post("/LLM01/enhanced_demo", response_model=EnhancedVulnerabilityResponse)
async def llm01_enhanced_prompt_injection(
    request: EnhancedLLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Enhanced demo for LLM01: Advanced Prompt Injection with attack level selection."""
    return await analyzer.run_enhanced_demo("LLM01", request)


@router.post("/LLM02/run_demo", response_model=VulnerabilityResponse)
async def llm02_sensitive_disclosure(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM02: Sensitive Information Disclosure."""
    return await analyzer.run_demo("LLM02", request)


@router.post("/LLM05/run_demo", response_model=VulnerabilityResponse)
async def llm05_insecure_output(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM05: Insecure Output Handling."""
    return await analyzer.run_demo("LLM05", request)


@router.post("/LLM06/run_demo", response_model=LLM06Response)
async def llm06_excessive_agency(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM06: Excessive Agency."""
    return await analyzer.run_demo("LLM06", request)


@router.post("/LLM07/run_demo", response_model=VulnerabilityResponse)
async def llm07_system_prompt(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM07: System Prompt Leakage."""
    return await analyzer.run_demo("LLM07", request)


@router.post("/LLM09/run_demo", response_model=VulnerabilityResponse)
async def llm09_misinformation(
    request: LLMRequest,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM09: Misinformation."""
    return await analyzer.run_demo("LLM09", request)


LLM10_PROMPTS = {
    PromptType.SIMPLE: "Hello, how are you?",
    PromptType.LONG_TEXT: (
        "Please analyze this extremely long text and provide a comprehensive summary: "
        + " ".join(
            f"This is paragraph {i} of a very long document discussing various aspects of artificial intelligence, "
            "machine learning, deep learning, neural networks, natural language processing, computer vision, "
            "robotics, automation, and their impacts on society, economy, ethics, philosophy, and human existence. "
            for i in range(50)
        )
    ),
    PromptType.COMPLEX_REASONING: """Solve this complex multi-step problem:
        1. Calculate the 50th Fibonacci number
        2. Find all prime numbers between 1 and 1000
        3. Explain quantum computing in detail
        4. Analyze the philosophical implications of consciousness
        5. Write a comprehensive essay on climate change
        6. Translate this response into 5 different languages
        Please be extremely thorough and detailed in each step.""",
    PromptType.RECURSIVE_GENERATION: (
        "Generate a story, then analyze it, then generate another story based on that analysis. Repeat 10 times."
    ),
}


@router.post("/LLM10/run_demo", response_model=LLM10Response)
async def llm10_unbounded_consumption(
    request: LLM10Request,
    analyzer: VulnerabilityAnalyzer = Depends(get_vulnerability_analyzer)
):
    """Demo for LLM10: Unbounded Consumption. Sends a resource-intensive prompt and measures the cost."""
    prompt = LLM10_PROMPTS[request.prompt_type]

    # Deliberately bypass LLMRequest's input-length limit: the missing limit is the vulnerability
    start_time = time.time()
    result = await analyzer.get_demo("LLM10").run_prompt(prompt)
    response_time_ms = int((time.time() - start_time) * 1000)

    return LLM10Response(
        **result.model_dump(),
        status="success",
        response_time_ms=response_time_ms,
        metadata={
            "response_time_ms": response_time_ms,
            "prompt_length": len(prompt),
            "prompt_type": request.prompt_type.value,
            "output_length": len(result.llm_output),
            "resource_impact": "high" if response_time_ms > 5000 else "medium" if response_time_ms > 2000 else "low",
        },
    )


# Placeholder for content endpoints
@router.get("/content/{vulnerability_id}")
async def get_vulnerability_content(vulnerability_id: str):
    """Get detailed content for a specific vulnerability."""
    logger.info(f"📄 Loading content for vulnerability: {vulnerability_id}")
    
    try:
        # Import here to avoid circular imports
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        
        from content_loader import load_content
        content = load_content(vulnerability_id)
        
        logger.info(f"✅ Content loaded successfully for {vulnerability_id}")
        return {"content": content}
        
    except FileNotFoundError:
        logger.warning(f"📄❌ Content file not found for {vulnerability_id}")
        raise HTTPException(status_code=404, detail=f"Content not found for {vulnerability_id}")
    except Exception as e:
        logger.error(f"📄❌ Error loading content for {vulnerability_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error loading content for {vulnerability_id}")