import React, { useState } from 'react';

interface Message {
  role: 'user' | 'AI';
  content: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical' | 'pending';
  messageId?: number;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  loading: boolean;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
  buttonText?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  messages,
  loading,
  suggestions = [],
  disabled = false,
  buttonText = 'Send',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || disabled) return;

    const message = inputValue.trim();
    setInputValue('');
    await onSendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div
      style={{
        border: '2px solid var(--border-color)',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Chat Messages Area */}
      <div
        style={{
          minHeight: '240px',
          maxHeight: '420px',
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: 'var(--bg-primary)',
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) transparent',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            <div
              style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}
            >
              💬
            </div>
            <div
              style={{ fontFamily: 'Ubuntu Mono, monospace', fontSize: '14px' }}
            >
              Start a conversation...
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent:
                  message.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
                animation:
                  message.role === 'user'
                    ? 'slideInRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'slideInLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--accent-color)'
                      : message.riskLevel === 'high' ||
                          message.riskLevel === 'critical'
                        ? 'var(--danger-bg)'
                        : message.riskLevel === 'pending'
                          ? 'var(--warning-bg)'
                          : 'var(--bg-tertiary)',
                  color:
                    message.role === 'user'
                      ? 'white'
                      : message.riskLevel === 'high' ||
                          message.riskLevel === 'critical'
                        ? 'var(--danger-text)'
                        : message.riskLevel === 'pending'
                          ? 'var(--warning-text)'
                          : 'var(--text-primary)',
                  borderRadius: '18px',
                  borderBottomRightRadius:
                    message.role === 'user' ? '4px' : '18px',
                  borderBottomLeftRadius:
                    message.role === 'user' ? '18px' : '4px',
                  fontSize: '14px',
                  fontFamily: 'Ubuntu Mono, monospace',
                  lineHeight: '1.5',
                  boxShadow:
                    message.role === 'user'
                      ? '0 2px 8px rgba(0,123,255,0.25)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                  border:
                    message.role === 'user'
                      ? 'none'
                      : message.riskLevel === 'high' ||
                          message.riskLevel === 'critical'
                        ? '1px solid var(--danger-color)'
                        : message.riskLevel === 'pending'
                          ? '1px solid var(--warning-color)'
                          : '1px solid var(--border-color)',
                  wordWrap: 'break-word',
                  position: 'relative',
                  transform: 'translateZ(0)', // Hardware acceleration
                }}
              >
                {message.content}
                {message.role === 'AI' && message.riskLevel === 'pending' && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid var(--warning-color)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'var(--warning-text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--warning-color)',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    ></div>
                    Analyzing security...
                  </div>
                )}
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color:
                      message.role === 'user'
                        ? 'rgba(255,255,255,0.8)'
                        : 'var(--text-muted)',
                    marginTop: '6px',
                    textAlign: message.role === 'user' ? 'right' : 'left',
                    opacity: 0.9,
                  }}
                >
                  {message.role === 'user' ? 'You' : '🤖 AI'}
                  {message.role === 'AI' &&
                    (message.riskLevel === 'high' ||
                      message.riskLevel === 'critical') && (
                      <span
                        style={{
                          marginLeft: '6px',
                          color: 'var(--danger-color)',
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite',
                        }}
                      >
                        ⚠️ Compromised
                      </span>
                    )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                borderRadius: '18px',
                borderBottomLeftRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Ubuntu Mono, monospace',
                fontStyle: 'italic',
                border: '1px solid var(--border-color)',
                animation: 'breathe 2s ease-in-out infinite',
              }}
            >
              <span style={{ animation: 'dots 1.5s infinite' }}>
                🤖 Thinking
              </span>
              ...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            background:
              'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              fontFamily: 'Ubuntu Mono, monospace',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>💡</span>
            Quick prompts:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading || disabled}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Ubuntu Mono, monospace',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  color: 'var(--text-primary)',
                  cursor: disabled || loading ? 'not-allowed' : 'pointer',
                  opacity: disabled || loading ? 0.5 : 1,
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  textAlign: 'left',
                  lineHeight: '1.3',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={e => {
                  if (!disabled && !loading) {
                    (e.target as HTMLElement).style.backgroundColor =
                      'var(--accent-color)';
                    (e.target as HTMLElement).style.color = 'white';
                    (e.target as HTMLElement).style.transform =
                      'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow =
                      '0 4px 12px rgba(0,123,255,0.3)';
                    (e.target as HTMLElement).style.borderColor =
                      'var(--accent-color)';
                  }
                }}
                onMouseLeave={e => {
                  if (!disabled && !loading) {
                    (e.target as HTMLElement).style.backgroundColor =
                      'var(--bg-primary)';
                    (e.target as HTMLElement).style.color =
                      'var(--text-primary)';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow =
                      '0 1px 3px rgba(0,0,0,0.1)';
                    (e.target as HTMLElement).style.borderColor =
                      'var(--border-color)';
                  }
                }}
                onMouseDown={e => {
                  if (!disabled && !loading) {
                    (e.target as HTMLElement).style.transform =
                      'translateY(0) scale(0.98)';
                  }
                }}
                onMouseUp={e => {
                  if (!disabled && !loading) {
                    (e.target as HTMLElement).style.transform =
                      'translateY(-2px) scale(1)';
                  }
                }}
              >
                <span style={{ marginRight: '6px', opacity: 0.7 }}>»</span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            background:
              'linear-gradient(45deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '14px',
                fontSize: '16px',
                opacity: 0.6,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              💬
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              disabled={disabled || loading}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid var(--border-color)',
                borderRadius: '24px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'Ubuntu Mono, monospace',
                outline: 'none',
                opacity: disabled || loading ? 0.5 : 1,
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent-color)';
                e.target.style.boxShadow =
                  'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(0,123,255,0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || disabled || loading}
            style={{
              padding: '12px 20px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor:
                !inputValue.trim() || disabled || loading
                  ? 'var(--bg-tertiary)'
                  : 'var(--accent-color)',
              color:
                !inputValue.trim() || disabled || loading
                  ? 'var(--text-muted)'
                  : 'white',
              fontSize: '14px',
              fontFamily: 'Ubuntu Mono, monospace',
              fontWeight: 'bold',
              cursor:
                !inputValue.trim() || disabled || loading
                  ? 'not-allowed'
                  : 'pointer',
              opacity: !inputValue.trim() || disabled || loading ? 0.5 : 1,
              transition: 'all 0.3s ease',
              boxShadow:
                !inputValue.trim() || disabled || loading
                  ? 'none'
                  : '0 2px 8px rgba(0,123,255,0.3)',
              transform: 'translateY(0)',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => {
              if (inputValue.trim() && !disabled && !loading) {
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLElement).style.boxShadow =
                  '0 4px 16px rgba(0,123,255,0.4)';
              }
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow =
                !inputValue.trim() || disabled || loading
                  ? 'none'
                  : '0 2px 8px rgba(0,123,255,0.3)';
            }}
            onMouseDown={e => {
              if (inputValue.trim() && !disabled && !loading) {
                (e.target as HTMLElement).style.transform =
                  'translateY(0) scale(0.96)';
              }
            }}
            onMouseUp={e => {
              if (inputValue.trim() && !disabled && !loading) {
                (e.target as HTMLElement).style.transform =
                  'translateY(-2px) scale(1)';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{loading ? '⏳' : '🚀'}</span>
            <span>{buttonText}</span>
          </button>
        </div>
      </form>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%) scale(0.8);
              opacity: 0;
            }
            60% {
              transform: translateX(-5%) scale(1.02);
              opacity: 0.8;
            }
            to {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes slideInLeft {
            from {
              transform: translateX(-100%) scale(0.8);
              opacity: 0;
            }
            60% {
              transform: translateX(5%) scale(1.02);
              opacity: 0.8;
            }
            to {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.05);
            }
          }

          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.02);
              opacity: 1;
            }
          }

          @keyframes dots {
            0%, 20% {
              opacity: 1;
            }
            40% {
              opacity: 0.5;
            }
            60% {
              opacity: 1;
            }
            80%, 100% {
              opacity: 0.8;
            }
          }

          /* Custom scrollbar for webkit browsers */
          div::-webkit-scrollbar {
            width: 6px;
          }

          div::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
          }

          div::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
            transition: background 0.3s ease;
          }

          div::-webkit-scrollbar-thumb:hover {
            background: var(--accent-color);
          }

          /* Enhance focus styles */
          input:focus {
            outline: none !important;
          }

          /* Smooth transitions for all interactive elements */
          button, input {
            will-change: transform, box-shadow, background-color;
          }
        `}
      </style>
    </div>
  );
};

export default ChatInterface;
