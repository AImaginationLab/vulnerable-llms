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
# Clone and run
git clone <repository-url>
cd vulnerable-llms
docker-compose up -d

# Access the app
open http://localhost:3000
```

That's it! The app will download Ollama and the LLM model automatically (first run takes ~10 minutes).

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
# Use the dev compose file for hot reloading
docker-compose -f docker-compose.dev.yml up

# Frontend runs on :3000, Backend on :5000
# Changes auto-reload in both services
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

**Ready to explore AI security?** Start with `docker-compose up` and visit http://localhost:3000 🚀
