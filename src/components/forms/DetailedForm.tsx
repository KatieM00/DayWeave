import React, { useState } from 'react';
import { MapPin, Users, Clock, Compass, Activity, Coffee, Calendar, Bot as Boot, Bike, Car, Bus, Train } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import LocationInput from '../common/LocationInput';
import { 
  UserPreferences, 
  BudgetRange, 
  ActivityType,
  TransportMode,
  AgeRestriction,
  TravelDistance
} from '../../types';

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

const generateDistanceOptions = () => {
  const options = [
    { value: 0.5, label: '< 1' }
  ];
  
  for (let i = 1; i <= 24; i++) {
    options.push({ value: i, label: i.toString() });
  }
  
  options.push({ value: 25, label: '24+' });
  
  return options;
};

const timeOptions = generateTimeOptions();
const distanceOptions = generateDistanceOptions();

const transportOptions = [
  {
    value: 'walking',
    label: 'Walking',
    icon: <Boot className="h-6 w-6" />
  },
  {
    value: 'cycling',
    label: 'Cycling',
    icon: <Bike className="h-6 w-6" />
  },
  {
    value: 'driving',
    label: 'Driving',
    icon: <Car className="h-6 w-6" />
  },
  {
    value: 'bus',
    label: 'Bus',
    icon: <Bus className="h-6 w-6" />
  },
  {
    value: 'train',
    label: 'Train',
    icon: <Train className="h-6 w-6" />
  }
];

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

const budgetOptions = [
  { value: 'budget-low', label: '£0-20' },
  { value: 'budget-mid', label: '£20-35' },
  { value: 'budget', label: '£35-50' },
  { value: 'moderate', label: '£50-100' },
  { value: 'premium', label: '£100-200' },
  { value: 'luxury', label: '£200+' }
];

interface DetailedFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  initialPreferences?: UserPreferences;
  isEditing?: boolean;
}

const DetailedForm: React.FC<DetailedFormProps> = ({ 
  onSubmit, 
  initialPreferences,
  isEditing = false 
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || {
      startLocation: '',
      endLocation: '',
      groupSize: 1,
      budgetRange: '' as BudgetRange,
      travelDistance: { value: 5, unit: 'miles' },
      transportModes: [],
      activityTypes: [],
      ageRestrictions: [],
      planDate: new Date().toISOString().split('T')[0],
      mealPreferences: {
        includeCoffee: false,
        includeLunch: false,
        includeDinner: false
      }
    }
  );

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
      if (!preferences.transportModes?.length) {
        newErrors.transportModes = 'Please select at least one way to get around';
      }
    }
    
    if (currentStep === 2) {
      if (!preferences.planDate) {
        newErrors.planDate = 'Please select a date';
      }
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
      if (!preferences.groupSize) {
        newErrors.groupSize = 'Please select group size';
      }
      if (!preferences.ageRestrictions?.length) {
        newErrors.ageRestrictions = 'Please select age suitability';
      }
    }
    
    if (currentStep === 4) {
      if (!preferences.activityTypes?.length) {
        newErrors.activityTypes = 'Please select at least one type of activity';
      }
      if (!preferences.budgetRange) {
        newErrors.budgetRange = 'Please select a budget range';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setIsLoading(true);
      try {
        await onSubmit(preferences);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Where?</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>Where are you starting your adventure from?</span>
                </div>
                
                <LocationInput
                  placeholder="Enter city, town, or postcode"
                  value={preferences.startLocation}
                  onChange={(value) => handleChange('startLocation', value)}
                  error={errors.startLocation}
                  fullWidth
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <MapPin className="h-5 w-5" />
                  <span>Planning to end somewhere else? (Optional)</span>
                </div>
                
                <LocationInput
                  placeholder="Enter end location if different"
                  value={preferences.endLocation}
                  onChange={(value) => handleChange('endLocation', value)}
                  fullWidth
                />
              </div>

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
                  <span>How would you prefer to get around?</span>
                </div>
                
                {errors.transportModes && (
                  <div className="text-error-default text-sm mb-2">{errors.transportModes}</div>
                )}
                
                <div className="grid grid-cols-5 gap-3">
                  {transportOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelectChange('transportModes', option.value, !preferences.transportModes?.includes(option.value))}
                      className={`
                        relative flex flex-col items-center justify-center h-20 p-3 border-2 rounded-md transition-all
                        ${preferences.transportModes?.includes(option.value) 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-primary-300'}
                      `}
                    >
                      {option.icon}
                      <span className="text-sm mt-2">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">When?</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Calendar className="h-5 w-5" />
                  <span>Which day would you like to plan for?</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Button
                    variant={preferences.planDate === new Date().toISOString().split('T')[0] ? 'primary' : 'outline'}
                    onClick={() => handleChange('planDate', new Date().toISOString().split('T')[0])}
                  >
                    Today
                  </Button>
                  <Button
                    variant={preferences.planDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'primary' : 'outline'}
                    onClick={() => handleChange('planDate', new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                  >
                    Tomorrow
                  </Button>
                  <div>
                    <input
                      type="date"
                      value={preferences.planDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => handleChange('planDate', e.target.value)}
                      className="w-full border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Clock className="h-5 w-5" />
                  <span>What time would you like to begin and end?</span>
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
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Who?</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Users className="h-5 w-5" />
                  <span>How many people will be joining you?</span>
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
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Users className="h-5 w-5" />
                  <span>Any age-specific requirements?</span>
                </div>
                
                {errors.ageRestrictions && (
                  <div className="text-error-default text-sm mb-2">{errors.ageRestrictions}</div>
                )}
                
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
          </>
        );

      case 4:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">What?</h3>
            
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
                
                <div className="grid grid-cols-2 gap-3">
                  {activityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelectChange('activityTypes', option.value, !preferences.activityTypes?.includes(option.value))}
                      className={`
                        p-4 border-2 rounded-lg text-left transition-all
                        ${preferences.activityTypes?.includes(option.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 hover:border-primary-300'}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Activity className="h-5 w-5" />
                  <span>What's your budget looking like?</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleChange('budgetRange', option.value)}
                      className={`
                        p-4 border-2 rounded-lg text-center transition-all aspect-square flex flex-col items-center justify-center
                        ${preferences.budgetRange === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-300 hover:border-primary-300'}
                      `}
                    >
                      <span className="text-lg font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <Coffee className="h-5 w-5" />
                  <span>Would you like us to include meal breaks?</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 rounded-md cursor-pointer transition-all hover:border-primary-300">
                    <input
                      type="checkbox"
                      checked={preferences.mealPreferences?.includeCoffee}
                      onChange={(e) => handleChange('mealPreferences', {
                        ...preferences.mealPreferences,
                        includeCoffee: e.target.checked
                      })}
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
                      checked={preferences.mealPreferences?.includeLunch}
                      onChange={(e) => handleChange('mealPreferences', {
                        ...preferences.mealPreferences,
                        includeLunch: e.target.checked
                      })}
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
                      checked={preferences.mealPreferences?.includeDinner}
                      onChange={(e) => handleChange('mealPreferences', {
                        ...preferences.mealPreferences,
                        includeDinner: e.target.checked
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-neutral-800">Dinner Plans</span>
                      <p className="text-sm text-neutral-600">End your day with a nice dinner</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Ready!</h3>
            
            <div className="space-y-6">
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
                <h4 className="font-medium text-primary-800 mb-2">Your Plan Summary</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(preferences.planDate!).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {preferences.startTime} - {preferences.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {preferences.startLocation}
                    {preferences.endLocation && ` to ${preferences.endLocation}`}
                  </p>
                  <p>
                    <span className="font-medium">Group:</span>{' '}
                    {preferences.groupSize} {preferences.groupSize === 1 ? 'person' : 'people'}
                  </p>
                  <p>
                    <span className="font-medium">Transport:</span>{' '}
                    {preferences.transportModes?.map(mode => 
                      mode.charAt(0).toUpperCase() + mode.slice(1)
                    ).join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Your Plan...
                    </div>
                  ) : (
                    'Create My Day Plan'
                  )}
                </Button>
                
                <p className="mt-4 text-sm text-neutral-600">
                  We'll create a personalized itinerary based on your preferences
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

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
      
      <div className="relative mb-8 px-4">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 mx-8" />
        
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary-400 mx-8 transition-all duration-300"
          style={{ width: `calc(${((step - 1) / 4) * 100}%)` }}
        />
        
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div 
              key={stepNumber}
              className="flex flex-col items-center flex-1"
            >
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10
                  ${step === stepNumber ? 'bg-primary-600 text-white' : 
                    step > stepNumber ? 'bg-primary-400 text-white' : 'bg-neutral-200 text-neutral-500'}
                  transition-all duration-300
                `}
              >
                {stepNumber}
              </div>
              
              <span className="text-xs mt-2 text-center hidden md:block text-neutral-600">
                {stepNumber === 1 && "Where?"}
                {stepNumber === 2 && "When?"}
                {stepNumber === 3 && "Who?"}
                {stepNumber === 4 && "What?"}
                {stepNumber === 5 && "Ready!"}
              </span>
            </div>
          ))}
        </div>
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
              disabled={isLoading}
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