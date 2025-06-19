import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlans } from '../hooks/usePlans';
import ItineraryView from '../components/itinerary/ItineraryView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { DayPlan } from '../types';

const EditPlanPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const { getPlanById } = usePlans();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId || !user) {
        setError('Plan not found');
        setLoading(false);
        return;
      }

      try {
        const foundPlan = await getPlanById(planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          setError('Plan not found');
        }
      } catch (err) {
        console.error('Error loading plan:', err);
        setError('Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId, user, getPlanById]);

  const handleUpdatePlan = (updatedPlan: DayPlan) => {
    setPlan(updatedPlan);
  };

  const handleSavePlan = () => {
    // Navigate back to My Plans after saving
    navigate('/my-plans');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-primary-800 mb-4">Plan Not Found</h1>
          <p className="text-neutral-600 mb-6">{error || 'The plan you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/my-plans')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/my-plans')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Plans
          </button>
          <h1 className="text-3xl font-bold text-primary-800">Edit Plan</h1>
          <p className="text-neutral-600 mt-1">
            Make changes to your day plan and add new activities
          </p>
        </div>

        <ItineraryView 
          dayPlan={plan}
          onUpdatePlan={handleUpdatePlan}
          onSavePlan={handleSavePlan}
          isSurpriseMode={false}
          disablePlanRestoration={true} 
        />
      </div>
    </div>
  );
};

export default EditPlanPage;