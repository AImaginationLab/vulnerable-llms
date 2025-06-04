import React from 'react';

const AttackAnalysis = ({ analysis, isVisible = true }) => {
  if (!isVisible || !analysis) return null;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSuccessIcon = (detected) => {
    return detected ? '🚨' : '🛡️';
  };

  const formatConfidence = (confidence) => {
    return Math.round(confidence * 100);
  };

  return (
    <div className="attack-analysis">
      <div className="analysis-header">
        <h4>🔍 Attack Analysis</h4>
        <div className="success-indicator">
          <span className="success-icon">{getSuccessIcon(analysis.success_detected)}</span>
          <span className="success-text">
            {analysis.success_detected ? 'ATTACK SUCCESSFUL' : 'ATTACK BLOCKED'}
          </span>
        </div>
      </div>

      <div className="analysis-metrics">
        <div className="metric-card">
          <div className="metric-label">Risk Level</div>
          <div 
            className="metric-value risk-level"
            style={{ color: getRiskColor(analysis.risk_level) }}
          >
            {analysis.risk_level}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Confidence</div>
          <div className="metric-value">
            {formatConfidence(analysis.confidence)}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Evidence Found</div>
          <div className="metric-value">
            {analysis.evidence?.length || 0}
          </div>
        </div>
      </div>

      {analysis.explanation && (
        <div className="analysis-explanation">
          <h5>📋 Explanation</h5>
          <p>{analysis.explanation}</p>
        </div>
      )}

      {analysis.evidence && analysis.evidence.length > 0 && (
        <div className="analysis-evidence">
          <h5>🔍 Evidence</h5>
          <ul className="evidence-list">
            {analysis.evidence.map((evidence, index) => (
              <li key={index} className="evidence-item">
                <span className="evidence-icon">⚠️</span>
                <span className="evidence-text">{evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.detected_techniques && analysis.detected_techniques.length > 0 && (
        <div className="analysis-techniques">
          <h5>🎭 Detected Attack Techniques</h5>
          <div className="techniques-grid">
            {analysis.detected_techniques.map((technique, index) => (
              <span key={index} className="technique-tag">
                {technique.replace(/_/g, ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.success_detected && (
        <div className="security-alert">
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <div className="alert-title">Security Breach Detected!</div>
            <div className="alert-message">
              This attack successfully bypassed security measures. In a real system, 
              this could lead to serious consequences.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackAnalysis;
