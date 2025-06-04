import React from 'react';

interface LLMResponseProps {
  response: string;
  isVulnerable?: boolean;
  sensitiveItems?: string[];
  title?: string;
  metadata?: {
    timestamp?: string;
    inputLength?: number;
    processingTime?: number;
    additionalInfo?: string;
  };
}

const LLMResponse: React.FC<LLMResponseProps> = ({
  response,
  isVulnerable = false,
  sensitiveItems = [],
  title = '💬 LLM Response',
  metadata,
}) => {
  const highlightSensitive = (text: string, items: string[]): string => {
    if (!items || items.length === 0) return text;
    
    let highlightedText = text;
    items.forEach(item => {
      const regex = new RegExp(`(${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="highlight-sensitive">$1</span>');
    });
    
    return highlightedText;
  };

  return (
    <div className="output-panel">
      <h4>{title}</h4>
      
      <div className={isVulnerable ? 'response-vulnerable' : 'response-safe'}>
        {sensitiveItems.length > 0 ? (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightSensitive(response, sensitiveItems) 
            }} 
          />
        ) : (
          response
        )}
      </div>
      
      {isVulnerable && sensitiveItems.length > 0 && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          background: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#d32f2f'
        }}>
          <strong>⚠️ Sensitive Data Detected:</strong> {sensitiveItems.join(', ')}
        </div>
      )}
      
      {metadata && (
        <div style={{ 
          marginTop: '8px',
          fontSize: '11px', 
          color: '#999',
          borderTop: '1px solid #eee',
          paddingTop: '8px'
        }}>
          Status: {isVulnerable ? '🚨 VULNERABLE' : '✅ SECURE'}
          {metadata.inputLength && ` | Input: ${metadata.inputLength} chars`}
          {metadata.processingTime && ` | Time: ${metadata.processingTime}s`}
          {metadata.timestamp && ` | ${new Date(metadata.timestamp).toLocaleTimeString()}`}
          {metadata.additionalInfo && ` | ${metadata.additionalInfo}`}
        </div>
      )}
    </div>
  );
};

export default LLMResponse;