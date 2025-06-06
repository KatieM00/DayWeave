import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DayPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePlans } from '../hooks/usePlans';

const MyPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getUserPlans, deletePlan, loading: plansLoading } = usePlans();
  
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'location'>('date-desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { 
        state: { from: { pathname: '/my-plans' } },
        replace: true 
      });
    }
  }, [user, authLoading, navigate]);

  // Load user plans
  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      setError(null);
      const userPlans = await getUserPlans();
      setPlans(userPlans);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load your plans. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      setPlans(prev => prev.filter(plan => plan.id !== planId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan. Please try again.');
    }
  };

  const filteredAndSortedPlans = React.useMemo(() => {
    let filtered = plans.filter(plan => 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.preferences.startLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'date-desc':
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'location':
        return filtered.sort((a, b) => a.preferences.startLocation.localeCompare(b.preferences.startLocation));
      default:
        return filtered;
    }
  }, [plans, searchQuery, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-primary-800 mb-2">
        No Plans Yet
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Start creating your perfect day plans! Choose between a detailed plan or let us surprise you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/plan')}
        >
          Create Detailed Plan
        </Button>
        <Button
          variant="secondary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/surprise')}
        >
          Try Surprise Me
        </Button>
      </div>
    </div>
  );

  const DeleteConfirmModal = ({ planId, planTitle }: { planId: string; planTitle: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-3 text-warning-default mb-4">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Plan</h3>
        </div>
        
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete "<strong>{planTitle}</strong>"? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleDeletePlan(planId)}
            className="bg-error-default hover:bg-error-dark text-white"
          >
            Delete Plan
          </Button>
        </div>
      </Card>
    </div>
  );

  if (authLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-800">My Plans</h1>
            <p className="text-neutral-600 mt-1">
              View and manage all your saved day plans
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/plan')}
          >
            Create New Plan
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-light border border-error-default rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-error-default mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-error-dark font-medium">Error</p>
              <p className="text-error-dark text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {plans.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
              <div className="w-full sm:w-96">
                <Input
                  type="text"
                  placeholder="Search your plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5 text-neutral-400" />}
                  fullWidth
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none text-sm"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title">By Title</option>
                  <option value="location">By Location</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAndSortedPlans.map(plan => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-primary-800 mb-2">
                        {plan.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-primary-500" />
                          {plan.preferences.startLocation}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-primary-500" />
                          {formatDate(plan.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-primary-500" />
                          {formatDuration(plan.totalDuration)}
                        </div>
                        <div className="flex items-center">
                          <span className="text-primary-500 mr-1">£</span>
                          {plan.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Link to={`/plan/${plan.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit2 className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => setDeleteConfirm(plan.id)}
                        className="text-error-default hover:text-error-dark hover:bg-error-light/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredAndSortedPlans.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-600 mb-2">
                  No plans found
                </h3>
                <p className="text-neutral-500">
                  Try adjusting your search terms or create a new plan.
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}

        {deleteConfirm && (
          <DeleteConfirmModal 
            planId={deleteConfirm} 
            planTitle={plans.find(p => p.id === deleteConfirm)?.title || 'Unknown Plan'}
          />
        )}
      </div>
    </div>
  );
};

export default MyPlansPage;