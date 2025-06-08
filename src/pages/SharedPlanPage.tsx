import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, AlertCircle } from 'lucide-react';
import ItineraryView from '../components/itinerary/ItineraryView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { DayPlan } from '../types';
import { usePlans } from '../hooks/usePlans';

const SharedPlanPage: React.FC = () => {
  const { shareableLinkId } = useParams<{ shareableLinkId: string }>();
  const { getPlanByShareableLinkId, loading } = usePlans();
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareableLinkId) {
      loadSharedPlan();
    }
  }, [shareableLinkId]);

  const loadSharedPlan = async () => {
    if (!shareableLinkId) return;

    try {
      setError(null);
      const plan = await getPlanByShareableLinkId(shareableLinkId);
      
      if (!plan) {
        setError('This shared plan could not be found. It may have been removed or the link is invalid.');
        return;
      }

      setDayPlan(plan);
    } catch (err) {
      console.error('Error loading shared plan:', err);
      setError('Failed to load the shared plan. Please try again later.');
    }
  };

  const handleSharePlan = () => {
    if (navigator.share) {
      navigator.share({
        title: dayPlan?.title || 'Day Plan',
        text: `Check out this day plan: ${dayPlan?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleExportPDF = () => {
    alert('PDF export functionality will be implemented next!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Loading shared plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>

          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-error-default" />
            </div>
            <h2 className="text-2xl font-bold text-error-dark mb-4">Plan Not Found</h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <Link to="/">
              <Button variant="primary">
                Create Your Own Plan
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (!dayPlan) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>

          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Plan Not Available</h2>
            <p className="text-neutral-600 mb-6">
              This shared plan is not available at the moment.
            </p>
            <Link to="/">
              <Button variant="primary">
                Create Your Own Plan
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Shared Day Plan</h1>
          <p className="text-neutral-600">
            Someone shared this amazing day plan with you!
          </p>
          
          <div className="flex justify-center gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              icon={<Share2 className="w-4 h-4" />}
              onClick={handleSharePlan}
            >
              Share This Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </div>
        </div>

        <ItineraryView
          dayPlan={dayPlan}
          isSurpriseMode={false}
          onSharePlan={handleSharePlan}
          onExportPDF={handleExportPDF}
          // Don't allow saving/editing for shared plans
          onSavePlan={undefined}
          onUpdatePlan={undefined}
        />

        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="py-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Love this plan? Create your own!
              </h3>
              <p className="text-neutral-600 mb-4">
                DayWeave helps you create personalized day plans with AI-powered recommendations.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/surprise">
                  <Button variant="primary">
                    Try Surprise Mode
                  </Button>
                </Link>
                <Link to="/plan">
                  <Button variant="secondary">
                    Create Detailed Plan
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SharedPlanPage;