import React, { useState } from 'react';
import { MapPin, Users, Compass, DollarSign } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Slider from '../common/Slider';
import RadioGroup from '../common/RadioGroup';
import Card from '../common/Card';
import { UserPreferences, BudgetRange, ActivityVibe, TravelDistance } from '../../types';

interface SurpriseFormProps {
  onSubmit: (preferences: UserPreferences) => void;
}

const SurpriseForm: React.FC<SurpriseFormProps> = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    startLocation: '',
    groupSize: 1,
    budgetRange: 'moderate' as BudgetRange,
    travelDistance: { value: 5, unit: 'miles' },
    activityVibe: 'mixed' as ActivityVibe,
    indoorBackup: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error if field has one
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!preferences.startLocation.trim()) {
      newErrors.startLocation = 'Location is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(preferences);
  };
  
  const budgetOptions = [
    { 
      value: 'budget', 
      label: 'Budget-friendly', 
      description: '£0-50 for the day',
      icon: <DollarSign className="h-5 w-5" />
    },
    { 
      value: 'moderate', 
      label: 'Moderate', 
      description: '£50-150 for the day',
      icon: <DollarSign className="h-5 w-5" />
    },
    { 
      value: 'premium', 
      label: 'Treat Yourself', 
      description: '£150+ for the day',
      icon: <DollarSign className="h-5 w-5" />
    },
  ];
  
  const vibeOptions = [
    { value: 'relaxing', label: 'Relaxing' },
    { value: 'adventurous', label: 'Adventurous' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'active', label: 'Active' },
    { value: 'mixed', label: 'Mix It Up' },
  ];
  
  const travelUnitOptions = [
    { value: 'miles', label: 'Miles' },
    { value: 'hours', label: 'Hours' },
  ];

  return (
    <Card className="max-w-xl w-full mx-auto">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">Surprise Adventure</h2>
      <p className="text-neutral-600 mb-6">
        Tell us a little about what you're looking for, and we'll create a surprise itinerary just for you!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-medium">
            <MapPin className="h-5 w-5" />
            <span>Starting Location</span>
          </div>
          
          <Input
            type="text"
            placeholder="Enter city, town, or postcode"
            value={preferences.startLocation}
            onChange={(e) => handleChange('startLocation', e.target.value)}
            error={errors.startLocation}
            fullWidth
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-medium">
            <Users className="h-5 w-5" />
            <span>Group Size</span>
          </div>
          
          <Slider
            min={1}
            max={10}
            value={preferences.groupSize}
            onChange={(value) => handleChange('groupSize', value)}
            fullWidth
            valueSuffix={preferences.groupSize > 1 ? ' people' : ' person'}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-medium">
            <Compass className="h-5 w-5" />
            <span>Travel Willingness</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-grow">
              <Slider
                min={1}
                max={preferences.travelDistance.unit === 'miles' ? 30 : 5}
                step={preferences.travelDistance.unit === 'miles' ? 1 : 0.5}
                value={preferences.travelDistance.value}
                onChange={(value) => handleChange('travelDistance', {
                  ...preferences.travelDistance,
                  value
                })}
                fullWidth
                valuePrefix="Up to "
                valueSuffix={` ${preferences.travelDistance.unit}`}
              />
            </div>
            
            <div className="w-24">
              <select 
                value={preferences.travelDistance.unit}
                onChange={(e) => handleChange('travelDistance', {
                  ...preferences.travelDistance,
                  unit: e.target.value as 'miles' | 'hours'
                })}
                className="w-full border-2 border-neutral-300 rounded-md p-2"
              >
                {travelUnitOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-medium">
            <DollarSign className="h-5 w-5" />
            <span>Budget Range</span>
          </div>
          
          <RadioGroup
            options={budgetOptions}
            value={preferences.budgetRange}
            onChange={(value) => handleChange('budgetRange', value)}
            name="budget"
            card
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-600 font-medium">
            <Compass className="h-5 w-5" />
            <span>Basic Vibe</span>
          </div>
          
          <RadioGroup
            options={vibeOptions}
            value={preferences.activityVibe || 'mixed'}
            onChange={(value) => handleChange('activityVibe', value)}
            name="vibe"
            vertical={false}
          />
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="indoor-backup"
            checked={preferences.indoorBackup}
            onChange={(e) => handleChange('indoorBackup', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="indoor-backup" className="ml-2 block text-sm text-neutral-700">
            Include indoor backup options if weather is bad
          </label>
        </div>
        
        <Button 
          type="submit" 
          fullWidth
          variant="primary"
          size="lg"
          className="mt-6"
        >
          Create My Surprise Day!
        </Button>
      </form>
    </Card>
  );
};

export default SurpriseForm;