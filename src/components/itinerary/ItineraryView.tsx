import React, { useState } from 'react';
import { Clock, DollarSign, MapPin, Calendar, Share2, Users } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { DayPlan, WeatherForecast } from '../../types';
import ItineraryItem from './ItineraryItem';

interface ItineraryViewProps {
  dayPlan: DayPlan;
  isSurpriseMode?: boolean;
  onRevealMore?: () => void;
  onSharePlan?: () => void;
  onExportPDF?: () => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  dayPlan,
  isSurpriseMode = false,
  onRevealMore,
  onSharePlan,
  onExportPDF,
}) => {
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  
  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Helper function to determine how many events to show
  const getVisibleEvents = () => {
    if (!isSurpriseMode || !dayPlan.revealProgress) {
      return dayPlan.events;
    }
    
    // Calculate how many events to show based on revealProgress percentage
    const eventsToShow = Math.ceil((dayPlan.events.length * dayPlan.revealProgress) / 100);
    return dayPlan.events.slice(0, eventsToShow);
  };

  // Weather card component
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

  return (
    <div className="max-w-2xl w-full mx-auto">
      <Card className="mb-4">
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-primary-800">{dayPlan.title}</h2>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-neutral-600">
              <Calendar className="h-5 w-5 mr-1 text-primary-500" />
              <span>{new Date(dayPlan.date).toLocaleDateString('en-US', { 
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