import React from 'react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import SuggestionButtons from './SuggestionButtons';

interface InteractiveDemoProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onRunDemo: () => void;
  loading: boolean;
  buttonText?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  suggestions?: string[];
  children?: React.ReactNode; // for additional controls like attack level selectors
  disabled?: boolean;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  userInput,
  setUserInput,
  onRunDemo,
  loading,
  buttonText = '🚀 Run Demo',
  inputLabel = 'User Input',
  inputPlaceholder = 'Enter your input...',
  suggestions = [],
  children,
  disabled = false,
}) => {
  const handleSuggestionSelect = (suggestion: string) => {
    setUserInput(suggestion);
  };

  return (
    <div className="demo-section">
      <h3>🔴 Interactive Demo</h3>
      
      {children && (
        <div style={{ marginBottom: '16px' }}>
          {children}
        </div>
      )}
      
      <InputField
        label={inputLabel}
        type="textarea"
        value={userInput}
        onChange={(value) => setUserInput(value as string)}
        placeholder={inputPlaceholder}
        disabled={disabled || loading}
        rows={4}
      />

      {suggestions.length > 0 && (
        <SuggestionButtons
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          disabled={disabled || loading}
        />
      )}

      <div style={{ marginTop: '16px' }}>
        <Button
          variant="demo"
          loading={loading}
          disabled={disabled || !userInput.trim()}
          onClick={onRunDemo}
          fullWidth
        >
          {loading ? '🔄 Running...' : buttonText}
        </Button>
      </div>
    </div>
  );
};

export default InteractiveDemo;