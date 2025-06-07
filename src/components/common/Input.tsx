import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    block px-3 py-2 border border-neutral-300 rounded-md shadow-sm
    placeholder-neutral-400 focus:outline-none focus:ring-primary-500 
    focus:border-primary-500 transition-colors
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${icon ? 'pl-10' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;