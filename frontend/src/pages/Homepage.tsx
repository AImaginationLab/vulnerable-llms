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
      
      <div style={{ 
        background: 'linear-gradient(135deg, var(--danger-color) 0%, #ff6b35 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(220, 53, 69, 0.3)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>
          🤖 REAL AI ATTACK AUTOMATION
        </h2>
        <p style={{ fontSize: '18px', margin: '0 0 20px 0', opacity: 0.9 }}>
          First demo app with <strong>actual promptfoo integration</strong> - watch AI automatically break through LLM defenses!
        </p>
        <Link 
          to="/auto-attack"
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.9)',
            color: 'var(--danger-color)',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'white';
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.9)';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          🚀 LAUNCH AUTO ATTACK SESSION
        </Link>
      </div>

      <div className="demo-section">
        <h3>🎯 Purpose</h3>
        <p>
          This application demonstrates key vulnerabilities from the OWASP Top 10 for LLM Applications (2025) 
          by providing interactive examples and clear explanations. Each vulnerability is explored through 
          either a live demonstration using a local LLM or comprehensive educational content.
        </p>
        
        <p>
          <strong>Target Audience:</strong> Security professionals, developers, and anyone interested in 
          understanding AI security risks and mitigations.
        </p>

        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>✨ What's New</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            <li><strong>Real Promptfoo Integration:</strong> Uses actual promptfoo CLI to generate sophisticated attacks</li>
            <li><strong>Automated Attack Sessions:</strong> Watches AI automatically escalate attacks until breakthrough</li>
            <li><strong>Live Success Detection:</strong> Real-time analysis when system prompts are compromised</li>
            <li><strong>Multiple Themes:</strong> Light, Dark, and Matrix-style Hacker modes</li>
          </ul>
        </div>
      </div>

      <div className="demo-section">
        <h3>📋 Vulnerability Overview</h3>
        <p>The OWASP LLM Top 10 2025 includes the following vulnerabilities:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {vulnerabilities.map((vuln, index) => (
            <Link 
              key={vuln.id} 
              to={`/${vuln.id}`} 
              style={{ textDecoration: 'none' }}
            >
              <div style={{ 
                padding: '16px', 
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${vuln.has_demo ? 'var(--success-color)' : 'var(--text-muted)'}`,
                transition: 'all var(--transition-speed) ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  LLM{String(index + 1).padStart(2, '0')}:2025 {vuln.name}
                </h4>
                <span className={vuln.has_demo ? 'demo-badge' : 'explanation-badge'}>
                  {vuln.has_demo ? '🔴 LIVE DEMO' : '📚 EXPLANATION'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="demo-section">
        <h3>🚀 Getting Started</h3>
        <p>
          Click on any vulnerability above to explore it. Vulnerabilities marked with 
          <span className="demo-badge" style={{ margin: '0 4px' }}>LIVE DEMO</span> 
          include interactive demonstrations against a local LLM instance.
        </p>
        
        <p>
          Those marked with 
          <span className="explanation-badge" style={{ margin: '0 4px' }}>EXPLANATION</span> 
          provide comprehensive educational content with examples and mitigation strategies.
        </p>
      </div>

      <div className="demo-section">
        <h3>⚠️ Disclaimer</h3>
        <div className="alert-danger">
          <strong>Educational Use Only:</strong> This application is designed for educational and training 
          purposes only. The vulnerabilities demonstrated should never be used against systems you do not 
          own or have explicit permission to test. Always practice responsible disclosure and ethical 
          security research.
        </div>
      </div>
    </div>
  );
};

export default Homepage;
