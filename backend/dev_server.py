#!/usr/bin/env python3
"""Development server for FastAPI backend"""

import os
import sys
import subprocess

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Set development environment
    os.environ['ENVIRONMENT'] = 'development'
    
    # Precompute vocabulary embeddings cache in development mode
    script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'precompute_common_word_embeddings.py')
    if os.path.exists(script_path):
        print(f"🔄 Running precompute script: {script_path}")
        try:
            subprocess.run([sys.executable, script_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Precompute script failed: {e}")

    # Run the FastAPI server with uvicorn
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--host", "0.0.0.0", 
        "--port", "5000", 
        "--reload"
    ])