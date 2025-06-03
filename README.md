# AI Security Demonstration Application

**Learning AI Security by Doing Bad Things to Ourselves**

A comprehensive educational application demonstrating the OWASP Top 10 for LLM Applications (2025) through interactive examples and clear explanations.

## 🎯 Purpose

This application serves as a practical educational tool for security professionals, developers, and anyone interested in understanding AI security risks. It provides:

- **Live Demonstrations**: Interactive examples of LLM vulnerabilities using a local LLM instance
- **Educational Content**: Comprehensive explanations of attack vectors and mitigation strategies  
- **Hands-on Learning**: Real-world scenarios that illustrate how vulnerabilities can be exploited
- **Safe Environment**: Completely local setup with no external dependencies or risks

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- At least 8GB of available RAM (for running Ollama with LLM models)
- Port 5000 and 11434 available on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vulnerable-llms
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Wait for setup to complete**
   - The first run will download the Ollama image and LLama2 model (~4GB)
   - This may take 10-15 minutes depending on your internet connection
   - Look for "Flask app running" and "Ollama server ready" messages

4. **Access the application**
   - Open your browser to `http://localhost:5000`
   - The application will be ready when both services are running

### Quick Verification

Test that everything is working:
```bash
# Test Ollama is running
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Hello world",
  "stream": false
}'

# Test the web application
curl http://localhost:5000/api/v1/2025/vulnerabilities
```

## 📋 OWASP LLM Top 10 2025 Coverage

| ID | Vulnerability | Demo Type | Status |
|----|---------------|-----------|---------|
| LLM01 | Prompt Injection | 🔴 Live Demo | ✅ Complete |
| LLM02 | Sensitive Information Disclosure | 🔴 Live Demo | ✅ Complete |
| LLM03 | Supply Chain Vulnerabilities | 📚 Explanation | ✅ Complete |
| LLM04 | Data and Model Poisoning | 📚 Explanation | ✅ Complete |
| LLM05 | Improper Output Handling | 🔴 Live Demo | ✅ Complete |
| LLM06 | Excessive Agency | 🔴 Live Demo | ✅ Complete |
| LLM07 | System Prompt Leakage | 🔴 Live Demo | ✅ Complete |
| LLM08 | Vector and Embedding Weaknesses | 📚 Explanation | ✅ Complete |
| LLM09 | Misinformation | 🔴 Live Demo | ✅ Complete |
| LLM10 | Unbounded Consumption | 🔴 Live Demo | ✅ Complete |

## 🔴 Live Demonstrations

### LLM01: Prompt Injection
- **Scenario**: Secret instruction bot bypass
- **Attack**: Override system prompts to extract confidential information
- **Learning**: Understanding how prompt injection bypasses safety measures

### LLM02: Sensitive Information Disclosure  
- **Scenario**: Confidential context leakage
- **Attack**: Extract sensitive user data from LLM context
- **Learning**: Risks of including sensitive data in LLM prompts

### LLM05: Improper Output Handling
- **Scenario**: HTML/JavaScript injection via LLM output
- **Attack**: Inject malicious scripts through LLM responses
- **Learning**: Importance of sanitizing LLM outputs before rendering

### LLM06: Excessive Agency
- **Scenario**: Simulated filesystem management
- **Attack**: Trick LLM into deleting critical system files
- **Learning**: Principle of least privilege for AI agents

### LLM07: System Prompt Leakage
- **Scenario**: Extract hidden system prompts
- **Attack**: Use various techniques to reveal confidential instructions
- **Learning**: Protecting intellectual property in system prompts

### LLM09: Misinformation
- **Scenario**: Demonstrate LLM hallucinations
- **Attack**: Ask questions that lead to false information
- **Learning**: Importance of fact-checking LLM outputs

### LLM10: Unbounded Consumption
- **Scenario**: Resource exhaustion attack
- **Attack**: Send computationally expensive prompts
- **Learning**: Need for rate limiting and resource controls

## 📚 Educational Content

Comprehensive explanations covering:

### LLM03: Supply Chain Vulnerabilities
- Training data compromises
- Malicious model dependencies  
- Infrastructure attacks
- Mitigation strategies

### LLM04: Data and Model Poisoning
- Backdoor attacks in training data
- Bias injection techniques
- Detection methods
- Robust training practices

### LLM08: Vector and Embedding Weaknesses
- RAG system vulnerabilities
- Vector database security
- Embedding model attacks
- Retrieval manipulation

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Flask Backend  │
│   (Port 5000)    │◄──►│  API Endpoints  │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Ollama      │
                       │   (Port 11434)  │
                       │   LLama2 Model  │
                       └─────────────────┘
```

### Components

- **Frontend**: React application with routing and interactive demo components
- **Backend**: Flask API serving demo endpoints and educational content
- **LLM Engine**: Ollama running LLama2 for local inference
- **Content**: Markdown files with educational material

## 🛠️ Development

### Project Structure

```
vulnerable-llms/
├── docker-compose.yml          # Orchestration
├── Dockerfile                  # Application container
├── requirements.txt            # Python dependencies
├── backend/                    # Flask application
│   ├── app.py                 # Main Flask app
│   ├── api.py                 # API endpoints
│   └── content_loader.py      # Content management
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   └── App.js            # Main app component
│   └── package.json          # Node dependencies
└── content/                    # Educational content
    ├── LLM03_2025.md          # Supply chain vulnerabilities
    ├── LLM04_2025.md          # Data poisoning
    └── LLM08_2025.md          # Vector weaknesses
```

### Local Development

1. **Backend Development**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   FLASK_APP=app.py FLASK_ENV=development flask run
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Content Updates**
   - Edit markdown files in `content/` directory
   - Restart backend to reload content
   - Content is served via `/api/v1/2025/content/<vulnerability_id>`

### Adding New Vulnerabilities

1. **Backend**: Add API endpoint in `api.py`
2. **Frontend**: Create page component in `pages/`
3. **Content**: Add markdown file in `content/`
4. **Routing**: Update `App.js` with new route

## ⚠️ Security and Ethics

### Educational Use Only

This application is designed **exclusively for educational and training purposes**. The vulnerabilities demonstrated:

- Should **never** be used against systems you don't own
- Require **explicit permission** for any testing
- Must follow **responsible disclosure** practices
- Should adhere to **ethical security research** guidelines

### Safe Environment

- **Completely Local**: No external network dependencies
- **Isolated Execution**: Runs in Docker containers
- **No Data Persistence**: No sensitive data stored
- **Controlled Scope**: Limited to demonstration scenarios

### Responsible Usage

- Use only in **authorized training environments**
- Ensure **proper supervision** during demonstrations
- Follow your organization's **security policies**
- Report any **actual vulnerabilities** through proper channels

## 🎤 Presentation Guide

### Talk Structure

1. **Introduction (5 min)**
   - AI security landscape overview
   - OWASP LLM Top 10 importance
   - Demo application introduction

2. **Live Demonstrations (30 min)**
   - Pick 3-4 most impactful demos
   - Show attack → impact → mitigation
   - Engage audience with interactive elements

3. **Key Takeaways (10 min)**
   - Common vulnerability patterns
   - Mitigation strategies
   - Implementation recommendations

### Demo Tips

- **Test Beforehand**: Verify all demos work with your setup
- **Have Backups**: Prepare screenshots in case of technical issues  
- **Engage Audience**: Ask them to suggest attack inputs
- **Focus on Impact**: Emphasize business/security consequences
- **Provide Solutions**: Always end with mitigation strategies

## 🔧 Troubleshooting

### Common Issues

**Ollama Not Starting**
```bash
# Check logs
docker-compose logs ollama

# Restart services
docker-compose restart
```

**Frontend Build Fails**
```bash
# Clear npm cache
cd frontend && npm cache clean --force

# Rebuild
docker-compose up --build
```

**Port Conflicts**
```bash
# Check port usage
lsof -i :5000
lsof -i :11434

# Modify ports in docker-compose.yml if needed
```

**Model Download Issues**
- Ensure stable internet connection
- Allow 10-15 minutes for initial model download
- Check available disk space (need ~8GB)

### Performance Optimization

- **Memory**: Increase Docker memory limit to 8GB+
- **CPU**: More cores = faster LLM inference
- **Storage**: SSD recommended for model loading

## 📄 License

This project is released under the MIT License. See LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Areas for Contribution

- Additional vulnerability demonstrations
- Enhanced educational content
- UI/UX improvements  
- Performance optimizations
- Additional LLM model support

## 📞 Support

- **Issues**: Report bugs or feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security issues privately to maintainers

---

**Disclaimer**: This application contains intentional security vulnerabilities for educational purposes. Use responsibly and only in authorized environments.