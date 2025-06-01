import React, { ButtonHTMLAttributes } from 'react';
import { COLORS, TRANSITIONS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-lg font-medium inline-flex items-center justify-center transition-all';

  const variantClasses = {
    primary: `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300`,
    secondary: `bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 disabled:bg-secondary-300`,
    accent: `bg-accent-500 text-neutral-900 hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-300`,
    outline: `bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:border-primary-300 disabled:text-primary-300`,
    ghost: `bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-300`,
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    loading ? 'opacity-80 cursor-not-allowed' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current" />
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' ? (
        <span className="ml-2">{icon}</span>
      ) : null}
    </button>
  );
};

export default Button;