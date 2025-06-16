// Enhanced ItineraryItem component with proper Google Maps Directions API integration

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Activity, AlertTriangle, Camera, Star, Phone, Globe, Navigation, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import type { Activity as ActivityType, Travel, ItineraryEvent } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { getPlaceDetails, getPlacePhoto, searchPlaces } from '../../services/api';

interface TravelDirections {
  distance: string;
  duration: string;
  steps: {
    instructions: string;
    distance: string;
    duration: string;
  }[];
  mode: string;
}

interface ItineraryItemProps {
  event: ItineraryEvent;
  isRevealed?: boolean;
  isSurpriseMode?: boolean;
  isPreviouslyRevealed?: boolean;
  planStartLocation?: string;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ 
  event, 
  isRevealed = true,
  isSurpriseMode = false,
  isPreviouslyRevealed = false,
  planStartLocation = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDirectionsWarning, setShowDirectionsWarning] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [googleMapsData, setGoogleMapsData] = useState<any>(null);
  const [loadingMapsData, setLoadingMapsData] = useState(false);
  const [mapsImages, setMapsImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [travelDirections, setTravelDirections] = useState<TravelDirections | null>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);

  // Helper function to format time strings consistently
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    
    const cleanTime = timeString.toString().replace(/,/g, '');
    
    if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
      const [hours, minutes] = cleanTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    const numericTime = parseFloat(cleanTime);
    if (!isNaN(numericTime)) {
      const hours = Math.floor(numericTime);
      const minutes = Math.round((numericTime - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return cleanTime;
  };

  // Function to get real travel directions using Google Maps Directions API
  const loadTravelDirections = async (travel: Travel) => {
    if (!window.google || !window.google.maps) {
      console.log('❌ Google Maps not loaded for directions');
      return;
    }

    console.log('🗺️ Loading real travel directions...', {
      from: travel.startLocation,
      to: travel.endLocation,
      mode: travel.mode
    });

    setLoadingDirections(true);

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Map our mode to Google Maps travel mode
      let travelMode = window.google.maps.TravelMode.WALKING;
      switch (travel.mode) {
        case 'driving':
          travelMode = window.google.maps.TravelMode.DRIVING;
          break;
        case 'cycling':
          travelMode = window.google.maps.TravelMode.BICYCLING;
          break;
        case 'transit':
          travelMode = window.google.maps.TravelMode.TRANSIT;
          break;
        default:
          travelMode = window.google.maps.TravelMode.WALKING;
      }

      const request = {
        origin: travel.startLocation,
        destination: travel.endLocation,
        travelMode: travelMode,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result?.routes?.[0]) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const directions: TravelDirections = {
            distance: leg.distance?.text || `${travel.distance || 0.5} miles`,
            duration: leg.duration?.text || `${travel.duration || 15} min`,
            steps: leg.steps?.map(step => ({
              instructions: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
              distance: step.distance?.text || '',
              duration: step.duration?.text || ''
            })) || [],
            mode: travel.mode
          };

          console.log('✅ Real directions loaded:', directions);
          setTravelDirections(directions);
        } else {
          console.log('❌ Directions request failed:', status);
          // Fallback to original data
          setTravelDirections({
            distance: `${travel.distance || 0.5} miles`,
            duration: `${travel.duration || 15} min`,
            steps: [{
              instructions: `${travel.mode === 'walking' ? 'Walk' : travel.mode === 'driving' ? 'Drive' : 'Travel'} to ${travel.endLocation}`,
              distance: `${travel.distance || 0.5} miles`,
              duration: `${travel.duration || 15} min`
            }],
            mode: travel.mode
          });
        }
        setLoadingDirections(false);
      });
    } catch (error) {
      console.error('❌ Error getting directions:', error);
      setLoadingDirections(false);
    }
  };

  // Load Google Maps data when component mounts or expands
  useEffect(() => {
    console.log('🔍 ItineraryItem useEffect triggered:', {
      expanded,
      eventType: event.type,
      hasGoogleMapsData: !!googleMapsData,
      loadingMapsData,
      activityName: event.type === 'activity' ? event.data.name : 'N/A',
      planStartLocation
    });

    if (expanded && event.type === 'activity' && !googleMapsData && !loadingMapsData) {
      console.log('✅ Loading Google Maps data for activity');
      loadGoogleMapsData();
    } else if (expanded && event.type === 'travel' && !travelDirections && !loadingDirections) {
      console.log('✅ Loading travel directions');
      loadTravelDirections(event.data as Travel);
    }
  }, [expanded, event]);

  const loadGoogleMapsData = async () => {
    if (event.type !== 'activity') {
      console.log('❌ Not an activity event, skipping Google Maps data load');
      return;
    }
    
    console.log('🚀 Starting loadGoogleMapsData...');
    setLoadingMapsData(true);
    
    try {
      const activity = event.data as ActivityType;
      console.log('📍 Searching for place:', activity.location);
      
      const places = await searchPlaces(activity.location, planStartLocation);
      console.log('📍 searchPlaces response:', places);
      
      if (places.length > 0) {
        const place = places[0];
        console.log('🏢 Found place, getting details for place_id:', place.place_id);
        
        const details = await getPlaceDetails(place.place_id);
        console.log('📋 getPlaceDetails response:', details);
        
        // Load photos if available
        const photoUrls: string[] = [];
        if (details.photos && details.photos.length > 0) {
          console.log(`📸 Found ${details.photos.length} photos, loading up to 5...`);
          
          const photoPromises = details.photos.slice(0, 5).map(async (photo, index) => {
            try {
              console.log(`📸 Loading photo ${index + 1}:`, photo.photo_reference);
              const photoUrl = await getPlacePhoto(photo.photo_reference, 600);
              console.log(`✅ Photo ${index + 1} loaded:`, photoUrl);
              return photoUrl;
            } catch (error) {
              console.error(`❌ Error loading photo ${index + 1}:`, error);
              return null;
            }
          });
          
          const photos = await Promise.all(photoPromises);
          const validPhotos = photos.filter(url => url !== null) as string[];
          photoUrls.push(...validPhotos);
          console.log(`📸 Successfully loaded ${validPhotos.length} photos`);
        }
        
        setGoogleMapsData(details);
        setMapsImages(photoUrls);
        console.log('✅ Google Maps data loaded successfully');
      } else {
        console.log('❌ No places found for activity:', activity.name);
      }
    } catch (error) {
      console.error('❌ Error loading Google Maps data:', error);
    } finally {
      setLoadingMapsData(false);
    }
  };

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const getDirectionsUrl = (destination: string, origin?: string) => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    if (origin) {
      url += `&origin=${encodeURIComponent(origin)}`;
    }
    return url;
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

  const renderTravelContent = (travel: Travel) => {
    const directionsUrl = getDirectionsUrl(travel.endLocation, travel.startLocation);
    
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full mr-3">
              <Navigation className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">
                {formatTime(travel.startTime)} — {formatTime(travel.endTime)}
              </h3>
              <p className="text-sm text-neutral-600">
                {travel.mode.charAt(0).toUpperCase() + travel.mode.slice(1)} to next location
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Route Details
              </>
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            {loadingDirections ? (
              <div className="flex items-center justify-center h-20 bg-neutral-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
                <span className="ml-2 text-neutral-600">Loading route details...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-1">Distance</h4>
                    <p className="text-sm text-neutral-600">
                      {travelDirections?.distance || `${travel.distance || 0.5} miles`}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-1">Duration</h4>
                    <p className="text-sm text-neutral-600">
                      {travelDirections?.duration || `${travel.duration || 15} min`}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-1">Mode</h4>
                    <p className="text-sm text-neutral-600 capitalize">
                      {travel.mode}
                    </p>
                  </div>
                </div>

                {travelDirections?.steps && travelDirections.steps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Route Steps</h4>
                    <div className="space-y-2">
                      {travelDirections.steps.map((step, index) => (
                        <div key={index} className="flex items-start p-2 bg-neutral-50 rounded-lg">
                          <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-800">{step.instructions}</p>
                            {step.distance && step.duration && (
                              <p className="text-xs text-neutral-500 mt-1">
                                {step.distance} • {step.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDirectionsClick(e, directionsUrl)}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Get Directions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDirectionsClick(e, getGoogleMapsUrl(`${travel.startLocation} to ${travel.endLocation}`))}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    View on Map
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </>
    );
  };

  // Rest of your existing renderActivityContent function stays the same...
  const renderActivityContent = (activity: ActivityType) => {
    // Your existing activity rendering code
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full mr-3">
              <Activity className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">{activity.name}</h3>
              <p className="text-sm text-neutral-600">
                {formatTime(activity.startTime)} — {formatTime(activity.endTime)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary-600">
              £{activity.cost}
            </p>
          </div>
        </div>
        
        <p className="text-neutral-600 mb-4">{activity.description}</p>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details & Photos
            </>
          )}
        </button>
        
        {/* Your existing expanded activity content... */}
      </>
    );
  };

  const eventData = event.data;

  if (!isRevealed && isSurpriseMode && !isPreviouslyRevealed) {
    return (
      <Card className="mb-4 bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-dashed border-primary-300">
        <div className="flex items-center justify-center h-20">
          <div className="text-center">
            <Activity className="h-8 w-8 text-primary-400 mx-auto mb-2" />
            <p className="text-primary-600 font-medium">Surprise activity - check back later!</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow">
        {event.type === 'activity' ? 
          renderActivityContent(eventData as ActivityType) : 
          renderTravelContent(eventData as Travel)
        }
      </Card>

      {/* Directions warning modal */}
      {showDirectionsWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-lg font-semibold">Leave Surprise Mode?</h3>
            </div>
            <p className="text-neutral-600 mb-6">
              Opening directions will reveal your location and might spoil upcoming surprises. Are you sure you want to continue?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDirectionsWarning(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  window.open(pendingUrl, '_blank');
                  setShowDirectionsWarning(false);
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItineraryItem;