# syntax=docker/dockerfile:1.4

#################################################
# Stage 1: builder
#################################################
FROM python:3.11-slim AS builder
WORKDIR /app

# Install system dependencies and Node.js for frontend build
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg2 \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and scripts
COPY backend/ backend/
COPY scripts/ scripts/
RUN python backend/scripts/precompute_common_word_embeddings.py

# Install frontend dependencies and build assets
COPY frontend/package*.json frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ .
RUN npm run build

#################################################
# Stage 2: development
#################################################
FROM builder AS development
WORKDIR /app

# Install dev-only Python tools
RUN pip install --no-cache-dir watchdog

ENV PYTHONPATH=/app:/app/backend
ENV ENVIRONMENT=development
ENV NODE_ENV=development

EXPOSE 5000 3000

# Scripts already copied in builder stage
RUN chmod +x /app/scripts/docker-dev-start.sh

CMD ["/app/scripts/docker-dev-start.sh"]

#################################################
# Stage 3: production
#################################################
FROM python:3.11-slim AS production
WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local /usr/local

# Copy backend code
COPY --from=builder /app/backend /app/backend

# Copy built frontend assets into static folder
RUN mkdir -p backend/static
COPY --from=builder /app/frontend/build /app/backend/static/

ENV PYTHONPATH=/app:/app/backend

EXPOSE 5000

WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
