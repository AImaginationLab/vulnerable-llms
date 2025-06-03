import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const location = useLocation();

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
    <div className="sidebar">
      <h2 style={{ marginTop: 0, color: '#333' }}>OWASP LLM Top 10 2025</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        AI Security Demonstration
      </p>
      
      <ul className="vulnerability-list">
        <li className="vulnerability-item">
          <Link 
            to="/" 
            className={`vulnerability-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 Homepage
          </Link>
        </li>
        
        {vulnerabilities.map((vuln) => (
          <li key={vuln.id} className="vulnerability-item">
            <Link 
              to={`/${vuln.id}`} 
              className={`vulnerability-link ${vuln.has_demo ? 'has-demo' : ''} ${
                location.pathname === `/${vuln.id}` ? 'active' : ''
              }`}
            >
              {vuln.name}
              <span className={vuln.has_demo ? 'demo-badge' : 'explanation-badge'}>
                {vuln.has_demo ? 'DEMO' : 'INFO'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '32px', padding: '16px', background: '#fff3cd', borderRadius: '6px', fontSize: '12px' }}>
        <strong>⚠️ Warning:</strong> This application demonstrates real security vulnerabilities for educational purposes. Run only in isolated environments.
      </div>
    </div>
  );
};

export default Sidebar;