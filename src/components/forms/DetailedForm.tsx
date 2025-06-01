import React, { useState } from 'react';
import { MapPin, Users, Clock, Compass, DollarSign, Activity, Coffee, Wallet } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
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

// Generate time options in 15-minute increments (24-hour format)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 8; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

// Generate distance options from < 1 to 24+
const generateDistanceOptions = () => {
  const options = [
    { value: 0.5, label: '< 1' }
  ];
  
  // Add options from 1 to 24
  for (let i = 1; i <= 24; i++) {
    options.push({ value: i, label: i.toString() });
  }
  
  // Add 24+ option
  options.push({ value: 25, label: '24+' });
  
  return options;
};

const timeOptions = generateTimeOptions();
const distanceOptions = generateDistanceOptions();

const activityOptions = [
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

interface DetailedFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  initialPreferences?: UserPreferences;
  isEditing?: boolean;
}

interface MealPreferences {
  includeCoffee: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
}

const DetailedForm: React.FC<DetailedFormProps> = ({ 
  onSubmit, 
  initialPreferences,
  isEditing = false 
}) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || {
      startLocation: '',
      groupSize: 1,
      budgetRange: '' as BudgetRange,
      travelDistance: { value: 5, unit: 'miles' },
      transportModes: [],
      activityTypes: [],
      ageRestrictions: [],
    }
  );

  const [mealPreferences, setMealPreferences] = useState<MealPreferences>({
    includeCoffee: false,
    includeLunch: false,
    includeDinner: false
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

  const handleMultiSelectChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    setPreferences(prev => {
      const currentValues = prev[field] as string[] || [];
      const newValues = checked 
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      
      return {
        ...prev,
        [field]: newValues
      };
    });
  };

  const handleSelectAllActivities = () => {
    const allActivityValues = activityOptions.map(option => option.value);
    setPreferences(prev => ({
      ...prev,
      activityTypes: allActivityValues
    }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!preferences.startLocation.trim()) {
        newErrors.startLocation = 'Starting location is required';
      }
    }
    
    if (currentStep === 2) {
      if (!preferences.startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!preferences.endTime) {
        newErrors.endTime = 'End time is required';
      }
      if (preferences.startTime && preferences.endTime && preferences.startTime >= preferences.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    if (currentStep === 3) {
      if (!preferences.transportModes?.length) {
        newErrors.transportModes = 'Please select at least one way to get around';
      }
    }
    
    if (currentStep === 4) {
      if (!preferences.activityTypes?.length) {
        newErrors.activityTypes = 'Please select at least one type of activity';
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
      onSubmit({
        ...preferences,
        mealPreferences
      });
    }
  };

  const transportOptions = [
    {
      value: 'walking',
      label: 'Walking',
      icon: <Users className="h-5 w-5" />
    },
    {
      value: 'cycling',
      label: 'Cycling',
      icon: <Users className="h-5 w-5" />
    },
    {
      value: 'driving',
      label: 'Driving',
      icon: <Users className="h-5 w-5" />
    },
    {
      value: 'bus',
      label: 'Bus',
      icon: <Users className="h-5 w-5" />
    },
    {
      value: 'train',
      label: 'Train',
      icon: <Users className="h-5 w-5" />
    }
  ];

  const budgetOptions = [
    { 
      value: 'budget-low', 
      label: '£0-20',
      description: 'Perfect for a thrifty day out',
      icon: <Wallet className="h-5 w-5" />
    },
    { 
      value: 'budget-mid', 
      label: '£20-35',
      description: 'Great value activities',
      icon: <Wallet className="h-5 w-5" />
    },
    { 
      value: 'budget', 
      label: '£35-50',
      description: 'Balanced mix of activities',
      icon: <Wallet className="h-5 w-5" />
    },
    { 
      value: 'moderate', 
      label: '£50-100',
      description: 'Room for some treats',
      icon: <Wallet className="h-5 w-5" />
    },
    { 
      value: 'premium', 
      label: '£100-200',
      description: 'Premium experiences',
      icon: <Wallet className="h-5 w-5" />
    },
    { 
      value: 'luxury', 
      label: '£200+',
      description: 'Luxury indulgence',
      icon: <Wallet className="h-5 w-5" />
    }
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Where shall we begin?</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
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
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>Planning to end somewhere else? (Leave empty if same as start)</span>
                </div>
                
                <Input
                  type="text"
                  placeholder="Enter end location if different"
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
            <h3 className="text-xl font-semibold text-primary-800 mb-4">When & Who</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Clock className="h-5 w-5" />
                  <span>When would you like to begin your day out?</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Start Time</label>
                    <select
                      value={preferences.startTime || ''}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select start time</option>
                      {timeOptions.map(time => (
                        <option key={`start-${time}`} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-error-default">{errors.startTime}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">End Time</label>
                    <select
                      value={preferences.endTime || ''}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select end time</option>
                      {timeOptions.map(time => (
                        <option 
                          key={`end-${time}`} 
                          value={time}
                          disabled={preferences.startTime && time <= preferences.startTime}
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-error-default">{errors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Users className="h-5 w-5" />
                  <span>How many people will be joining you on this adventure?</span>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={preferences.groupSize === num ? 'primary' : 'outline'}
                      onClick={() => handleChange('groupSize', num)}
                      className="w-full"
                    >
                      {num} {num === 1 ? 'person' : 'people'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Getting Around</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Compass className="h-5 w-5" />
                  <span>How far are you willing to travel?</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={preferences.travelDistance.value}
                    onChange={(e) => handleChange('travelDistance', {
                      ...preferences.travelDistance,
                      value: parseFloat(e.target.value)
                    })}
                    className="w-40 border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none"
                  >
                    {distanceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <Button
                    variant={preferences.travelDistance.unit === 'miles' ? 'primary' : 'outline'}
                    onClick={() => handleChange('travelDistance', {
                      ...preferences.travelDistance,
                      unit: 'miles'
                    })}
                    className="px-4"
                  >
                    Miles
                  </Button>
                  
                  <Button
                    variant={preferences.travelDistance.unit === 'hours' ? 'primary' : 'outline'}
                    onClick={() => handleChange('travelDistance', {
                      ...preferences.travelDistance,
                      unit: 'hours'
                    })}
                    className="px-4"
                  >
                    Hours
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Activity className="h-5 w-5" />
                  <span>How would you prefer to get around today?</span>
                </div>
                
                {errors.transportModes && (
                  <div className="text-error-default text-sm mb-2">{errors.transportModes}</div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {transportOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        relative flex items-center justify-center h-16 p-3 border-2 rounded-md cursor-pointer transition-all
                        ${preferences.transportModes?.includes(option.value) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}
                      `}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={preferences.transportModes?.includes(option.value)}
                        onChange={(e) => handleMultiSelectChange('transportModes', option.value, e.target.checked)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`transition-opacity duration-200 ${preferences.transportModes?.includes(option.value) ? 'opacity-0' : 'opacity-100'}`}>
                          {option.icon}
                        </div>
                        <span className={`transition-opacity duration-200 ${preferences.transportModes?.includes(option.value) ? 'opacity-100' : 'opacity-0'}`}>
                          {option.label}
                        </span>
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
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 text-primary-600 font-medium">
                    <Activity className="h-5 w-5" />
                    <span>What kind of activities interest you?</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllActivities}
                  >
                    Select All
                  </Button>
                </div>
                
                {errors.activityTypes && (
                  <div className="text-error-default text-sm mb-2">{errors.activityTypes}</div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`
                        flex items-center space-x-2 p-3 border-2 rounded-md cursor-pointer transition-all
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
                  <Wallet className="h-5 w-5" />
                  <span>What's your budget looking like for today?</span>
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
            {renderMealPreferences()}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Age Suitability</h3>
            
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary-600 font-medium">
                    <Users className="h-5 w-5" />
                    <span>Any age-specific requirements for the activities?</span>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'family-friendly', label: 'Family-friendly' },
                      { value: 'adults-only', label: 'Adults only (18+)' },
                      { value: 'seniors', label: 'Senior-friendly' },
                      { value: 'under-18', label: 'Under 18' },
                      { value: 'no-restrictions', label: 'No restrictions' },
                    ].map((option) => (
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
                  We've collected all the information we need to create your personalised itinerary.
                  Click "Create My Day Plan" below to see your custom plan!
                </p>
              </div>
            </div>
          </>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  const renderMealPreferences = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary-600 font-medium">
        <Coffee className="h-5 w-5" />
        <span>Would you like us to include meal breaks?</span>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center p-3 border-2 rounded-md cursor-pointer transition-all hover:border-primary-300">
          <input
            type="checkbox"
            checked={mealPreferences.includeCoffee}
            onChange={(e) => setMealPreferences(prev => ({
              ...prev,
              includeCoffee: e.target.checked
            }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="font-medium text-neutral-800">Morning Coffee Break</span>
            <p className="text-sm text-neutral-600">Start your day with a nice coffee or tea</p>
          </div>
        </label>

        <label className="flex items-center p-3 border-2 rounded-md cursor-pointer transition-all hover:border-primary-300">
          <input
            type="checkbox"
            checked={mealPreferences.includeLunch}
            onChange={(e) => setMealPreferences(prev => ({
              ...prev,
              includeLunch: e.target.checked
            }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="font-medium text-neutral-800">Lunch Break</span>
            <p className="text-sm text-neutral-600">Include time for lunch in your schedule</p>
          </div>
        </label>

        <label className="flex items-center p-3 border-2 rounded-md cursor-pointer transition-all hover:border-primary-300">
          <input
            type="checkbox"
            checked={mealPreferences.includeDinner}
            onChange={(e) => setMealPreferences(prev => ({
              ...prev,
              includeDinner: e.target.checked
            }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="font-medium text-neutral-800">Dinner Plans</span>
            <p className="text-sm text-neutral-600">End your day with a nice dinner</p>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <Card className="max-w-xl w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-800">
          {isEditing ? 'Update Your Plan' : 'Help Me Plan'}
        </h2>
        <p className="text-neutral-600 mt-2">
          {isEditing 
            ? 'Make changes to your plan and we\'ll update your itinerary.'
            : 'Let\'s build your perfect day together, step by step.'
          }
        </p>
      </div>
      
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
            
            {stepNumber < 5 && (
              <div 
                className={`absolute top-4 left-1/2 h-0.5 w-full transform -translate-y-1/2 ${
                  step > stepNumber ? 'bg-primary-400' : 'bg-neutral-200'
                }`}
              />
            )}
            
            <span className="text-xs mt-2 text-center hidden md:block">
              {stepNumber === 1 && "Location"}
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
              {isEditing ? 'Update Plan' : 'Create My Day Plan'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default DetailedForm;