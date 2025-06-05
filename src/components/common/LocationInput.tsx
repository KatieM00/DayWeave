import React from 'react';
import { MapPin } from 'lucide-react';
import Input from './Input';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  fullWidth?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location",
  error,
  label,
  fullWidth = false
}) => {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${placeholder} (Google Maps integration coming soon)`}
        error={error}
        label={label}
        fullWidth={fullWidth}
        icon={<MapPin className="h-5 w-5 text-neutral-400" />}
      />
    </div>
  );
};

export default LocationInput;