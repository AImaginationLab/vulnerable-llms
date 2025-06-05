import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const getVariantClass = () => {
    switch (variant) {
      case 'danger':
        return 'card-danger';
      case 'warning':
        return 'card-warning';
      case 'success':
        return 'card-success';
      case 'info':
        return 'card-info';
      default:
        return '';
    }
  };

  const cardClasses = ['card-container', getVariantClass(), className].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {title && (
        <h3 
          style={{ 
            cursor: collapsible ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
        >
          {title}
          {collapsible && (
            <span style={{ fontSize: '14px', opacity: 0.7 }}>
              {isCollapsed ? '▶' : '▼'}
            </span>
          )}
        </h3>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;