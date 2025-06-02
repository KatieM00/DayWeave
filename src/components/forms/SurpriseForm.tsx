import React, { useState } from 'react';
import { MapPin, Users, Compass, DollarSign, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { UserPreferences, BudgetRange, ActivityVibe, TravelDistance } from '../../types';

interface SurpriseFormProps {
  onSubmit: (preferences: UserPreferences) => void;
}

const SurpriseForm: React.FC<SurpriseFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    startLocation: '',
    groupSize: 1,
    budgetRange: 'moderate' as BudgetRange,
    travelDistance: { value: 5, unit: 'miles' },
    activityVibe: [] as ActivityVibe[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleVibeToggle = (vibe: ActivityVibe) => {
    setPreferences(prev => {
      const currentVibes = Array.isArray(prev.activityVibe) ? prev.activityVibe : [];
      const newVibes = currentVibes.includes(vibe)
        ? currentVibes.filter(v => v !== vibe)
        : [...currentVibes, vibe];
      return { ...prev, activityVibe: newVibes };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1 && !preferences.startLocation.trim()) {
      newErrors.startLocation = 'Please enter your starting location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      onSubmit(preferences);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-8">
              Where shall we begin?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary-600 font-medium">
                <MapPin className="h-5 w-5" />
                <span>Where are you starting your adventure from today?</span>
              </div>
              
              <Input
                type="text"
                placeholder="Enter city, town, or postcode"
                value={preferences.startLocation}
                onChange={(e) => handleChange('startLocation', e.target.value)}
                error={errors.startLocation}
                fullWidth
                className="text-lg"
              />
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
              disabled={!preferences.startLocation.trim()}
            >
              Let's Go!
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-8">
              Who's joining the adventure?
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={preferences.groupSize === 1 ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('groupSize', 1)}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <Users className="h-8 w-8" />
                <span>Solo</span>
              </Button>
              
              <Button
                variant={preferences.groupSize === 2 ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('groupSize', 2)}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <Users className="h-8 w-8" />
                <span>Duo</span>
              </Button>
              
              <Button
                variant={preferences.groupSize > 2 ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('groupSize', 4)}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <Users className="h-8 w-8" />
                <span>Group</span>
              </Button>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
            >
              Next
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-8">
              How far shall we roam?
            </h2>
            
            <div className="space-y-6">
              <div className="flex justify-center gap-3 mb-6">
                <Button
                  variant={preferences.travelDistance.unit === 'miles' ? 'primary' : 'outline'}
                  onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, unit: 'miles' })}
                >
                  Miles
                </Button>
                
                <Button
                  variant={preferences.travelDistance.unit === 'hours' ? 'primary' : 'outline'}
                  onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, unit: 'hours' })}
                >
                  Hours
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {[1, 5, 10, 15, 20, 25].map((value) => (
                  <Button
                    key={value}
                    variant={preferences.travelDistance.value === value ? 'primary' : 'outline'}
                    onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, value })}
                    className={value > 15 ? 'col-span-2' : ''}
                  >
                    {value} {preferences.travelDistance.unit}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
            >
              Next
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-8">
              What's your budget looking like?
            </h2>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={preferences.budgetRange === 'budget' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('budgetRange', 'budget')}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <DollarSign className="h-8 w-8" />
                <span className="font-semibold">Budget</span>
                <span className="text-sm">£0-50</span>
              </Button>
              
              <Button
                variant={preferences.budgetRange === 'moderate' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('budgetRange', 'moderate')}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <DollarSign className="h-8 w-8" />
                <span className="font-semibold">Moderate</span>
                <span className="text-sm">£50-150</span>
              </Button>
              
              <Button
                variant={preferences.budgetRange === 'premium' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => handleChange('budgetRange', 'premium')}
                className="aspect-square flex flex-col items-center justify-center gap-2"
              >
                <DollarSign className="h-8 w-8" />
                <span className="font-semibold">Premium</span>
                <span className="text-sm">£150+</span>
              </Button>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
            >
              Next
            </Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-8">
              What kind of vibe are you after?
            </h2>
            <p className="text-center text-neutral-600 mb-6">
              Choose as many as you like!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'relaxing', label: 'Relaxing', icon: Sparkles },
                { value: 'adventurous', label: 'Adventurous', icon: Compass },
                { value: 'cultural', label: 'Cultural', icon: Sparkles },
                { value: 'active', label: 'Active', icon: Users },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = Array.isArray(preferences.activityVibe) && 
                  preferences.activityVibe.includes(option.value as ActivityVibe);
                
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => handleVibeToggle(option.value as ActivityVibe)}
                    className="aspect-square flex flex-col items-center justify-center gap-2"
                  >
                    <Icon className="h-8 w-8" />
                    <span>{option.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={!Array.isArray(preferences.activityVibe) || preferences.activityVibe.length === 0}
            >
              Create My Surprise Day!
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-xl w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${step === stepNumber ? 'w-8 bg-primary-600' : 
                  step > stepNumber ? 'bg-primary-300' : 'bg-neutral-200'}
              `}
            />
          ))}
        </div>
        <span className="text-sm text-neutral-500">Step {step} of 5</span>
      </div>
      
      {renderStepContent()}
    </Card>
  );
};

export default SurpriseForm;