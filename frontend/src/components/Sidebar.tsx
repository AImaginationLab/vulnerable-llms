import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';
import { Vulnerability } from '../types';

const Sidebar = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine API base URL based on environment
        const apiBase = import.meta.env.DEV
          ? 'http://localhost:5000/api/v1/2025'
          : '/api/v1/2025';
          
        const response = await axios.get(`${apiBase}/vulnerabilities`);
        
        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setVulnerabilities(response.data);
        } else {
          console.error('API response is not an array:', response.data);
          setError('Invalid data format from API');
          // Fallback to empty array
          setVulnerabilities([]);
        }
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error);
        setError('Failed to load vulnerabilities - using offline mode');
        
        // Fallback data if API is not available
        setVulnerabilities([
          { id: 'LLM01_2025', name: 'Prompt Injection', has_demo: true },
          { id: 'LLM02_2025', name: 'Sensitive Information Disclosure', has_demo: true },
          { id: 'LLM05_2025', name: 'Improper Output Handling', has_demo: true },
          { id: 'LLM06_2025', name: 'Excessive Agency', has_demo: true },
        { id: 'LLM07_2025', name: 'System Prompt Leakage', has_demo: true },
        { id: 'LLM08_2025', name: 'Vector and Embedding Weaknesses', has_demo: true },
        { id: 'LLM09_2025', name: 'Misinformation', has_demo: true },
          { id: 'LLM10_2025', name: 'Unbounded Consumption', has_demo: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVulnerabilities();
  }, []);

  return (
    <div className="sidebar">
      <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>OWASP LLM Top 10 2025</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        AI Security Demonstration
      </p>
      
      <ThemeToggle />
      
      <ul className="vulnerability-list">
        <li className="vulnerability-item">
          <Link 
            to="/" 
            className={`vulnerability-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 Homepage
          </Link>
        </li>
        
        <li className="vulnerability-item">
          <Link 
            to="/auto-attack" 
            className={`vulnerability-link has-demo ${location.pathname === '/auto-attack' ? 'active' : ''}`}
          >
            🤖 Auto Attack Session
            <span className="demo-badge">LIVE</span>
          </Link>
        </li>
        
        {loading && (
          <li className="vulnerability-item">
            <div style={{ padding: '10px', color: 'var(--text-secondary)' }}>
              Loading vulnerabilities...
            </div>
          </li>
        )}
        
        {error && (
          <li className="vulnerability-item">
            <div style={{ padding: '10px', color: 'var(--danger-color)' }}>
              {error}
            </div>
          </li>
        )}
        
        {!loading && !error && vulnerabilities.map((vuln) => (
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
      
      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        background: 'var(--warning-color)', 
        color: 'var(--bg-primary)', 
        borderRadius: '6px', 
        fontSize: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <strong>⚠️ Warning:</strong> This application demonstrates real security vulnerabilities for educational purposes. Run only in isolated environments.
      </div>
    </div>
  );
};

export default Sidebar;
