import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import SurpriseForm from '../components/forms/SurpriseForm';
import ItineraryView from '../components/itinerary/ItineraryView';
import { UserPreferences, DayPlan } from '../types';
import { generateSurpriseDayPlan } from '../utils/mockData';
import { Link } from 'react-router-dom';

const SurprisePlanPage: React.FC = () => {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  
  // Function to handle form submission
  const handleSubmit = (preferences: UserPreferences) => {
    // In a real app, this would make API calls to generate the plan
    const plan = generateSurpriseDayPlan(preferences);
    
    // Set initial reveal progress to show just the first event (usually the starting point)
    const initialReveal = Math.ceil((1 / plan.events.length) * 100);
    plan.revealProgress = initialReveal;
    
    setDayPlan(plan);
    setRevealProgress(initialReveal);
    
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  // Function to reveal more of the itinerary
  const handleRevealMore = () => {
    if (!dayPlan) return;
    
    const eventCount = dayPlan.events.length;
    const currentlyRevealed = Math.ceil((eventCount * revealProgress) / 100);
    
    // Reveal one more event
    const newRevealed = currentlyRevealed + 1;
    const newProgress = Math.min(100, Math.ceil((newRevealed / eventCount) * 100));
    
    setRevealProgress(newProgress);
    setDayPlan({
      ...dayPlan,
      revealProgress: newProgress
    });
  };
  
  // Function to handle sharing plan
  const handleSharePlan = () => {
    // In a real app, this would generate a shareable link
    alert('This would generate a shareable link in the full application!');
  };
  
  // Function to handle PDF export
  const handleExportPDF = () => {
    // In a real app, this would generate a PDF
    alert('This would generate a downloadable PDF in the full application!');
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
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Your Surprise Adventure</h1>
              <p className="text-neutral-600">
                Here's the perfect day we've planned for you. The more you reveal, the more adventures await!
              </p>
            </div>
            
            <ItineraryView
              dayPlan={dayPlan}
              isSurpriseMode={true}
              onRevealMore={handleRevealMore}
              onSharePlan={handleSharePlan}
              onExportPDF={handleExportPDF}
            />
            
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setDayPlan(null)}
              >
                Start Over
              </Button>
            </div>
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
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Surprise Me!</h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Ready for a spontaneous adventure? Answer a few quick questions and we'll plan an 
                exciting day full of surprises. The less you know, the more fun it will be!
              </p>
            </div>
            
            <SurpriseForm onSubmit={handleSubmit} />
          </>
        )}
      </div>
    </div>
  );
};

export default SurprisePlanPage;