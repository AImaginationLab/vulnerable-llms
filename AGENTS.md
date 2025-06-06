# Agents Guide - Vulnerable LLMs

This guide is for AI agents (like codex) working on the vulnerable-llms project.

## 🚀 Quick Start Commands

**Recommended Development Approach:**
```bash
# Start the full stack with Docker (includes everything)
docker-compose -f docker-compose.override.yml up

# Access: http://localhost:3000 (frontend)
# Backend API: http://localhost:5000  
# Ollama: http://localhost:11434
```

**Local Development (Alternative):**
```bash
# Install dependencies
npm ci                    # Root dependencies (TypeScript, tsx)
npm run install:frontend  # Frontend dependencies (React, Vite)
npm run install:backend   # Python backend dependencies

# Start frontend (React with Vite hot reload)
npm run dev              # → http://localhost:3000

# Start backend (separate terminal)
cd backend && python main.py  # → http://localhost:5000
```

## 🧪 Testing & Quality

**Always run these after making changes:**

```bash
# Run all tests (backend + frontend + linting + type checking)
npm run test:all

# Individual test suites
npm run test:backend      # Python/FastAPI tests  
npm run test:frontend     # Frontend unit tests (vitest)
npm run lint             # ESLint checks
npm run typecheck        # TypeScript validation
```

**For backend changes specifically:**
```bash
cd backend && python -m pytest
```

## 🏗️ Build Commands

```bash
# Build frontend for production
npm run build

# Build Express server (TypeScript compilation)
npm run build:server

# Start production server (after building)
npm run start:http
```

## 🔧 Architecture Notes

- **Backend**: FastAPI with Python 3.11, async components, app.state pattern
- **Frontend**: TypeScript React with Vite (Node.js 22), ESM modules
- **Build System**: tsx for TypeScript execution, tsc for compilation
- **Docker**: Debian slim-based containers (ML library compatibility)
- **Health Checks**: Backend starts quickly (~7s), ML models load async
- **RAG System**: ChromaDB for vector demos, Ollama for LLM (llama3.2:1b)

## 🐳 Docker Workflows

**Development (with hot reload):**
```bash
docker-compose -f docker-compose.override.yml up --build
```

**Production:**
```bash
docker-compose up --build
```

**Health check troubleshooting:**
- Backend health check passes quickly: `/health` endpoint
- RAG components load asynchronously in background
- First Ollama startup downloads model (~1.5GB)

## 🛠️ Common Development Tasks

**Adding new vulnerability demos:**
1. Add endpoint in `backend/main.py` (follow LLM01-LLM10 pattern)
2. Update frontend components for new vulnerability
3. Run tests: `npm run test:all`
4. Test with Docker: `docker-compose -f docker-compose.override.yml up`

**Frontend changes:**
1. Work in `frontend/` directory with `npm run dev` for hot reload
2. Ensure `"type": "module"` remains in `frontend/package.json` (fixes CJS warnings)
3. Run linting and type checking: `npm run lint && npm run typecheck`

**Backend changes:**
1. Use FastAPI app.state pattern (not globals) for shared components
2. Always use logger instead of print statements
3. Run backend tests: `cd backend && python -m pytest`
4. Check health endpoints: `/health` (basic), `/health/ready` (with components)

## ⚠️ Important Notes

- **Use Dockerfile.dev for development** (not Dockerfile)
- **RAG components load async** - don't block startup waiting for them
- **ML libraries require Debian base** - Alpine doesn't work with onnxruntime
- **Health check script waits for backend** before starting frontend
- **All package.json scripts use tsx/tsc** for TypeScript execution

## 🔍 Validation Steps

After making changes:

1. **For backend changes**: Run `pytest` in backend directory
2. **For frontend changes**: Run `npm run lint`, `npm run typecheck`, `npm run test:frontend`
3. **For Docker changes**: Test both development and production containers
4. **Always run**: `npm run test:all` before considering task complete

## 📝 Development Notes

- Project uses FastAPI app.state pattern (refactored from globals)
- Frontend uses ESM modules throughout (`"type": "module"`)
- Build system upgraded to tsx for faster TypeScript execution
- GitHub Actions split into separate test and build workflows
- Health checks prevent Docker race conditions during startup
- Background ML model loading doesn't block application start