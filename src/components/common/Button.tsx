import React, { ButtonHTMLAttributes } from 'react';
import { COLORS, TRANSITIONS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

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
    primary: `bg-primary-400 text-white hover:bg-primary-500 active:bg-primary-600 disabled:bg-primary-200`,
    secondary: `bg-secondary-400 text-white hover:bg-secondary-500 active:bg-secondary-600 disabled:bg-secondary-200`,
    accent: `bg-accent-300 text-neutral-900 hover:bg-accent-400 active:bg-accent-500 disabled:bg-accent-100`,
    outline: `bg-transparent border-2 border-primary-400 text-primary-400 hover:bg-primary-50 active:bg-primary-100 disabled:border-primary-200 disabled:text-primary-200`,
    ghost: `bg-transparent text-primary-400 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-200`,
    danger: `bg-error-default text-white hover:bg-error-dark active:bg-error-dark disabled:opacity-50`,
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3 h-8',
    md: 'text-base py-2 px-4 h-10',
    lg: 'text-lg py-2.5 px-6 h-12',
    xl: 'text-xl py-3 px-8 h-14',
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