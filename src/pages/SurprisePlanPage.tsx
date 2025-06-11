import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import SurpriseForm from '../components/forms/SurpriseForm';
import ItineraryView from '../components/itinerary/ItineraryView';
import ItineraryGenerator from '../components/common/ItineraryGenerator';
import HomeButton from '../components/common/HomeButton';
import { UserPreferences, DayPlan } from '../types';
import { generateItinerary, getWeatherForecast } from '../services/api';
import { Link } from 'react-router-dom';
import { usePlanRestoration } from '../hooks/usePlanRestoration';

const SurprisePlanPage: React.FC = () => {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [currentPreferences, setCurrentPreferences] = useState<any>(null);


  // Initialize plan restoration
  const { storePlanData, restorePlanData, clearStoredPlanData } = usePlanRestoration({
    onPlanRestore: (storedData) => {
      console.log('Restoring surprise plan data:', storedData);
      setDayPlan(storedData.dayPlan);
      setRevealProgress(storedData.revealProgress || 0);
      setShowForm(false); // Hide form when restoring a plan
    },
    onProgressRestore: (progress) => {
      setRevealProgress(progress);
    }
  });

  // Check for stored plan data on component mount - but only restore if appropriate
  useEffect(() => {
    if (!hasAttemptedRestore) {
      setHasAttemptedRestore(true);
      
      // Only attempt restoration if we have a specific indicator that we should restore
      // For example, if coming from an auth flow or if there's a specific URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRestore = urlParams.get('restore') === 'true' || 
                           sessionStorage.getItem('dayweave_should_restore') === 'true';
      
      if (shouldRestore) {
        const hasRestoredPlan = restorePlanData();
        if (hasRestoredPlan) {
          // Clear the restore flag
          sessionStorage.removeItem('dayweave_should_restore');
          return;
        }
      }
      
      // Default: show form for fresh visits
      setShowForm(true);
      setDayPlan(null);
      setRevealProgress(0);
    }
  }, [hasAttemptedRestore, restorePlanData]);

  // Store plan data whenever it changes (but only after successful generation)
  useEffect(() => {
    if (dayPlan && !showForm) {
      const planData = {
        dayPlan,
        events: dayPlan.events,
        planName: dayPlan.title,
        revealProgress,
        currentUrl: window.location.href
      };
      storePlanData(planData);
    }
  }, [dayPlan, revealProgress, showForm, storePlanData]);
  
  const handleSubmit = async (preferences: UserPreferences & { surpriseMode: boolean }) => {
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
          surpriseMode: preferences.surpriseMode
        }),
        getWeatherForecast(preferences.startLocation, planDate)
      ]);
      
      // Add weather forecast to the plan
      if (weatherForecast) {
        plan.weatherForecast = weatherForecast;
      }
      
      if (preferences.surpriseMode) {
        const initialReveal = Math.ceil((1 / plan.events.length) * 100);
        plan.revealProgress = initialReveal;
        setRevealProgress(initialReveal);
      } else {
        plan.revealProgress = 100;
        setRevealProgress(100);
      }
      
      setDayPlan(plan);
      setShowForm(false); // Hide form after successful generation
      window.scrollTo(0, 0);
    } catch (err) {
      setError('Failed to generate your surprise itinerary. Please try again.');
      console.error('Itinerary generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRevealMore = () => {
    if (!dayPlan) return;
    
    const eventCount = dayPlan.events.length;
    const currentlyRevealed = Math.ceil((eventCount * revealProgress) / 100);
    const newRevealed = currentlyRevealed + 1;
    const newProgress = Math.min(100, Math.ceil((newRevealed / eventCount) * 100));
    
    setRevealProgress(newProgress);
    setDayPlan({
      ...dayPlan,
      revealProgress: newProgress
    });
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
    setRevealProgress(updatedPlan.revealProgress || 0);
  };

  const handleStartOver = () => {
    setDayPlan(null);
    setShowForm(true);
    setRevealProgress(0);
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
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Surprise Me!</h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ready for a spontaneous adventure? Answer a few quick questions and we'll plan an 
                exciting day full of surprises. The less you know, the more fun it will be!
              </p>
            </div>
            
            {isLoading || error ? (
              <ItineraryGenerator 
                isLoading={isLoading}
                error={error || undefined}
                onRetry={() => setError(null)}
              />
            ) : (
              <SurpriseForm onSubmit={handleSubmit} />
            )}
          </>
        )}

        {/* Show plan when it exists and form is hidden */}
        {dayPlan && !showForm && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Your Surprise Adventure</h1>
              <p className="text-neutral-600">
                {revealProgress < 100 
                  ? "Here's your adventure, ready to be discovered one step at a time!"
                  : "Here's your complete adventure plan. Enjoy your journey!"}
              </p>
            </div>
            
            <ItineraryView
              dayPlan={dayPlan}
              isSurpriseMode={revealProgress < 100}
              onRevealMore={handleRevealMore}
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
        isSurpriseMode={revealProgress < 100}
        currentLocation={getCurrentLocation()}
        endLocation={dayPlan?.preferences.endLocation || dayPlan?.preferences.startLocation}
      />
    </div>
  );
};

export default SurprisePlanPage;