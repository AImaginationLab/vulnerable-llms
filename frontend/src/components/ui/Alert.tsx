import React from 'react';

interface AlertProps {
  type: 'danger' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  title, 
  children, 
  dismissible = false, 
  onDismiss,
  className = ''
}) => {
  const alertClass = `alert-${type}`;
  
  return (
    <div className={`${alertClass} ${className}`} style={{ position: 'relative' }}>
      {dismissible && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
      
      {title && <strong>{title}</strong>}
      {title && <span> </span>}
      {children}
    </div>
  );
};

export default Alert;