import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import DetailedForm from '../components/forms/DetailedForm';
import ItineraryView from '../components/itinerary/ItineraryView';
import ItineraryGenerator from '../components/common/ItineraryGenerator';
import HomeButton from '../components/common/HomeButton';
import { UserPreferences, DayPlan } from '../types';
import { Link } from 'react-router-dom';
import { generateItinerary, getWeatherForecast } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { usePlanRestoration } from '../hooks/usePlanRestoration';

const DetailedPlanPage: React.FC = () => {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const { selectedCurrency } = useCurrency();

  // Initialize plan restoration
  const { storePlanData, restorePlanData, clearStoredPlanData } = usePlanRestoration({
    onPlanRestore: (storedData) => {
      console.log('Restoring detailed plan data:', storedData);
      setDayPlan(storedData.dayPlan);
      setShowForm(false); // Hide form when restoring a plan
    }
  });

  // Check for stored plan data on component mount - but only restore if appropriate
  // Check for stored plan data on component mount - but only restore if appropriate
  useEffect(() => {
  // FORCE CLEAR at the very start - no matter what
    clearStoredPlanData();
    sessionStorage.removeItem('dayweave_current_plan');
    sessionStorage.removeItem('dayweave_should_restore');
  
    if (!hasAttemptedRestore) {
    setHasAttemptedRestore(true);
    
    // Only attempt restoration if we have a specific indicator that we should restore
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRestore = urlParams.get('restore') === 'true';
    
      if (shouldRestore) {
        const hasRestoredPlan = restorePlanData();
        if (hasRestoredPlan) {
          sessionStorage.removeItem('dayweave_should_restore');
        return;
      }
    }
    
    // Default: show form for fresh visits
    setShowForm(true);
    setDayPlan(null);
  }
}, [hasAttemptedRestore, restorePlanData, clearStoredPlanData]);

  // Store plan data whenever it changes (but only after successful generation)
  useEffect(() => {
    if (dayPlan && !showForm) {
      const planData = {
        dayPlan,
        events: dayPlan.events,
        planName: dayPlan.title,
        revealProgress: dayPlan.revealProgress || 100,
        currentUrl: window.location.href
      };
      storePlanData(planData);
    }
  
      
  }, [dayPlan, showForm, storePlanData]);
  
  const handleSubmit = async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const planDate = preferences.planDate || new Date().toISOString().split('T')[0];
      
      // Generate itinerary and weather forecast in parallel
      const [plan, weatherForecast] = await Promise.all([
        generateItinerary({
          location: preferences.startLocation,
          date: planDate,
          preferences,
          surpriseMode: false
        }),
        getWeatherForecast(preferences.startLocation, planDate)
      ]);
      
      // Add weather forecast to the plan
      if (weatherForecast) {
        plan.weatherForecast = weatherForecast;
      }
      
      setDayPlan(plan);
      setShowForm(false); // Hide form after successful generation
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Failed to generate your itinerary. Please try again.');
      console.error('Itinerary generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSharePlan = () => {
    alert('This would generate a shareable link in the full application!');
  };
  
  const handleExportPDF = () => {
    alert('This would generate a downloadable PDF in the full application!');
  };

  const handleSavePlan = () => {
    // This will be handled by the ItineraryView component now
    console.log('Save plan triggered');
  };

  const handleUpdatePlan = (updatedPlan: DayPlan) => {
    setDayPlan(updatedPlan);
  };

  const handleStartOver = () => {
    setDayPlan(null);
    setShowForm(true);
    setError(null);
    clearStoredPlanData();
    window.scrollTo(0, 0);
  };

  const getCurrentLocation = () => {
    if (!dayPlan?.events.length) return '';
    const lastEvent = dayPlan.events[dayPlan.events.length - 1];
    return lastEvent.type === 'activity' ? lastEvent.data.location : '';
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Show form when no plan exists or when explicitly showing form */}
        {showForm && !dayPlan && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Help Me Plan</h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Let's build your perfect day together, step by step.
              </p>
            </div>
            
            {isLoading || error ? (
              <ItineraryGenerator 
                isLoading={isLoading}
                error={error || undefined}
                onRetry={() => setError(null)}
              />
            ) : (
              <DetailedForm 
                onSubmit={handleSubmit} 
                selectedCurrency={selectedCurrency}
              />
            )}
          </>
        )}

        {/* Show plan when it exists and form is hidden */}
        {dayPlan && !showForm && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Your Custom Day Plan</h1>
              <p className="text-neutral-600">
                Here's the custom day we've planned for you based on your preferences.
              </p>
            </div>
            
            <ItineraryView
              dayPlan={dayPlan}
              isSurpriseMode={false}
              onSharePlan={handleSharePlan}
              onExportPDF={handleExportPDF}
              onSavePlan={handleSavePlan}
              onUpdatePlan={handleUpdatePlan}
            />
            
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={handleStartOver}
              >
                Start Over
              </Button>
            </div>
          </>
        )}
      </div>

      <HomeButton
        currentLocation={getCurrentLocation()}
        endLocation={dayPlan?.preferences.endLocation || dayPlan?.preferences.startLocation}
      />
    </div>
  );
};

export default DetailedPlanPage;