# Vulnerable LLMs - Interactive AI Security Lab

**Learn AI security by breaking things in a safe environment 🔐**

An interactive security testing platform that demonstrates real vulnerabilities in Large Language Models. Features automated attack generation, live vulnerability demonstrations, and comprehensive educational content based on the OWASP LLM Top 10 2025.

## ✨ Key Features

- **🤖 Automated Attack Testing**: AI-powered attack generation with promptfoo integration
- **🎯 7 Interactive Demos**: Live vulnerability demonstrations with real LLM responses
- **📈 Progressive Difficulty**: Attack levels from beginner to expert
- **🔍 Real-time Analysis**: See exactly how and why attacks succeed
- **🌙 Modern UI**: TypeScript React app with light/dark/hacker themes
- **🚀 Fast Setup**: Docker-based, runs completely offline

## Prerequisites

- Docker and Docker Compose
- At least 8GB of available RAM (for running Ollama with LLM models)

## 🏃 Quick Start
```bash
# Clone the repo
git clone <repository-url>
cd vulnerable-llms

# Production build & run
cp .env.example .env
npm run build
docker-compose -f docker-compose.yml up --build -d

# Access the backend API
open http://localhost:5000

# Note: first run will download Ollama and the LLM model (~10 minutes).
```

## 🎮 What You Can Do

### Interactive Vulnerability Demos

Experience firsthand how LLM vulnerabilities work:

- **Prompt Injection**: Break through system instructions to extract secrets
- **Information Disclosure**: Extract sensitive data from LLM context
- **System Prompt Leakage**: Reveal hidden instructions and IP
- **Excessive Agency**: Trick LLMs into dangerous actions
- **Output Handling**: Inject malicious content through LLM responses
- **Misinformation**: Generate and detect false information
- **Resource Exhaustion**: Launch DoS attacks against LLM services

### Auto-Attack Mode 🚀

The standout feature - watch AI automatically find vulnerabilities:

1. Navigate to `/auto-attack`
2. Select a vulnerability to test
3. Watch as the system generates increasingly sophisticated attacks
4. Get detailed reports on successful breaches

### Enhanced Attack Mode

For deeper testing on specific vulnerabilities:

- Multiple difficulty levels (Easy → Expert)
- AI-generated attack suggestions
- Real-time success scoring
- Defense recommendations

## 🛠️ Development
 
### Run in Development Mode

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies & start hot-reload servers
npm run install
npm run dev

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 🧪 Running Tests

To run all tests (backend & frontend):

```bash
npm run test
```

## 🔒 Security & Ethics

**⚠️ Educational Use Only**

This tool demonstrates real vulnerabilities. Use it only:
- In authorized environments you control
- For education and authorized security testing
- Following responsible disclosure practices

The application runs completely offline with no external dependencies, ensuring a safe testing environment.

## 🤝 Contributing

We welcome contributions! Areas of interest:

- Additional vulnerability demonstrations
- New attack patterns and strategies
- UI/UX improvements
- Support for more LLM models
- Enhanced reporting features

## 📄 License

MIT License - See LICENSE file

---

**Ready to explore AI security?**
- Development: `npm run dev` → http://localhost:3000
- Production: `npm run build && docker-compose -f docker-compose.yml up -d` → http://localhost:5000 🚀
