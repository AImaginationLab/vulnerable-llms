import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'demo' | 'attack';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'demo':
        return 'demo-button';
      case 'attack':
        return 'attack-button';
      case 'danger':
        return 'button button-danger';
      case 'success':
        return 'button button-success';
      case 'secondary':
        return 'button button-secondary';
      default:
        return 'button button-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'button-small';
      case 'large':
        return 'button-large';
      default:
        return '';
    }
  };

  const classes = [
    getVariantClass(),
    getSizeClass(),
    fullWidth ? 'button-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {loading ? (
        <>🔄 Loading...</>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;