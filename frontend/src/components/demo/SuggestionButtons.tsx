import React from 'react';

interface SuggestionButtonsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
  title?: string;
  maxDisplay?: number;
  className?: string;
}

const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({
  suggestions,
  onSelect,
  disabled = false,
  title = '💡 Quick Suggestions',
  maxDisplay = 6,
  className = '',
}) => {
  const [showAll, setShowAll] = React.useState(false);
  
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const displaySuggestions = showAll ? suggestions : suggestions.slice(0, maxDisplay);
  const hasMore = suggestions.length > maxDisplay;

  return (
    <div className={`suggestion-section ${className}`}>
      <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h4>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: hasMore ? '16px' : '0'
      }}>
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            title={suggestion} // Full text on hover
            style={{
              color: 'white',
              textDecoration: 'none',
              background: 'rgba(99, 102, 241, 0.8)',
              padding: '10px 14px',
              borderRadius: '6px',
              fontWeight: '600',
              border: '1px solid rgba(99, 102, 241, 0.9)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              opacity: disabled ? 0.5 : 1,
              display: 'block',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            💡 {suggestion.length > 35 ? `${suggestion.substring(0, 35)}...` : suggestion}
          </button>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {showAll ? '▲ Show Less' : `▼ Show ${suggestions.length - maxDisplay} More`}
          </button>
        </div>
      )}
    </div>
  );
};

export default SuggestionButtons;