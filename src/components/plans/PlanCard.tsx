import React from 'react';
import { Clock, MapPin, Calendar, Users, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import type { DayPlan } from '../../types';

interface PlanCardProps {
  plan: DayPlan;
  onDelete: (id: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onDelete }) => {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              £{plan.totalCost.toFixed(2)}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-primary-500" />
              {plan.preferences.groupSize} {plan.preferences.groupSize === 1 ? 'person' : 'people'}
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
            onClick={() => onDelete(plan.id)}
            className="text-error-default hover:text-error-dark hover:bg-error-light/10"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PlanCard;