import React, { useState } from 'react';
import { Clock, DollarSign, MapPin, Calendar, Share2, Users, Edit2, Save, X } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { DayPlan, WeatherForecast, ItineraryEvent } from '../../types';
import ItineraryItem from './ItineraryItem';
import DetailedForm from '../forms/DetailedForm';

interface ItineraryViewProps {
  dayPlan: DayPlan;
  isSurpriseMode?: boolean;
  onRevealMore?: () => void;
  onSharePlan?: () => void;
  onExportPDF?: () => void;
  onSavePlan?: () => void;
  onUpdatePlan?: (updatedPlan: DayPlan) => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  dayPlan,
  isSurpriseMode = false,
  onRevealMore,
  onSharePlan,
  onExportPDF,
  onSavePlan,
  onUpdatePlan
}) => {
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const getVisibleEvents = () => {
    if (!isSurpriseMode || !dayPlan.revealProgress) {
      return dayPlan.events;
    }
    
    const eventsToShow = Math.ceil((dayPlan.events.length * dayPlan.revealProgress) / 100);
    return dayPlan.events.slice(0, eventsToShow);
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleUpdatePlan = () => {
    if (!onUpdatePlan) return;

    const updatedEvents = dayPlan.events.filter(event => {
      const id = event.type === 'activity' ? event.data.id : event.data.id;
      return !selectedEvents.has(id);
    });

    const updatedPlan = {
      ...dayPlan,
      events: updatedEvents,
      totalCost: updatedEvents.reduce((sum, event) => sum + event.data.cost, 0),
      totalDuration: updatedEvents.reduce((sum, event) => sum + event.data.duration, 0),
    };

    onUpdatePlan(updatedPlan);
    setIsEditing(false);
    setSelectedEvents(new Set());
  };

  const WeatherCard = ({ forecast }: { forecast: WeatherForecast }) => (
    <Card className="bg-gradient-to-br from-secondary-100 to-secondary-50 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-secondary-800">Weather Forecast</h3>
          <p className="text-secondary-700">{forecast.condition}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-secondary-800">{forecast.temperature}°</div>
          <div className="text-xs text-secondary-600">Feels like {forecast.temperature - 2}°</div>
        </div>
      </div>
      
      {weatherExpanded && (
        <div className="mt-4 pt-4 border-t border-secondary-200 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-secondary-600">Precipitation</p>
            <p className="font-medium text-secondary-800">{forecast.precipitation}%</p>
          </div>
          <div>
            <p className="text-xs text-secondary-600">Wind</p>
            <p className="font-medium text-secondary-800">{forecast.windSpeed} mph</p>
          </div>
          <div>
            <p className="text-xs text-secondary-600">Humidity</p>
            <p className="font-medium text-secondary-800">68%</p>
          </div>
        </div>
      )}
      
      <button 
        className="text-xs text-secondary-600 hover:text-secondary-800 mt-2 focus:outline-none"
        onClick={() => setWeatherExpanded(!weatherExpanded)}
      >
        {weatherExpanded ? 'Show less' : 'Show more'}
      </button>
    </Card>
  );

  const visibleEvents = getVisibleEvents();
  const hiddenEvents = dayPlan.events.slice(visibleEvents.length);

  if (isEditing) {
    return (
      <div className="max-w-2xl w-full mx-auto">
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary-800">Edit Your Plan</h2>
            <Button
              variant="outline"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
          
          <div className="space-y-4">
            {dayPlan.events.map((event) => (
              <div key={`${event.type}-${event.data.id}`} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedEvents.has(event.data.id)}
                  onChange={() => handleEventToggle(event.data.id)}
                  className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <div className="flex-grow">
                  <ItineraryItem event={event} isRevealed={true} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="primary"
              onClick={handleUpdatePlan}
              disabled={selectedEvents.size === 0}
            >
              Update Plan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto">
      <Card className="mb-4">
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-primary-800">{dayPlan.title}</h2>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-neutral-600">
              <Calendar className="h-5 w-5 mr-1 text-primary-500" />
              <span>{new Date(dayPlan.date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <MapPin className="h-5 w-5 mr-1 text-primary-500" />
              <span>{dayPlan.preferences.startLocation}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-neutral-600">
              <Clock className="h-5 w-5 mr-1 text-primary-500" />
              <span>{formatDuration(dayPlan.totalDuration)}</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <DollarSign className="h-5 w-5 mr-1 text-primary-500" />
              <span>£{dayPlan.totalCost.toFixed(2)} total</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <Users className="h-5 w-5 mr-1 text-primary-500" />
              <span>{dayPlan.preferences.groupSize} {dayPlan.preferences.groupSize > 1 ? 'people' : 'person'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          {!isSurpriseMode && onUpdatePlan && (
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 className="h-4 w-4" />}
              onClick={() => setIsEditing(true)}
            >
              Modify Plan
            </Button>
          )}
          
          {isSurpriseMode && onSavePlan && (
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={onSavePlan}
            >
              Save Plan
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="h-4 w-4" />}
            onClick={onSharePlan}
          >
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
          >
            Export PDF
          </Button>
        </div>
      </Card>
      
      {dayPlan.weatherForecast && <WeatherCard forecast={dayPlan.weatherForecast} />}
      
      <div className="space-y-3 mb-6">
        {visibleEvents.map((event, index) => (
          <ItineraryItem key={`${event.type}-${event.data.id}`} event={event} isRevealed={true} />
        ))}
        
        {hiddenEvents.length > 0 && (
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-600 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2">
                  <circle cx="12\" cy="12\" r="10" />
                  <path d="M12 16v.01M12 8v4\" strokeLinecap="round\" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mt-2">
                {hiddenEvents.length} more activities to discover!
              </h3>
              <p className="text-neutral-600 mt-1">
                Ready to see what's next on your surprise itinerary?
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={onRevealMore}
              >
                Reveal Next Activity
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onRevealMore && [...Array(hiddenEvents.length)].forEach(() => onRevealMore())}
              >
                Reveal All
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-neutral-500 mb-8">
        <p>Information may not be accurate at time of plan generation.</p>
        <p>Please double-check all details including opening hours, prices, and availability before your planned day.</p>
      </div>
    </div>
  );
};

export default ItineraryView;