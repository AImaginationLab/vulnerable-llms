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

### Frontend Code Style
- **Prefer CSS classes over inline styles** - Use existing CSS classes from index.css
- **Reuse existing UI components** - Use Card, Alert, Button components from components/ui
- **Use semantic class names** - Like output-panel, demo-section, help-text
- **Avoid inline style objects** - Extract to CSS classes for maintainability
- **Follow component composition** - Break down complex UI into smaller components

### Frontend UI Components
- **Use ChatInterface for all LLM interactions** - Provides consistent user experience
- **EnhancedChatInterface** - Use for demos with attack levels/difficulty settings
- **Keep UI compact and clean** - Avoid clunky layouts, integrate controls elegantly
- **Consolidate related pages** - Don't create separate "enhanced" versions unnecessarily

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
- **IMPORTANT**: Always use `source venv/bin/activate` before running Python commands (pytest, python, pip, etc.)

## UI/UX Patterns

### Chat Interface Migration
When converting demo pages to use ChatInterface:
1. **Identify the pattern**: Look for textarea + button + response display
2. **Choose the right component**:
   - `ChatInterface` - Basic chat with suggestions
   - `EnhancedChatInterface` - Chat with attack levels, system prompt reveal
3. **Preserve functionality**: Ensure all features work (analysis, metadata, etc)
4. **API Integration**:
   - Basic demos can use simple endpoints
   - Advanced demos should conditionally use enhanced APIs based on difficulty

### Component Design Principles
- **Compact headers** - Use single-row controls where possible
- **Integrated controls** - Attack levels as pill buttons, not separate sections
- **Dynamic suggestions** - Update based on context (e.g., difficulty level)
- **Visual feedback** - Use colors/icons to indicate security status
- **Educational value** - Include explanations for successful attacks

### Common Patterns to Replace
- Textarea + "Run Demo" button → ChatInterface
- Attack level selector + generate button → EnhancedChatInterface header
- Multiple demo variations → Single page with dynamic behavior
- Separate results sections → Integrated chat responses with analysis
- InteractiveDemo component → ChatInterface (preserves all functionality)

### Special Cases
- **Complex multi-input demos** (like LLM08): May need custom UI, not suitable for ChatInterface
- **Button-only demos** (like LLM10): Keep existing UI, ChatInterface not appropriate
- **RAG/file-based demos**: May need file upload in addition to ChatInterface
