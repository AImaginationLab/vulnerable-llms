import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Homepage = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await axios.get('/api/v1/2025/vulnerabilities');
        if (Array.isArray(response.data)) {
          setVulnerabilities(response.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setVulnerabilities([]);
        }
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error);
        setVulnerabilities([]);
      }
    };

    fetchVulnerabilities();
  }, []);

  return (
    <div className="container">
      <h1>AI Security Demonstration Application</h1>
      <h2>OWASP LLM Top 10 2025</h2>

      <div className="demo-section">
        <h3>🎯 Purpose</h3>
        <p>
          This application demonstrates key vulnerabilities from the OWASP Top
          10 for LLM Applications (2025) by providing interactive examples and
          clear explanations. Each vulnerability is explored through either a
          live demonstration using a local LLM or comprehensive educational
          content.
        </p>

        <p>
          <strong>Target Audience:</strong> Security professionals, developers,
          and anyone interested in understanding AI security risks and
          mitigations.
        </p>

        <div className="feature-box">
          <h4>✨ What's New</h4>
          <ul>
            <li>
              <strong>Real Promptfoo Integration:</strong> Uses actual promptfoo
              CLI to generate sophisticated attacks
            </li>
            <li>
              <strong>Automated Attack Sessions:</strong> Watches AI
              automatically escalate attacks until breakthrough
            </li>
            <li>
              <strong>Live Success Detection:</strong> Real-time analysis when
              system prompts are compromised
            </li>
            <li>
              <strong>Multiple Themes:</strong> Light, Dark, and Matrix-style
              Hacker modes
            </li>
          </ul>
        </div>
      </div>

      <div className="demo-section">
        <h3>📋 Vulnerability Overview</h3>
        <p>The OWASP LLM Top 10 2025 includes the following vulnerabilities:</p>

        <div className="vulnerability-grid">
          {vulnerabilities.map((vuln, index) => (
            <Link
              key={vuln.id}
              to={`/${vuln.id}`}
              className={`vulnerability-card ${vuln.has_demo ? 'has-demo' : 'no-demo'}`}
            >
              <h4>
                LLM{String(index + 1).padStart(2, '0')}:2025 {vuln.name}
              </h4>
              <span
                className={vuln.has_demo ? 'demo-badge' : 'explanation-badge'}
              >
                {vuln.has_demo ? '🔴 LIVE DEMO' : '📚 EXPLANATION'}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <h3>🚀 Getting Started</h3>
        <p>
          Click on any vulnerability above to explore it. Vulnerabilities marked
          with
          <span className="demo-badge">LIVE DEMO</span>
          include interactive demonstrations against a local LLM instance.
        </p>

        <p>
          Those marked with
          <span className="explanation-badge">EXPLANATION</span>
          provide comprehensive educational content with examples and mitigation
          strategies.
        </p>
      </div>

      <div className="demo-section">
        <h3>⚠️ Disclaimer</h3>
        <div className="alert-danger">
          <strong>Educational Use Only:</strong> This application is designed
          for educational and training purposes only. The vulnerabilities
          demonstrated should never be used against systems you do not own or
          have explicit permission to test. Always practice responsible
          disclosure and ethical security research.
        </div>
      </div>
    </div>
  );
};

export default Homepage;
