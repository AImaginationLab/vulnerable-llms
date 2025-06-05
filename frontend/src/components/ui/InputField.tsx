import React from 'react';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number; // for textarea
  options?: Array<{ value: string | number; label: string }>; // for select
  className?: string;
  id?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  options = [],
  className = '',
  id,
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const renderInput = () => {
    const commonProps = {
      id: inputId,
      value: value.toString(),
      onChange: handleChange,
      placeholder,
      disabled,
      required,
      className: 'form-input',
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type="text"
          />
        );
    }
  };

  return (
    <div className={`input-area ${className}`}>
      <label htmlFor={inputId}>
        {label}
        {required && <span style={{ color: 'var(--danger-color)' }}> *</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default InputField;