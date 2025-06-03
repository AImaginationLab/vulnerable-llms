import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ExplanationPage = ({ vulnerabilityId }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`/api/v1/2025/content/${vulnerabilityId}`);
        setContent(response.data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content');
      }
      setLoading(false);
    };

    fetchContent();
  }, [vulnerabilityId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          🔄 Loading content...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert-danger">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="demo-section">
        <div className="alert-success">
          <strong>📚 Educational Content:</strong> This vulnerability is covered through comprehensive 
          explanation and examples rather than a live demonstration.
        </div>
      </div>
      
      <div className="demo-section" style={{ 
        background: 'white', 
        lineHeight: '1.8',
        fontSize: '16px'
      }}>
        <ReactMarkdown
          components={{
            h1: ({children}) => <h1 style={{ color: '#333', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>{children}</h1>,
            h2: ({children}) => <h2 style={{ color: '#495057', marginTop: '32px', marginBottom: '16px' }}>{children}</h2>,
            h3: ({children}) => <h3 style={{ color: '#6c757d', marginTop: '24px', marginBottom: '12px' }}>{children}</h3>,
            p: ({children}) => <p style={{ marginBottom: '16px', color: '#495057' }}>{children}</p>,
            ul: ({children}) => <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>{children}</ul>,
            ol: ({children}) => <ol style={{ marginBottom: '16px', paddingLeft: '24px' }}>{children}</ol>,
            li: ({children}) => <li style={{ marginBottom: '8px', color: '#495057' }}>{children}</li>,
            code: ({children}) => (
              <code style={{ 
                background: '#f8f9fa', 
                padding: '2px 6px', 
                borderRadius: '3px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                {children}
              </code>
            ),
            pre: ({children}) => (
              <pre style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                overflow: 'auto',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {children}
              </pre>
            ),
            blockquote: ({children}) => (
              <blockquote style={{ 
                borderLeft: '4px solid #007bff', 
                paddingLeft: '16px', 
                margin: '16px 0',
                background: '#f8f9fa',
                padding: '12px 16px',
                borderRadius: '0 6px 6px 0'
              }}>
                {children}
              </blockquote>
            )
          }}
        >
          {content?.content_md || 'No content available.'}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ExplanationPage;