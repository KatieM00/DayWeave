import React, { useState } from 'react';
import { MapPin, LogIn, Users, Compass, DollarSign, Sparkles, Eye, EyeOff, Heart, Zap, Leaf, Gem, Activity } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import LocationInput from '../common/LocationInput';
import { UserPreferences, BudgetRange, ActivityVibe, TravelDistance } from '../../types';

interface SurpriseFormProps {
  onSubmit: (preferences: UserPreferences & { surpriseMode: boolean }) => void;
}

const SurpriseForm: React.FC<SurpriseFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences & { surpriseMode?: boolean }>({
    startLocation: '',
    groupSize: 0,
    budgetRange: '' as BudgetRange,
    travelDistance: { value: 0, unit: 'miles' },
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
      newErrors.startLocation = 'Please select a location from the autocomplete suggestions for best results.';
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
      onSubmit({
        ...preferences,
        surpriseMode: preferences.surpriseMode ?? false
      });
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
              
              <LocationInput
                placeholder="Type location..."
                value={preferences.startLocation}
                onChange={(value) => handleChange('startLocation', value)}
                error={errors.startLocation}
                fullWidth
              />
              
              <p className="text-sm text-neutral-600">
                💡 Leave end location blank if you want to return to your starting location.
              </p>
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-4">
                How far shall we roam?
              </h2>
              
              {/* Miles/Hours toggle inline with question */}
              <div className="flex justify-center gap-3">
                <Button
                  variant={preferences.travelDistance.unit === 'miles' ? 'primary' : 'outline'}
                  onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, unit: 'miles' })}
                  size="sm"
                >
                  Miles
                </Button>
                
                <Button
                  variant={preferences.travelDistance.unit === 'hours' ? 'primary' : 'outline'}
                  onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, unit: 'hours' })}
                  size="sm"
                >
                  Hours
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Distance options in the requested layout */}
              <div className="space-y-3">
                {/* Line 1: 1, 2, 3, 4, 5 */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant={preferences.travelDistance.value === value ? 'primary' : 'outline'}
                      onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, value })}
                      className="h-12 sm:h-14 flex items-center justify-center text-base sm:text-lg font-semibold min-w-0"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                
                {/* Line 2: 5-8, 8-11, 11-14 */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: 6.5, label: '5 - 8' },
                    { value: 9.5, label: '8 - 11' },
                    { value: 12.5, label: '11 - 14' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.travelDistance.value === option.value ? 'primary' : 'outline'}
                      onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, value: option.value })}
                      className="h-12 sm:h-14 flex items-center justify-center text-base sm:text-lg font-semibold"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                
                {/* Line 3: 15-20, 20-24, Over 24 */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: 17.5, label: '15 - 20' },
                    { value: 22, label: '20 - 24' },
                    { value: 25, label: 'Over 24' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.travelDistance.value === option.value ? 'primary' : 'outline'}
                      onClick={() => handleChange('travelDistance', { ...preferences.travelDistance, value: option.value })}
                      className="h-12 sm:h-14 flex items-center justify-center text-base sm:text-lg font-semibold"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Display selected value */}
              {preferences.travelDistance.value > 0 && (
                <div className="text-center text-sm sm:text-base text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                  Selected: <span className="font-medium text-primary-600">
                    {preferences.travelDistance.value === 25 ? 'Over 24' : 
                     preferences.travelDistance.value === 22 ? '20 - 24' :
                     preferences.travelDistance.value === 17.5 ? '15 - 20' :
                     preferences.travelDistance.value === 12.5 ? '11 - 14' :
                     preferences.travelDistance.value === 9.5 ? '8 - 11' :
                     preferences.travelDistance.value === 6.5 ? '5 - 8' :
                     preferences.travelDistance.value} {preferences.travelDistance.unit}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
              disabled={preferences.travelDistance.value === 0}
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
            
            <div className="grid grid-cols-2 gap-3">
              {/* Free Budget Option */}
              <button
                onClick={() => handleChange('budgetRange', 'free')}
                className={`
                  p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center h-24
                  ${preferences.budgetRange === 'free'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'border-neutral-300 hover:border-green-300 hover:bg-green-50'}
                `}
              >
                <span className="text-base font-semibold">Free</span>
                <span className="text-xs mt-1 opacity-80">Walking & free activities</span>
              </button>

              {/* Budget Option */}
              <button
                onClick={() => handleChange('budgetRange', 'budget')}
                className={`
                  p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center h-24
                  ${preferences.budgetRange === 'budget'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-primary-300'}
                `}
              >
                <DollarSign className="h-6 w-6 mb-1" />
                <span className="text-base font-semibold">Budget</span>
                <span className="text-xs">0-50</span>
              </button>
              
              {/* Moderate Option */}
              <button
                onClick={() => handleChange('budgetRange', 'moderate')}
                className={`
                  p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center h-24
                  ${preferences.budgetRange === 'moderate'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-primary-300'}
                `}
              >
                <DollarSign className="h-6 w-6 mb-1" />
                <span className="text-base font-semibold">Moderate</span>
                <span className="text-xs">50-150</span>
              </button>
              
              {/* Premium Option */}
              <button
                onClick={() => handleChange('budgetRange', 'premium')}
                className={`
                  p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center h-24
                  ${preferences.budgetRange === 'premium'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-primary-300'}
                `}
              >
                <DollarSign className="h-6 w-6 mb-1" />
                <span className="text-base font-semibold">Premium</span>
                <span className="text-xs">150+</span>
              </button>
            </div>

            {/* Free budget explanation */}
            {preferences.budgetRange === 'free' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">🌱 Free Budget Mode</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Focus on free activities: parks, beaches, walking trails</li>
                  <li>• Walking-only transport to keep costs at zero</li>
                  <li>• Budget-friendly meal suggestions and picnic spots</li>
                  <li>• Perfect for eco-friendly, healthy adventures</li>
                </ul>
              </div>
            )}
            
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
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'relaxing', label: 'Relaxing', icon: Sparkles },
                { value: 'adventurous', label: 'Adventurous', icon: Compass },
                { value: 'cultural', label: 'Cultural', icon: Activity },
                { value: 'active', label: 'Active', icon: Users },
                { value: 'romantic', label: 'Romantic', icon: Heart },
                { value: 'thrill-seeking', label: 'Thrill-seeking', icon: Zap },
                { value: 'mindful', label: 'Mindful', icon: Leaf },
                { value: 'luxurious', label: 'Luxurious', icon: Gem },
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
                    className="h-28 sm:h-32 flex flex-col items-center justify-center gap-2"
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-base sm:text-lg font-semibold">{option.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
              disabled={!Array.isArray(preferences.activityVibe) || preferences.activityVibe.length === 0}
            >
              Next
            </Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-800 text-center mb-4">
              Would you like to experience your journey as a surprise adventure?
            </h2>
            
            <p className="text-center text-neutral-600 mb-8">
              Choose how you want to view your itinerary
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <Button
                variant={preferences.surpriseMode ? 'primary' : 'outline'}
                size="lg"
                onClick={() => setPreferences(prev => ({ ...prev, surpriseMode: true }))}
                className="p-6 flex flex-col items-center gap-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <EyeOff className="h-8 w-8 shrink-0" />
                  <span className="text-xl font-semibold">🎲 YES - SURPRISE MODE</span>
                </div>
                <ul className="text-sm space-y-2 list-disc ml-6">
                  <li>See only travel times and distances between stops</li>
                  <li>Destinations and activities remain hidden until you're ready</li>
                  <li>Click "Reveal" at each stop to uncover your next location</li>
                  <li>Perfect for spontaneous travelers who love surprises</li>
                </ul>
              </Button>
              
              <Button
                variant={preferences.surpriseMode === false ? 'primary' : 'outline'}
                size="lg"
                onClick={() => setPreferences(prev => ({ ...prev, surpriseMode: false }))}
                className="p-6 flex flex-col items-center gap-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 shrink-0" />
                  <span className="text-xl font-semibold">📝 NO - STANDARD MODE</span>
                </div>
                <ul className="text-sm space-y-2 list-disc ml-6">
                  <li>View your complete itinerary immediately</li>
                  <li>All destinations and activities shown upfront</li>
                  <li>Get a clear overview of your entire journey</li>
                  <li>Ideal for those who prefer to plan ahead</li>
                </ul>
              </Button>
            </div>
            
            <div className="text-center text-sm text-neutral-600 mt-4">
              Note: You can switch between modes at any time during your trip.
            </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={preferences.surpriseMode === undefined}
            >
              Create My Adventure!
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
          {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
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
        <span className="text-sm text-neutral-500">Step {step} of 6</span>
      </div>
      
      {renderStepContent()}
    </Card>
  );
};

export default SurpriseForm;