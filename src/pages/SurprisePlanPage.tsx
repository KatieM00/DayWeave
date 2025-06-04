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
  
  const handleSubmit = (preferences: UserPreferences & { surpriseMode: boolean }) => {
    const plan = generateSurpriseDayPlan(preferences);
    
    if (preferences.surpriseMode) {
      const initialReveal = Math.ceil((1 / plan.events.length) * 100);
      plan.revealProgress = initialReveal;
      setRevealProgress(initialReveal);
    } else {
      plan.revealProgress = 100;
      setRevealProgress(100);
    }
    
    setDayPlan(plan);
    window.scrollTo(0, 0);
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
    alert('This would save the plan to your account in the full application!');
  };

  const handleUpdatePlan = (updatedPlan: DayPlan) => {
    setDayPlan(updatedPlan);
    setRevealProgress(updatedPlan.revealProgress || 0);
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
                onClick={() => {
                  setDayPlan(null);
                  setRevealProgress(0);
                }}
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