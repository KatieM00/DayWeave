import React, { ReactNode } from 'react';
import { SHADOWS } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  onClick,
  interactive = false
}) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  const paddingClasses = noPadding ? '' : 'p-4';
  const shadowClasses = 'shadow-md';
  const interactiveClasses = interactive 
    ? 'cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1'
    : '';
    
  const classes = [
    baseClasses, 
    paddingClasses, 
    shadowClasses, 
    interactiveClasses,
    className
  ].join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;