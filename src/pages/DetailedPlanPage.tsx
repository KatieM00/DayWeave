import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import DetailedForm from '../components/forms/DetailedForm';
import ItineraryView from '../components/itinerary/ItineraryView';
import ItineraryGenerator from '../components/common/ItineraryGenerator';
import HomeButton from '../components/common/HomeButton';
import { UserPreferences, DayPlan } from '../types';
import { Link } from 'react-router-dom';
import { generateItinerary, getWeatherForecast } from '../services/api';

const DetailedPlanPage: React.FC = () => {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const getCurrentLocation = () => {
    if (!dayPlan?.events.length) return '';
    const lastEvent = dayPlan.events[dayPlan.events.length - 1];
    return lastEvent.type === 'activity' ? lastEvent.data.location : '';
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto">
        {dayPlan ? (
          <div className="mb-6">
            <div className="mb-6">
              <Link to="/\" className="inline-flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
            
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
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Help Me Plan</h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Let's build your perfect day together. Fill out the form below with your preferences,
                and we'll create a customized itinerary just for you.
              </p>
            </div>
            
            {isLoading || error ? (
              <ItineraryGenerator 
                isLoading={isLoading}
                error={error || undefined}
                onRetry={() => setError(null)}
              />
            ) : (
              <DetailedForm onSubmit={handleSubmit} />
            )}
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