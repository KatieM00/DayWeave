import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  const baseClasses = 'rounded-md border-2 border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200';
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-error-default focus:border-error-default focus:ring-error-light' : '';
  
  const inputClasses = [baseClasses, widthClass, errorClass, className].join(' ');

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      
      <input id={inputId} className={inputClasses} {...props} />
      
      {error && (
        <p className="mt-1 text-sm text-error-default">{error}</p>
      )}
    </div>
  );
};

export default Input;