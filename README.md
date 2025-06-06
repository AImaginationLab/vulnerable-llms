# Vulnerable LLMs - Interactive AI Security Lab

**Learn AI security by breaking things in a safe environment 🔐**

An interactive security testing platform that demonstrates real vulnerabilities in Large Language Models. Features automated attack generation, live vulnerability demonstrations, and comprehensive educational content based on the OWASP LLM Top 10 2025.

## ✨ Key Features

- **Interactive Demos**: Live vulnerability demonstrations with real LLM responses
- **Automated Attack Testing**: AI-powered attack generation
- **RAG Attack Scenarios**: Indirect prompt injection via web scraping & vector poisoning
- **Attack Analysis**: Learn how and attacks are orchestrated and why they succeed
- **Local Setup**: Docker-based, runs completely offline

## Prerequisites

- Docker + Docker Compose
- Node.js 22+ and npm
- Python 3.11+ (for local development)
- At least 8GB of available RAM (for running Ollama with LLM models)

## 🏃 Quick Start

### Development Mode
```bash
# Clone the repo
git clone <repository-url>
cd vulnerable-llms

# Install dependencies
npm ci                    # Install root dependencies (TypeScript, tsx)
npm run install:frontend  # Install frontend dependencies
npm run install:backend   # Install Python backend dependencies

# Start React development server (with hot reload)
npm run dev

# Access the app at http://localhost:3000
# Backend runs separately: npm run dev:docker (Python at :5000)
```

### Production Mode
```bash
# Build TypeScript frontend
npm run build

# Start production server  
npm run start:http

# Or run full stack with Docker
docker-compose up --build
```

## 🎮 What You Can Do

### Interactive Vulnerability Demos

Experience firsthand how LLM vulnerabilities work:

- **Prompt Injection**: Break through system instructions to extract secrets
- **Indirect Prompt Injection**: Weaponize external data sources (GitHub repos) in RAG systems
- **Vector & Embedding Weaknesses**: Steal and invert embeddings to recover original text
- **Information Disclosure**: Extract sensitive data from LLM context
- **System Prompt Leakage**: Reveal hidden instructions and IP
- **Excessive Agency**: Trick LLMs into dangerous actions
- **Output Handling**: Inject malicious content through LLM responses
- **Resource Exhaustion**: Launch DoS attacks against LLM services

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

# 5. Full Docker stack
npm run dev:docker     # Both frontend + backend
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

**First startup takes forever:**
- Ollama downloads the LLM model (~1.5GB) on first run
- Subsequent startups are much faster

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
- **Development**: `npm run dev:watch` → http://localhost:3000
- **Production**: `npm run build && npm run start:http` → http://localhost:3000 🚀
