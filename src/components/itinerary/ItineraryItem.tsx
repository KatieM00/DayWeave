import React, { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Activity, AlertTriangle, Camera, Star, Phone, Globe, Navigation, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import type { Activity as ActivityType, Travel, ItineraryEvent } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { getPlaceDetails, getPlacePhoto, searchPlaces } from '../../services/api';

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

  // Helper function to format time strings consistently
  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    
    // Remove any commas that might have been added by number formatting
    const cleanTime = timeString.toString().replace(/,/g, '');
    
    // If it's already in HH:MM format, return as is
    if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
      const [hours, minutes] = cleanTime.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    // If it's a number, try to convert it to time format
    const numericTime = parseFloat(cleanTime);
    if (!isNaN(numericTime)) {
      const hours = Math.floor(numericTime);
      const minutes = Math.round((numericTime - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Return the original string if we can't parse it
    return cleanTime;
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
      console.log('✅ Conditions met for loading Google Maps data - calling loadGoogleMapsData()');
      loadGoogleMapsData();
    } else {
      console.log('❌ Conditions NOT met for loading Google Maps data:', {
        expanded,
        isActivity: event.type === 'activity',
        hasGoogleMapsData: !!googleMapsData,
        loadingMapsData
      });
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
      console.log('📍 About to search places with:', {
        activityName: activity.name,
        planStartLocation,
        activityLocation: activity.location
      });
      
      // Search for the place using activity.location (the exact venue name) instead of activity.name
      console.log('🔍 Calling searchPlaces API...');
      const places = await searchPlaces(activity.location, planStartLocation);
      console.log('📍 searchPlaces response:', places);
      
      if (places.length > 0) {
        const place = places[0];
        console.log('🏢 Found place, getting details for place_id:', place.place_id);
        
        // Get detailed place information
        console.log('📋 Calling getPlaceDetails API...');
        const details = await getPlaceDetails(place.place_id);
        console.log('📋 getPlaceDetails response:', details);
        
        // Load photos if available
        const photoUrls: string[] = [];
        if (details.photos && details.photos.length > 0) {
          console.log(`📸 Found ${details.photos.length} photos, loading up to 5...`);
          
          // Load up to 5 photos
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
        } else {
          console.log('📸 No photos available for this place');
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
      console.log('🏁 loadGoogleMapsData completed');
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

  const renderActivityContent = (activity: ActivityType) => {
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
        
        {/* NO description here - moved to details section */}
        
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

        {expanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            {/* Description moved here - appears FIRST in details section */}
            <div className="mb-4">
              <p className="text-neutral-600">{activity.description}</p>
            </div>

            {/* Photo carousel */}
            {mapsImages.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <img
                    src={mapsImages[currentImageIndex]}
                    alt={activity.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageLoading(false)}
                  />
                  {mapsImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + mapsImages.length) % mapsImages.length)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % mapsImages.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {mapsImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {loadingMapsData && (
              <div className="mb-4 flex items-center justify-center h-32 bg-neutral-50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
                <span className="ml-2 text-neutral-600">Loading Google Maps data...</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Address</h4>
                <a 
                  href="#"
                  onClick={(e) => handleDirectionsClick(e, getDirectionsUrl(googleMapsData?.formatted_address || activity.address || activity.location))}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {googleMapsData?.formatted_address || activity.address || activity.location}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Duration</h4>
                <p className="text-sm text-neutral-600">
                  {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                </p>
              </div>
              
              {googleMapsData?.formatted_phone_number && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Phone</h4>
                  <a 
                    href={`tel:${googleMapsData.formatted_phone_number}`}
                    className="text-sm text-primary-600 hover:underline flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {googleMapsData.formatted_phone_number}
                  </a>
                </div>
              )}
              
              {googleMapsData?.website && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Website</h4>
                  <a 
                    href={googleMapsData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
              
              {googleMapsData?.rating && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Rating</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-neutral-600">
                      {googleMapsData.rating} ({googleMapsData.user_ratings_total} reviews)
                    </span>
                  </div>
                </div>
              )}
              
              {googleMapsData?.opening_hours && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Hours</h4>
                  <p className="text-sm text-neutral-600">
                    {googleMapsData.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDirectionsClick(e, getDirectionsUrl(googleMapsData?.formatted_address || activity.location))}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Get Directions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDirectionsClick(e, getGoogleMapsUrl(activity.location))}
              >
                <MapPin className="h-4 w-4 mr-1" />
                View on Map
              </Button>
            </div>
          </div>
        )}
      </>
    );
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
          
          {/* Single "Get Directions" button - no "Route Details" */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleDirectionsClick(e, directionsUrl)}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Get Directions
          </Button>
        </div>
        
        {/* Travel segments should show duration and distance info inline */}
        <div className="text-sm text-neutral-500 ml-11">
          {travel.distance && travel.distance > 0 && (
            <span>{travel.distance} miles • </span>
          )}
          {travel.duration && travel.duration > 0 && (
            <span>{travel.duration} min</span>
          )}
          {travel.cost && travel.cost > 0 && (
            <span> • £{travel.cost}</span>
          )}
        </div>
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

      {/* Directions warning modal for surprise mode */}
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