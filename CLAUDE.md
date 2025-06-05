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

### Project Structure
- Backend: FastAPI with Python
- Frontend: TypeScript React with Vite
- Vector DB: ChromaDB for RAG demonstrations
- LLM: Ollama with local models

## Current Features
- 7 interactive vulnerability demos
- Auto-attack mode with promptfoo integration
- Enhanced attack levels (easy → expert)
- Theme system (light/dark/hacker)
- Real-time attack analysis

## In Progress
- Indirect prompt injection via RAG system
- GitHub content scraping for vector embeddings
- ChromaDB integration for context retrieval

## Development Notes
- Use TodoWrite/TodoRead for task tracking
- Prefer editing existing files over creating new ones
- Test all changes before considering tasks complete