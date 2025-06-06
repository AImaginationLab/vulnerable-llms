"""
Entry point for the vulnerable LLMs API.

This file maintains backward compatibility while using the new modular structure.
"""

from app.main import app

# Re-export the app for uvicorn and other tools
__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)