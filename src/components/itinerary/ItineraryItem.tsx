import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Activity, Travel, ItineraryEvent } from '../../types';
import Card from '../common/Card';

interface ItineraryItemProps {
  event: ItineraryEvent;
  isRevealed?: boolean;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ event, isRevealed = true }) => {
  const [expanded, setExpanded] = useState(false);

  if (!isRevealed) {
    return (
      <Card className="mb-3 opacity-60">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-400\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2">
                <path d="M9 12h6m-6-4h6m-6 8h6M12 2v20\" strokeLinecap="round\" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-600">??? Mystery Activity ???</h3>
              <p className="text-neutral-500 text-sm">Coming soon...</p>
            </div>
          </div>
          <div className="flex items-center text-neutral-400 space-x-1">
            <span>??:?? - ??:??</span>
          </div>
        </div>
      </Card>
    );
  }

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const renderActivityContent = (activity: Activity) => {
    return (
      <>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              {getActivityIcon(activity.activityType[0])}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-800">{activity.name}</h3>
              <div className="flex items-center text-sm text-neutral-600">
                <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                <span>{activity.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-sm text-neutral-600">
              <Clock className="h-4 w-4 mr-1 text-primary-500" />
              <span>{activity.startTime} - {activity.endTime}</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600 mt-1">
              <DollarSign className="h-4 w-4 mr-1 text-primary-500" />
              <span>£{activity.cost}</span>
            </div>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-neutral-700 mb-3">{activity.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Address</h4>
                <p className="text-sm text-neutral-600">{activity.address || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Duration</h4>
                <p className="text-sm text-neutral-600">
                  {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                </p>
              </div>
              {activity.contactInfo && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Contact</h4>
                  <p className="text-sm text-neutral-600">{activity.contactInfo}</p>
                </div>
              )}
              {activity.ratings && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Rating</h4>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(activity.ratings || 0) ? 'text-accent-500' : 'text-neutral-300'}`} 
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-neutral-600">{activity.ratings}</span>
                  </div>
                </div>
              )}
            </div>
            
            {activity.imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden h-48">
                <img 
                  src={activity.imageUrl} 
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {activity.bookingLink && (
              <a 
                href={activity.bookingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Book Now
              </a>
            )}
          </div>
        )}
        
        <button
          onClick={toggleExpand}
          className="flex items-center text-primary-600 hover:text-primary-700 mt-3 text-sm font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details
            </>
          )}
        </button>
      </>
    );
  };

  const renderTravelContent = (travel: Travel) => {
    return (
      <div className="flex items-center py-2">
        <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
          {getTransportIcon(travel.mode)}
        </div>
        <div className="ml-4 flex-grow">
          <h3 className="text-neutral-700 font-medium">{getTransportLabel(travel.mode)}</h3>
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{travel.startTime} - {travel.endTime} ({Math.floor(travel.duration)} min)</span>
            <span>{travel.distance} miles</span>
          </div>
        </div>
        <div className="text-right text-neutral-600">
          {travel.cost > 0 && <span>£{travel.cost.toFixed(2)}</span>}
        </div>
      </div>
    );
  };

  return (
    <Card className={`mb-3 ${event.type === 'travel' ? 'border-l-4 border-secondary-400 bg-secondary-50' : ''}`}>
      {event.type === 'activity' 
        ? renderActivityContent(event.data) 
        : renderTravelContent(event.data)
      }
    </Card>
  );
};

// Helper functions to get icons based on types
const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'outdoor':
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M12 2v20M22 17.8L12 12l-10 5.8M2 8.8L12 14l10-5.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'indoor':
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'nature':
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 18H3M21 18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2M12 2l4 4-4 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 6l-4 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 6l4 4-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'culture':
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="2" x2="8" y2="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16" y1="2" x2="16" y2="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4" y1="9" x2="20" y2="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'food':
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M5 8h11v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8zm0 0V7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const getTransportIcon = (mode: TransportMode) => {
  switch (mode) {
    case 'walking':
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 4v16m-8-5 8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cycling':
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'driving':
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17h10m-6-8h2m-9 6V10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 15h14m-7-5.5v.01M5 11l-2 4h18l-2-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bus':
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7h8m-8 4h8m-8 4h.01M16 15h.01M19 17h1V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10h1m12 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2m-6 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2m0-4h14v2H4v-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'train':
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 16h8M8 16v1M16 16v1m-8-9h8m-4-4H8a2 2 0 0 0-2 2v10m0 0h12M6 16V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10m0 0v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="8 12 12 16 16 12" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const getTransportLabel = (mode: TransportMode): string => {
  switch (mode) {
    case 'walking': return 'Walking';
    case 'cycling': return 'Cycling';
    case 'driving': return 'Driving';
    case 'bus': return 'Bus';
    case 'train': return 'Train';
    case 'boat': return 'Boat';
    case 'taxi': return 'Taxi';
    default: return 'Travel';
  }
};

export default ItineraryItem;