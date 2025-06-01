import React from 'react';
import { COLORS } from '../../constants/theme';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface RadioGroupProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  vertical?: boolean;
  card?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  vertical = false,
  card = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      {label && <div className="mb-2 text-sm font-medium text-neutral-800">{label}</div>}
      
      <div className={`flex ${vertical ? 'flex-col gap-3' : 'flex-wrap gap-3'}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const id = `${name}-${option.value}`;
          
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`
                relative 
                ${card ? 'block' : 'inline-flex items-center'} 
                ${card ? 'p-3 rounded-lg border-2' : ''}
                ${card && isSelected ? 'border-primary-500 bg-primary-50' : card ? 'border-neutral-200 bg-white' : ''}
                ${card && isSelected ? 'shadow-sm' : ''}
                ${card ? 'cursor-pointer transition-all hover:border-primary-300' : ''}
                ${vertical && !card ? 'mb-2' : ''}
              `}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={handleChange}
                className={`
                  ${card ? 'sr-only' : 'mr-2'}
                  accent-primary-600
                `}
              />
              
              <div className={card ? 'flex items-start gap-3' : ''}>
                {option.icon && (
                  <div className={`
                    ${card ? 'mt-1 text-primary-600' : 'mr-2'} 
                    ${isSelected ? 'text-primary-600' : 'text-neutral-500'}
                  `}>
                    {option.icon}
                  </div>
                )}
                
                <div>
                  <div className={`
                    font-medium 
                    ${isSelected ? 'text-primary-800' : 'text-neutral-700'}
                  `}>
                    {option.label}
                  </div>
                  
                  {option.description && (
                    <div className="text-sm text-neutral-500 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
              
              {card && isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;