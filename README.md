# Vulnerable LLMs - Interactive AI Security Lab

**Learn AI security by breaking things in a safe environment 🔐**

An interactive security testing platform that demonstrates real vulnerabilities in Large Language Models. Features automated attack generation, live vulnerability demonstrations, and comprehensive educational content based on the OWASP LLM Top 10 2025.

## ✨ Key Features

- **Interactive Demos**: Live vulnerability demonstrations with real LLM responses
- **RAG Attack Scenarios**: Indirect prompt injection via web scraping & vector poisoning
- **Attack Analysis**: Learn how and attacks are orchestrated and why they succeed
- **Local Setup**: Docker-based, runs completely offline

## Prerequisites

- Docker + Docker Compose
- Node.js 22+ and npm
- Python 3.11+ (for local development)
- At least 8GB of available RAM (for running Ollama with LLM models)

## 🛠️ Technical Stack

- **LLM Inference**: Ollama with llama3.2:1b, qwen3:0.6b models
- **Vector Store**: ChromaDB with persistence
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 via ONNX
- **Backend**: FastAPI, Pydantic
- **Frontend**: React, TypeScript, Vite
- **Container**:Docker, Debian slim base

## 🏃 Quick Start

### Development Mode

#### Option 1: Docker (Recommended - Everything included)
```bash
# Clone the repo
git clone https://github.com/AImaginationLab/vulnerable-llms.git
cd vulnerable-llms

# Start the full stack (frontend + backend + Ollama)
docker-compose -f docker-compose.override.yml up

# Access the app at http://localhost:3000
# Backend API available at http://localhost:5000
# Ollama LLM service at http://localhost:11434
```

#### Option 2: Local Development
```bash
# Install dependencies
npm ci                    # Install root dependencies (TypeScript, tsx)
npm run install:frontend  # Install frontend dependencies
npm run install:backend   # Install Python backend dependencies

# Start React development server (with hot reload)
npm run dev

# In separate terminal, start Python backend:
cd backend && python main.py

# Access the app at http://localhost:3000
```

### Production Mode
```bash
# Option 1: Docker (Recommended)
docker-compose up --build

# Option 2: Manual build and serve
npm run build              # Build React app
npm run build:server       # Compile Express server
npm run start:http         # Start production server
```

## 🎮 What You Can Do

### Available Demos

Learn through hands-on experimentation with:

- **Prompt Injection** (LLM01): Bypass system instructions and security controls
- **Indirect Prompt Injection** (LLM01-RAG): Poison external data sources
- **Sensitive Information Disclosure** (LLM02): Extract data the model shouldn't reveal
- **Insecure Output Handling** (LLM05): Generate malicious payloads through model outputs
- **Excessive Agency** (LLM06): Discover and exploit overprivileged tool access
- **System Prompt Leakage** (LLM07): Extract hidden instructions and configuration
- **Vector/Embedding Attacks** (LLM08): Invert embeddings to recover source text
- **Misinformation** (LLM09): Generate false but convincing content
- **Resource Exhaustion** (LLM10): DoS through computational complexity

## 🛠️ Development

### Local Development Setup

```bash
# 1. Install all dependencies
npm ci                    # Root dependencies (TypeScript, tsx)
npm run install:frontend  # Frontend dependencies
npm run install:backend   # Python backend dependencies

# 2. Frontend Development (React with Vite)
npm run dev            # Start React dev server with hot reload
npm run dev:http       # Start React dev server on all interfaces
npm run build          # Build React app for production

# 3. Frontend Production Server (Express with tsx)
npm run build:server   # Compile Express server TypeScript
npm run server:dev     # Run Express server for serving built React app
npm run start:http     # Run compiled Express server

# 4. Backend (Python - separate terminal)
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend && python main.py

# 5. Full Docker stack (includes Ollama LLM service)
docker-compose -f docker-compose.override.yml up
```

## 🧪 Running Tests

```bash
# Run all tests (backend + frontend linting + type checking + unit tests)
npm run test:all

# Run individual test suites
npm run test:backend      # Python/FastAPI tests
npm run test:frontend     # Frontend unit tests (vitest)
npm run lint             # ESLint checks
npm run typecheck        # TypeScript validation
```

### Test Requirements

For backend tests, you need Python dependencies installed:
```bash
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt
```

## 🔒 Security & Ethics

**⚠️ Educational Use Only**

This tool demonstrates real vulnerabilities. Use it only:
- In authorized environments you control
- For education and authorized security testing
- Following responsible disclosure practices

The application runs completely offline with no external dependencies, ensuring a safe testing environment.

## 🚨 Troubleshooting

### Common Issues

**ChromaDB compilation errors on macOS:**
```bash
# Set proper SDK path and try again
export SDKROOT=$(xcrun --show-sdk-path)
export CPLUS_INCLUDE_PATH="$SDKROOT/usr/include/c++/v1:$SDKROOT/usr/include"
pip install -r requirements.txt
```

**Docker startup behavior:**
- Backend health check passes in ~7 seconds (FastAPI starts quickly)
- RAG components (ML models) load asynchronously in background (~10 more seconds)
- Frontend starts immediately after backend health check passes
- First Ollama startup downloads LLM model (~1.5GB), subsequent runs are faster

**If Docker startup fails:**
- Ensure you have at least 8GB RAM available
- On slower machines, ML model loading may take longer but won't block startup

## 🤝 Contributing

We welcome contributions! Areas of interest:

- Additional vulnerability demonstrations
- New attack patterns and strategies
- UI/UX improvements
- Support for more LLM models
- Enhanced reporting features

## License

MIT License - See LICENSE file

---

**Ready to explore AI security?**
- **Docker Development**: `docker-compose -f docker-compose.override.yml up` → http://localhost:3000
- **Local Development**: `npm run dev` → http://localhost:3000
- **Production**: `docker-compose up --build` → http://localhost:3000 🚀
