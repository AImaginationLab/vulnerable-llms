"""
Enums for the vulnerable LLMs API.
"""

from enum import Enum


class AttackLevel(str, Enum):
    """Attack difficulty levels."""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class VulnerabilityType(str, Enum):
    """Vulnerability types for attack generation."""
    PROMPT_INJECTION = "prompt_injection"
    DATA_LEAKAGE = "data_leakage"
    SYSTEM_PROMPT = "system_prompt"


class PromptType(str, Enum):
    """Prompt complexity types for LLM10 resource consumption."""
    SIMPLE = "simple"
    COMPLEX = "complex"
    RECURSIVE = "recursive"
    INFINITE = "infinite"


class RiskLevel(str, Enum):
    """Risk assessment levels."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class SuccessLevel(str, Enum):
    """Attack success levels."""
    FAILED = "Failed"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class VectorSearchType(str, Enum):
    """Vector search types."""
    SEMANTIC = "semantic"
    SIMILARITY_THRESHOLD = "similarity_threshold"
    ADVERSARIAL = "adversarial"