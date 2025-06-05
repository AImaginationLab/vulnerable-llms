FROM python:3.9-slim

WORKDIR /app

# Install Node.js for frontend build only
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY ./backend/ ./backend/
COPY ./frontend/ ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend for production (will be skipped in dev mode)
RUN npm run build || echo "Build failed - will use dev mode"

# Copy built assets to Flask static folder if build succeeded
RUN if [ -d "build" ]; then \
        mkdir -p /app/backend/static && \
        cp -r build/* /app/backend/static/ || echo "No build files to copy"; \
    fi

WORKDIR /app

# Set environment variable for FastAPI
ENV PYTHONPATH=/app

# Expose ports (both backend and frontend for dev mode)
EXPOSE 5000 3000

# Default command - will be overridden by docker-compose
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]