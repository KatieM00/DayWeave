import React, { useState } from 'react';
import { MapPin, Users, Clock, Compass, DollarSign, Activity } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Slider from '../common/Slider';
import RadioGroup from '../common/RadioGroup';
import Card from '../common/Card';
import { 
  UserPreferences, 
  BudgetRange, 
  ActivityType,
  TransportMode,
  AgeRestriction,
  TravelDistance
} from '../../types';

interface DetailedFormProps {
  onSubmit: (preferences: UserPreferences) => void;
}

const DetailedForm: React.FC<DetailedFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    startLocation: '',
    endLocation: '',
    startTime: '09:00',
    endTime: '21:00',
    groupSize: 1,
    budgetRange: 'moderate' as BudgetRange,
    travelDistance: { value: 5, unit: 'miles' },
    transportModes: ['walking', 'driving'],
    activityTypes: ['outdoor', 'food', 'culture'],
    ageRestrictions: ['no-restrictions'],
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

  const handleMultiSelectChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    setPreferences(prev => {
      const currentValues = prev[field] as string[] || [];
      let newValues;
      
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(v => v !== value);
      }
      
      return {
        ...prev,
        [field]: newValues
      };
    });
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!preferences.startLocation.trim()) {
        newErrors.startLocation = 'Starting location is required';
      }
    }
    
    if (currentStep === 3) {
      if (!preferences.transportModes || preferences.transportModes.length === 0) {
        newErrors.transportModes = 'Select at least one transport mode';
      }
    }
    
    if (currentStep === 4) {
      if (!preferences.activityTypes || preferences.activityTypes.length === 0) {
        newErrors.activityTypes = 'Select at least one activity type';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      onSubmit(preferences);
    }
  };
  
  const transportOptions: { value: TransportMode; label: string; icon: JSX.Element }[] = [
    { value: 'walking', label: 'Walking', icon: <svg className="w-5 h-5\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2"><path d="M13 4v16m-8-5 8 5 8-5"/></svg> },
    { value: 'cycling', label: 'Cycling', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg> },
    { value: 'driving', label: 'Car', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17h10m-6-8h2m-9 6V10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 15h14m-7-5.5v.01M5 11l-2 4h18l-2-4"/></svg> },
    { value: 'bus', label: 'Bus', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7h8m-8 4h8m-8 4h.01M16 15h.01M19 17h1V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10h1m12 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2m-6 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2m0-4h14v2H4v-2z"/></svg> },
    { value: 'train', label: 'Train', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 16h8M8 16v1M16 16v1m-8-9h8m-4-4H8a2 2 0 0 0-2 2v10m0 0h12M6 16V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10m0 0v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1"/></svg> },
    { value: 'taxi', label: 'Taxi', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M5 17a2 2 0 0 1-2-2M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2M19 17a2 2 0 0 0 2-2m-2 0h2m-2 0-1-7m1 7h-2M7 10h10M7 10l1-7h8l1 7"/></svg> },
  ];
  
  const activityOptions: { value: ActivityType; label: string; icon?: JSX.Element }[] = [
    { value: 'indoor', label: 'Indoor Activities' },
    { value: 'outdoor', label: 'Outdoor Activities' },
    { value: 'nature', label: 'Nature & Parks' },
    { value: 'culture', label: 'Museums & Culture' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'tourist', label: 'Tourist Attractions' },
    { value: 'music', label: 'Music & Concerts' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'movies', label: 'Cinema & Movies' },
    { value: 'theatre', label: 'Theatre & Shows' },
  ];
  
  const ageOptions: { value: AgeRestriction; label: string }[] = [
    { value: 'family-friendly', label: 'Family-friendly' },
    { value: 'adults-only', label: 'Adults only (18+)' },
    { value: 'seniors', label: 'Senior-friendly' },
    { value: 'under-18', label: 'Under 18' },
    { value: 'no-restrictions', label: 'No restrictions' },
  ];
  
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Locations</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>End Location (optional - same as start if left empty)</span>
                </div>
                
                <Input
                  type="text"
                  placeholder="Enter end location if different from start"
                  value={preferences.endLocation}
                  onChange={(e) => handleChange('endLocation', e.target.value)}
                  fullWidth
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Time & People</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Clock className="h-5 w-5" />
                  <span>Time Planning</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={preferences.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">End Time</label>
                    <Input
                      type="time"
                      value={preferences.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      fullWidth
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
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
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Travel Preferences</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Compass className="h-5 w-5" />
                  <span>Maximum Travel Distance</span>
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
                      <option value="miles">Miles</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Activity className="h-5 w-5" />
                  <span>Transportation Modes</span>
                </div>
                
                {errors.transportModes && (
                  <div className="text-error-default text-sm mb-2">{errors.transportModes}</div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {transportOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        flex items-center space-x-2 p-2 border-2 rounded-md cursor-pointer transition-all
                        ${preferences.transportModes?.includes(option.value) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={preferences.transportModes?.includes(option.value)}
                        onChange={(e) => handleMultiSelectChange('transportModes', option.value, e.target.checked)}
                      />
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-1 text-sm">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Activities & Budget</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Activity className="h-5 w-5" />
                  <span>Activity Types</span>
                </div>
                
                {errors.activityTypes && (
                  <div className="text-error-default text-sm mb-2">{errors.activityTypes}</div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        flex items-center space-x-2 p-2 border-2 rounded-md cursor-pointer transition-all
                        ${preferences.activityTypes?.includes(option.value) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={preferences.activityTypes?.includes(option.value)}
                        onChange={(e) => handleMultiSelectChange('activityTypes', option.value, e.target.checked)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <DollarSign className="h-5 w-5" />
                  <span>Budget Range (per person)</span>
                </div>
                
                <RadioGroup
                  options={budgetOptions}
                  value={preferences.budgetRange}
                  onChange={(value) => handleChange('budgetRange', value)}
                  name="budget"
                  card
                />
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Age Restrictions</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Users className="h-5 w-5" />
                  <span>Age Groups</span>
                </div>
                
                <div className="space-y-2">
                  {ageOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        flex items-center space-x-2 p-3 border-2 rounded-md cursor-pointer transition-all block
                        ${preferences.ageRestrictions?.includes(option.value) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={preferences.ageRestrictions?.includes(option.value)}
                        onChange={(e) => handleMultiSelectChange('ageRestrictions', option.value, e.target.checked)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-accent-50 border-l-4 border-accent-500 rounded mt-6">
              <h4 className="font-medium text-accent-800">Ready to plan your perfect day?</h4>
              <p className="text-accent-700 text-sm mt-1">
                We've collected all the information we need to create your personalized itinerary.
                Click "Create My Day Plan" below to see your custom plan!
              </p>
            </div>
          </>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Card className="max-w-xl w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-800">Help Me Plan</h2>
        <p className="text-neutral-600 mt-2">
          Let's build your perfect day together, step by step.
        </p>
      </div>
      
      {/* Progress steps */}
      <div className="flex mb-8 justify-between">
        {[1, 2, 3, 4, 5].map((stepNumber) => (
          <div 
            key={stepNumber}
            className={`relative flex flex-col items-center ${stepNumber < 5 ? 'w-full' : ''}`}
          >
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center z-10
                ${step === stepNumber ? 'bg-primary-600 text-white' : 
                  step > stepNumber ? 'bg-primary-400 text-white' : 'bg-neutral-200 text-neutral-500'}
              `}
            >
              {step > stepNumber ? (
                <svg className="w-5 h-5\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="3\" strokeLinecap="round\" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            
            {/* Progress line */}
            {stepNumber < 5 && (
              <div 
                className={`absolute top-4 left-1/2 h-0.5 w-full transform -translate-y-1/2 ${
                  step > stepNumber ? 'bg-primary-400' : 'bg-neutral-200'
                }`}
              />
            )}
            
            <span className="text-xs mt-2 text-center hidden md:block">
              {stepNumber === 1 && "Locations"}
              {stepNumber === 2 && "Time & People"}
              {stepNumber === 3 && "Travel"}
              {stepNumber === 4 && "Activities"}
              {stepNumber === 5 && "Age Groups"}
            </span>
          </div>
        ))}
      </div>
      
      <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}>
        {renderStepContent()}
        
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            Back
          </Button>
          
          {step < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
            >
              Create My Day Plan
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default DetailedForm;