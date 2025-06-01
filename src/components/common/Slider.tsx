import React, { useState, useEffect } from 'react';
import { COLORS } from '../../constants/theme';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  fullWidth?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  defaultValue,
  value: propValue,
  onChange,
  label,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '',
  fullWidth = false,
}) => {
  const [value, setValue] = useState<number>(propValue || defaultValue || min);

  useEffect(() => {
    if (propValue !== undefined) {
      setValue(propValue);
    }
  }, [propValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  // Calculate the percentage position for the slider thumb
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-neutral-800">{label}</label>
          {showValue && (
            <span className="text-sm font-medium text-primary-600">
              {valuePrefix}{value}{valueSuffix}
            </span>
          )}
        </div>
      )}
      
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="appearance-none w-full h-2 bg-neutral-200 rounded-full cursor-pointer accent-primary-600 focus:outline-none"
          style={{
            background: `linear-gradient(to right, ${COLORS.primary[500]} 0%, ${COLORS.primary[500]} ${percentage}%, #e5e5e5 ${percentage}%, #e5e5e5 100%)`
          }}
        />
        <style jsx>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid ${COLORS.primary[500]};
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          input[type=range]::-webkit-slider-thumb:hover {
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            background: ${COLORS.primary[50]};
          }
          
          input[type=range]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid ${COLORS.primary[500]};
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          input[type=range]::-moz-range-thumb:hover {
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            background: ${COLORS.primary[50]};
          }
        `}</style>
      </div>
    </div>
  );
};

export default Slider;