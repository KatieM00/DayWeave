import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { DayPlan } from '../types';

const MyPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.preferences.startLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
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
          onClick={() => window.location.href = '/plan'}
        >
          Create Detailed Plan
        </Button>
        <Button
          variant="secondary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => window.location.href = '/surprise'}
        >
          Try Surprise Me
        </Button>
      </div>
    </div>
  );

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
            onClick={() => window.location.href = '/plan'}
          >
            Create New Plan
          </Button>
        </div>

        {plans.length > 0 ? (
          <>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search your plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5 text-neutral-400" />}
                fullWidth
              />
            </div>

            <div className="space-y-4">
              {filteredPlans.map(plan => (
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
                          {new Date(plan.date).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-primary-500" />
                          {Math.floor(plan.totalDuration / 60)}h {plan.totalDuration % 60}m
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
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-error-default hover:text-error-dark hover:bg-error-light/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default MyPlansPage;