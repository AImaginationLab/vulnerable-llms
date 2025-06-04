import React from 'react';
import Button from '../ui/Button';

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
      <h4 style={{ marginBottom: '12px' }}>{title}</h4>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px',
        marginBottom: hasMore ? '12px' : '0'
      }}>
        {displaySuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="secondary"
            size="small"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={suggestion} // Full text on hover
          >
            {suggestion.length > 30 ? `${suggestion.substring(0, 30)}...` : suggestion}
          </Button>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowAll(!showAll)}
            style={{ fontSize: '11px' }}
          >
            {showAll ? '▲ Show Less' : `▼ Show ${suggestions.length - maxDisplay} More`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuggestionButtons;