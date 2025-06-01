import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import DetailedForm from '../components/forms/DetailedForm';
import ItineraryView from '../components/itinerary/ItineraryView';
import { UserPreferences, DayPlan } from '../types';
import { generateDetailedDayPlan } from '../utils/mockData';
import { Link } from 'react-router-dom';

const DetailedPlanPage: React.FC = () => {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  
  // Function to handle form submission
  const handleSubmit = (preferences: UserPreferences) => {
    // In a real app, this would make API calls to generate the plan
    const plan = generateDetailedDayPlan(preferences);
    setDayPlan(plan);
    
    // Scroll to top
    window.scrollTo(0, 0);
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
            />
            
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setDayPlan(null)}
              >
                Modify Plan
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
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Help Me Plan</h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Let's build your perfect day together. Fill out the form below with your preferences,
                and we'll create a customized itinerary just for you.
              </p>
            </div>
            
            <DetailedForm onSubmit={handleSubmit} />
          </>
        )}
      </div>
    </div>
  );
};

export default DetailedPlanPage;