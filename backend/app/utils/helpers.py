"""
General utility functions and helpers.
"""

import time
import logging
from typing import Any, Dict, List, Optional, Callable
from functools import wraps
from datetime import datetime

logger = logging.getLogger(__name__)


def timing_decorator(func: Callable) -> Callable:
    """Decorator to measure function execution time."""
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.debug(f"{func.__name__} executed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.3f}s: {str(e)}")
            raise
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.debug(f"{func.__name__} executed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.3f}s: {str(e)}")
            raise
    
    return async_wrapper if hasattr(func, '__code__') and func.__code__.co_flags & 0x80 else sync_wrapper


def calculate_consumption_score(
    processing_time: float, 
    character_count: int, 
    complexity_multiplier: int = 1
) -> float:
    """Calculate resource consumption score."""
    time_score = min(100, (processing_time / 30) * 100)  # Scale to 30 seconds max
    length_score = min(100, (character_count / 5000) * 100)  # Scale to 5000 chars max
    
    consumption_score = (time_score + length_score) * complexity_multiplier
    return round(consumption_score, 2)


def determine_risk_level(score: float, thresholds: Dict[str, float] = None) -> str:
    """Determine risk level based on score."""
    if thresholds is None:
        thresholds = {"critical": 200, "high": 100, "medium": 50}
    
    if score >= thresholds["critical"]:
        return "Critical"
    elif score >= thresholds["high"]:
        return "High"
    elif score >= thresholds["medium"]:
        return "Medium"
    else:
        return "Low"


def simulate_resource_metrics(consumption_score: float) -> Dict[str, float]:
    """Simulate resource usage metrics based on consumption score."""
    return {
        "cpu_usage": min(100, consumption_score * 0.3),
        "memory_usage": min(100, consumption_score * 0.4),
        "estimated_cost": consumption_score * 0.001  # Simulated cost in dollars
    }


def create_timestamp() -> str:
    """Create ISO format timestamp."""
    return datetime.now().isoformat()


def safe_get_attribute(obj: Any, attr: str, default: Any = None) -> Any:
    """Safely get attribute from object with fallback."""
    try:
        return getattr(obj, attr, default)
    except (AttributeError, TypeError):
        return default


def truncate_text(text: str, max_length: int = 200, suffix: str = "...") -> str:
    """Truncate text to maximum length with suffix."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def clean_text_for_logging(text: str, max_length: int = 100) -> str:
    """Clean and truncate text for safe logging."""
    # Remove potential sensitive data patterns
    import re
    
    # Mask potential passwords, tokens, etc.
    text = re.sub(r'password[:=]\s*\S+', 'password:***', text, flags=re.IGNORECASE)
    text = re.sub(r'token[:=]\s*\S+', 'token:***', text, flags=re.IGNORECASE)
    text = re.sub(r'key[:=]\s*\S+', 'key:***', text, flags=re.IGNORECASE)
    
    return truncate_text(text, max_length)


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """Merge multiple dictionaries into one."""
    result = {}
    for d in dicts:
        if d:
            result.update(d)
    return result


class AsyncRetry:
    """Simple async retry mechanism."""
    
    def __init__(self, max_attempts: int = 3, delay: float = 1.0):
        self.max_attempts = max_attempts
        self.delay = delay
    
    async def __call__(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with retry logic."""
        import asyncio
        
        last_exception = None
        
        for attempt in range(self.max_attempts):
            try:
                if hasattr(func, '__call__'):
                    return await func(*args, **kwargs)
                else:
                    return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < self.max_attempts - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {self.delay}s...")
                    await asyncio.sleep(self.delay)
                else:
                    logger.error(f"All {self.max_attempts} attempts failed. Last error: {str(e)}")
        
        raise last_exception


# Export commonly used functions
__all__ = [
    'timing_decorator',
    'calculate_consumption_score', 
    'determine_risk_level',
    'simulate_resource_metrics',
    'create_timestamp',
    'safe_get_attribute',
    'truncate_text',
    'clean_text_for_logging',
    'format_file_size',
    'merge_dicts',
    'AsyncRetry'
]