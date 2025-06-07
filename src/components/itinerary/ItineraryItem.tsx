import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Activity, AlertTriangle, Camera } from 'lucide-react';
import type { Activity as ActivityType, Travel, ItineraryEvent } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { getPlaceholderImage } from '../../utils/imageUtils';

interface ItineraryItemProps {
  event: ItineraryEvent;
  isRevealed?: boolean;
  isSurpriseMode?: boolean;
  isPreviouslyRevealed?: boolean;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ 
  event, 
  isRevealed = true,
  isSurpriseMode = false,
  isPreviouslyRevealed = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDirectionsWarning, setShowDirectionsWarning] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const handleDirectionsClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if (!isSurpriseMode) {
      window.open(url, '_blank');
      return;
    }
    setPendingUrl(url);
    setShowDirectionsWarning(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const DirectionsWarning = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fadeIn">
        <div className="flex items-center gap-3 text-warning-default mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Woooah!</h3>
        </div>
        
        <p className="text-neutral-600 mb-6">
          Are you ready to see your next location? Clicking 'show location' will open Google Maps!
        </p>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowDirectionsWarning(false);
              setPendingUrl('');
            }}
          >
            Not yet
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open(pendingUrl, '_blank');
              setShowDirectionsWarning(false);
              setPendingUrl('');
            }}
          >
            Show Location
          </Button>
        </div>
      </div>
    </div>
  );

  if (!isRevealed && !isPreviouslyRevealed) {
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

  const renderActivityContent = (activity: ActivityType) => {
    const imageUrl = activity.imageUrl || (activity.activityType?.length > 0 
      ? getPlaceholderImage(activity.activityType[0], activity.name)
      : null);

    return (
      <>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-800">{activity.name}</h3>
              <div className="flex items-center text-sm text-neutral-600">
                <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                <a 
                  href="#"
                  onClick={(e) => handleDirectionsClick(e, getGoogleMapsUrl(activity.location))}
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
                  href="#"
                  onClick={(e) => handleDirectionsClick(e, getGoogleMapsUrl(activity.address || activity.location))}
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
            
            {imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden h-48 relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                  </div>
                )}
                {imageError ? (
                  <div className="h-full bg-neutral-100 flex items-center justify-center">
                    <div className="text-center text-neutral-500">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span className="text-sm">Image unavailable</span>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={imageUrl}
                    alt={activity.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => {
                      setImageLoading(false);
                      setImageError(false);
                    }}
                    onError={handleImageError}
                  />
                )}
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
          onClick={() => setExpanded(!expanded)}
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
          <Activity className="w-6 h-6 text-secondary-600" />
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
          href="#"
          onClick={(e) => handleDirectionsClick(e, getDirectionsUrl())}
          className="ml-2 text-secondary-600 hover:text-secondary-700 flex items-center"
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">Directions</span>
        </a>
      </div>
    );
  };

  return (
    <>
      <Card className={`mb-3 ${event.type === 'travel' ? 'border-l-4 border-secondary-400 bg-secondary-50' : ''}`}>
        {event.type === 'activity' 
          ? renderActivityContent(event.data) 
          : renderTravelContent(event.data)
        }
      </Card>
      {showDirectionsWarning && <DirectionsWarning />}
    </>
  );
};

export default ItineraryItem;