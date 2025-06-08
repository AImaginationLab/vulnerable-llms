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
        const response = await axios.get(
          `/api/v1/2025/content/${vulnerabilityId}`
        );
        setContent(response.data.content);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [vulnerabilityId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">🔄 Loading content...</div>
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
          <strong>📚 Educational Content:</strong> This vulnerability is covered
          through comprehensive explanation and examples rather than a live
          demonstration.
        </div>
      </div>

      <div className="demo-section markdown-content">
        <ReactMarkdown>
          {content?.content || 'No content available.'}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ExplanationPage;
