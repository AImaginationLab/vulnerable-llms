# Claude Development Notes

## Project Guidelines

### Logging
- **Always use logger instead of print statements** in Python backend code
- Use appropriate log levels (info, warning, error, debug)
- Example: `logger.info("message")` instead of `print("message")`

### Code Quality
- Follow existing code patterns and conventions
- Use proper error handling
- Add type hints where applicable
- Use FastAPI app.state for component management (not globals)

### Project Structure
- Backend: FastAPI with Python 3.11
- Frontend: TypeScript React with Vite, Node.js 22
- Build System: tsx for TypeScript execution, tsc for compilation
- Vector DB: ChromaDB for RAG demonstrations
- LLM: Ollama with local models (llama3.2:1b)
- Docker: Debian slim-based containers for ML library compatibility

## 🚀 How to Start the Application

### Quick Start (Recommended)
```bash
# Full stack with Docker (includes everything)
docker-compose -f docker-compose.override.yml up

# Access: http://localhost:3000 (frontend)
# Backend API: http://localhost:5000
# Ollama: http://localhost:11434
```

### Local Development
```bash
# Install dependencies
npm ci && npm run install:frontend && npm run install:backend

# Start frontend (React with Vite)
npm run dev  # → http://localhost:3000

# Start backend (separate terminal)
cd backend && python main.py  # → http://localhost:5000
```

### Build Commands
```bash
npm run build          # Vite build (React app)
npm run build:server   # TypeScript compilation (Express server)
npm run typecheck      # TypeScript validation
npm run lint           # ESLint validation
npm run test:all       # All tests (backend + frontend)
```

## 🏗️ Architecture Insights

### FastAPI Backend
- **Async Component Loading**: Heavy ML models load in background during startup
- **App State Management**: Uses `app.state` for RAG components (not globals)
- **Health Checks**: `/health` (basic), `/health/ready` (with component status)
- **Startup Sequence**: Basic server → health check passes → ML models load async

### Frontend Build System
- **Development**: Vite dev server with hot reload
- **Production**: Vite build → Express server serves static files
- **TypeScript**: ESM modules (`"type": "module"` in package.json)
- **No CJS Warnings**: Fixed by using ESM throughout

### Docker Setup
- **Fast Startup**: ~7 seconds to health check, ~17 seconds total
- **Background Loading**: ML models don't block frontend startup
- **Health Check Script**: Waits for backend `/health` endpoint before starting frontend
- **Multi-stage**: Production uses optimized builds, development uses hot reload

## Current Features
- 7+ interactive vulnerability demos (LLM01-LLM10)
- Auto-attack mode with promptfoo integration
- Enhanced attack levels (basic → intermediate → advanced)
- Theme system (light/dark/hacker)
- Real-time attack analysis
- RAG attack scenarios with GitHub content scraping
- Vector database poisoning demonstrations
- Embedding inversion attacks

## ⚠️ Important Technical Notes

### Docker Development
- Use `docker-compose.override.yml` for development (includes hot reload)
- Backend starts with health check script, then frontend starts
- RAG components load asynchronously (no blocking)
- Ollama downloads model on first run (~1.5GB)

### Common Issues & Solutions
- **ML Library Compatibility**: Use Debian slim, not Alpine (onnxruntime issues)
- **CJS Deprecation**: Fixed with `"type": "module"` in frontend package.json
- **Startup Race Conditions**: Fixed with health check script and async loading
- **Global Variables**: Refactored to use FastAPI app.state pattern

### Testing & Quality
- **Backend**: pytest for API tests
- **Frontend**: Vitest for unit tests
- **Linting**: ESLint with TypeScript support
- **Type Checking**: tsc --noEmit for validation
- **Docker Health**: curl-based health checks in startup script

## Development Notes
- Use TodoWrite/TodoRead for task tracking
- Prefer editing existing files over creating new ones
- Test all changes before considering tasks complete
- Always run `npm run lint` and `npm run typecheck` before committing
- Use the health check endpoints to verify system status