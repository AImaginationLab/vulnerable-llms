import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Homepage = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await axios.get('/api/v1/2025/vulnerabilities');
        setVulnerabilities(response.data);
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error);
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
          This application demonstrates key vulnerabilities from the OWASP Top 10 for LLM Applications (2025) 
          by providing interactive examples and clear explanations. Each vulnerability is explored through 
          either a live demonstration using a local LLM or comprehensive educational content.
        </p>
        
        <p>
          <strong>Target Audience:</strong> Security professionals, developers, and anyone interested in 
          understanding AI security risks and mitigations.
        </p>
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
                background: 'white', 
                border: '1px solid #e9ecef', 
                borderRadius: '8px',
                borderLeft: `4px solid ${vuln.has_demo ? '#28a745' : '#6c757d'}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
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