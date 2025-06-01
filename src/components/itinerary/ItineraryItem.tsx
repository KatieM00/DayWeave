import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import type { Activity as ActivityType, Travel, ItineraryEvent, ActivityType as ActivityTypeEnum, TransportMode } from '../../types';
import Card from '../common/Card';

interface ItineraryItemProps {
  event: ItineraryEvent;
  isRevealed?: boolean;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ event, isRevealed = true }) => {
  const [expanded, setExpanded] = useState(false);

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const getGoogleMapsEmbedUrl = (location: string) => {
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(location)}&zoom=15`;
  };

  if (!isRevealed) {
    return (
      <Card className="mb-3 opacity-60">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
              <Activity className="w-6 h-6 text-neutral-400" />
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

  const renderActivityContent = (activity: ActivityType) => {
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
                <a 
                  href={getGoogleMapsUrl(activity.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 hover:underline"
                >
                  {activity.location}
                </a>
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
                <a 
                  href={getGoogleMapsUrl(activity.address || activity.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  {activity.address || activity.location}
                </a>
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
            
            <div className="mt-3 rounded-md overflow-hidden h-64">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={getGoogleMapsEmbedUrl(activity.address || activity.location)}
              />
            </div>
            
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
    const getDirectionsUrl = () => {
      const origin = encodeURIComponent(travel.startLocation);
      const destination = encodeURIComponent(travel.endLocation);
      const mode = travel.mode === 'driving' ? 'driving' : 
                  travel.mode === 'walking' ? 'walking' :
                  travel.mode === 'cycling' ? 'bicycling' :
                  'transit';
      
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
    };

    return (
      <div className="flex items-center py-2 px-3 bg-secondary-50 border-l-4 border-secondary-400">
        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
          {getTransportIcon(travel.mode)}
        </div>
        
        <div className="ml-3 flex-grow">
          <div className="flex items-center text-sm text-neutral-600">
            <span>{travel.startTime} → {travel.endTime}</span>
            <span className="mx-2">•</span>
            <span>{Math.floor(travel.duration)} min</span>
            <span className="mx-2">•</span>
            <span>{travel.distance} miles</span>
          </div>
        </div>
        
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-secondary-600 hover:text-secondary-700 flex items-center"
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">Directions</span>
        </a>
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

const getActivityIcon = (type: ActivityTypeEnum) => {
  switch (type) {
    case 'outdoor':
      return <Activity className="w-6 h-6 text-primary-600" />;
    case 'indoor':
      return <MapPin className="w-6 h-6 text-primary-600" />;
    case 'nature':
      return <MapPin className="w-6 h-6 text-primary-600" />;
    case 'culture':
      return <MapPin className="w-6 h-6 text-primary-600" />;
    case 'food':
      return <MapPin className="w-6 h-6 text-primary-600" />;
    default:
      return <MapPin className="w-6 h-6 text-primary-600" />;
  }
};

const getTransportIcon = (mode: TransportMode) => {
  return <MapPin className="w-6 h-6 text-secondary-600" />;
};

export default ItineraryItem;