import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  MapPin,
  Activity,
  DollarSign,
  Save,
  ArrowLeft,
  Plus,
  Star,
  Trash2
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getActivitySuggestions } from '../services/activitySuggestions';
import { trackEvent } from '../services/analytics';
import { trackBudget, getBudgetSummary } from '../services/budgetTracking';

interface ActivityPreference {
  category: string;
  rating: number;
  custom?: boolean;
}

interface UserPreferences {
  homeLocation: string;
  searchRadius: number;
  activities: ActivityPreference[];
  weeklyBudget: number;
  currency: string;
  priceRanges: {
    [key: string]: {
      min: number;
      max: number;
    };
  };
}

const defaultActivities = [
  { category: 'Outdoor', rating: 3 },
  { category: 'Arts & Culture', rating: 3 },
  { category: 'Entertainment', rating: 3 },
  { category: 'Sports & Fitness', rating: 3 },
  { category: 'Food & Dining', rating: 3 },
  { category: 'Shopping', rating: 3 }
];

const UserPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    homeLocation: '',
    searchRadius: 10,
    activities: defaultActivities,
    weeklyBudget: 200,
    currency: 'GBP',
    priceRanges: {
      'Outdoor': { min: 0, max: 50 },
      'Arts & Culture': { min: 10, max: 100 },
      'Entertainment': { min: 20, max: 150 },
      'Sports & Fitness': { min: 10, max: 80 },
      'Food & Dining': { min: 15, max: 100 },
      'Shopping': { min: 0, max: 200 }
    }
  });
  const [newActivity, setNewActivity] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPreferences();
    initializeMap();
    loadBudgetSummary();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBudgetSummary = async () => {
    if (!user) return;
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const summary = await getBudgetSummary(startDate, new Date());
      
      // Update UI with budget summary
      setPreferences(prev => ({
        ...prev,
        budgetSummary: summary
      }));
    } catch (error) {
      console.error('Error loading budget summary:', error);
    }
  };

  const initializeMap = async () => {
    try {
      const loader = new google.maps.plugins.loader.Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();
      setMapLoaded(true);

      const input = document.getElementById('homeLocation') as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setPreferences(prev => ({
            ...prev,
            homeLocation: place.formatted_address
          }));
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleActivityRatingChange = (category: string, rating: number) => {
    setPreferences(prev => ({
      ...prev,
      activities: prev.activities.map(activity =>
        activity.category === category ? { ...activity, rating } : activity
      )
    }));
  };

  const handleAddCustomActivity = () => {
    if (!newActivity.trim()) return;

    setPreferences(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { category: newActivity, rating: 3, custom: true }
      ],
      priceRanges: {
        ...prev.priceRanges,
        [newActivity]: { min: 0, max: 100 }
      }
    }));
    setNewActivity('');
  };

  const handleRemoveActivity = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.category !== category),
      priceRanges: Object.fromEntries(
        Object.entries(prev.priceRanges).filter(([key]) => key !== category)
      )
    }));
  };

  const validatePreferences = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!preferences.homeLocation) {
      newErrors.homeLocation = 'Home location is required';
    }
    if (preferences.weeklyBudget <= 0) {
      newErrors.weeklyBudget = 'Weekly budget must be greater than 0';
    }
    if (preferences.activities.length === 0) {
      newErrors.activities = 'At least one activity preference is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validatePreferences() || !user) return;

    setIsSaving(true);
    try {
      await trackEvent('preferences_updated', {
        categories: preferences.activities.map(a => a.category),
        budget: preferences.weeklyBudget
      });

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences
        });

      if (error) throw error;

      // Track budget changes
      await trackBudget('weekly_budget', preferences.weeklyBudget);

      // Update activity suggestions
      const suggestions = await getActivitySuggestions({
        location: preferences.homeLocation,
        categories: preferences.activities.map(a => a.category),
        maxBudget: preferences.weeklyBudget,
        radius: preferences.searchRadius
      });

      setSuggestions(suggestions);

      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-800">Your Preferences</h1>
            <p className="text-neutral-600 mt-1">
              Customize your experience to get better recommendations
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            loading={isSaving}
          >
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Home Location Section */}
          <Card>
            <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Home Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Home Address
                </label>
                <Input
                  id="homeLocation"
                  type="text"
                  value={preferences.homeLocation}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    homeLocation: e.target.value
                  }))}
                  placeholder="Enter your address"
                  error={errors.homeLocation}
                  icon={<MapPin className="w-5 h-5" />}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Search Radius (miles)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={preferences.searchRadius}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    searchRadius: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-sm text-neutral-600 mt-1">
                  {preferences.searchRadius} miles
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Preferences Section */}
          <Card>
            <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Activity Preferences
            </h2>
            
            {errors.activities && (
              <div className="text-error-default text-sm mb-4">
                {errors.activities}
              </div>
            )}
            
            <div className="space-y-4">
              {preferences.activities.map((activity) => (
                <div key={activity.category} className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{activity.category}</span>
                      {activity.custom && (
                        <button
                          onClick={() => handleRemoveActivity(activity.category)}
                          className="text-error-default hover:text-error-dark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleActivityRatingChange(activity.category, star)}
                          className={`p-1 ${
                            star <= activity.rating
                              ? 'text-accent-500'
                              : 'text-neutral-300'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Add custom activity"
                  fullWidth
                />
                <Button
                  variant="outline"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddCustomActivity}
                  disabled={!newActivity.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Budget Settings Section */}
          <Card>
            <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Budget Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Weekly Budget
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      currency: e.target.value
                    }))}
                    className="border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="GBP">£ GBP</option>
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                  </select>
                  
                  <Input
                    type="number"
                    value={preferences.weeklyBudget}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      weeklyBudget: parseInt(e.target.value)
                    }))}
                    error={errors.weeklyBudget}
                    fullWidth
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-neutral-800">Price Range per Activity</h3>
                
                {Object.entries(preferences.priceRanges).map(([category, range]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>£{range.min} - £{range.max}</span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        value={range.max}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          priceRanges: {
                            ...prev.priceRanges,
                            [category]: {
                              ...prev.priceRanges[category],
                              max: parseInt(e.target.value)
                            }
                          }
                        }))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesPage;