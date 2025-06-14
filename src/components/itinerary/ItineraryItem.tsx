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

  const getDirectionsUrl = (destination: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mapsImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mapsImages.length) % mapsImages.length);
  };

  const getBookingButtonText = (activity: ActivityType) => {
    if (activity.activityType.includes('movies')) return 'Book Tickets';
    if (activity.activityType.includes('theatre')) return 'Book Show';
    if (activity.activityType.includes('food')) return 'Make Reservation';
    if (activity.activityType.includes('music')) return 'Buy Tickets';
    if (activity.activityType.includes('tourist')) return 'Book Entry';
    return 'Book Now';
  };

  const getBookingIcon = (activity: ActivityType) => {
    if (activity.activityType.includes('movies') || activity.activityType.includes('theatre') || activity.activityType.includes('music')) {
      return <CreditCard className="w-4 h-4" />;
    }
    if (activity.activityType.includes('food')) {
      return <Calendar className="w-4 h-4" />;
    }
    return <ExternalLink className="w-4 h-4" />;
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
              {googleMapsData && (
                <div className="flex items-center text-sm text-neutral-500 mt-1">
                  <Star className="h-4 w-4 mr-1 text-accent-500" />
                  <span>{googleMapsData.rating} ({googleMapsData.user_ratings_total} reviews)</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-sm text-neutral-600">
              <Clock className="h-4 w-4 mr-1 text-primary-500" />
              <span>{formatTime(activity.startTime)} - {formatTime(activity.endTime)}</span>
            </div>
            <div className="flex items-center text-sm text-neutral-600 mt-1">
              <DollarSign className="h-4 w-4 mr-1 text-primary-500" />
              <span>£{activity.cost}</span>
            </div>
          </div>
        </div>

        {/* Booking requirement notice in collapsed view - simple and clean */}
        {activity.bookingRequired && !expanded && (
          <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Booking required</span>
          </div>
        )}
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-neutral-700 mb-4">{activity.description}</p>

            {/* Detailed booking information in expanded view */}
            {activity.bookingRequired && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-amber-800 mb-2">Booking Required</p>
                    <p className="text-sm text-amber-700 mb-3">
                      {activity.bookingAdvice || 'This activity requires advance booking. We recommend booking as soon as possible to secure your spot.'}
                    </p>
                    {activity.bookingLink && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={getBookingIcon(activity)}
                        onClick={() => window.open(activity.bookingLink, '_blank')}
                        className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                      >
                        {getBookingButtonText(activity)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Google Maps Images Gallery */}
            {mapsImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Photos from Google Maps</h4>
                <div className="relative rounded-lg overflow-hidden h-64 bg-neutral-100">
                  <img 
                    src={mapsImages[currentImageIndex]}
                    alt={`${activity.name} - Photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      // Remove failed image and try next one
                      const newImages = mapsImages.filter((_, index) => index !== currentImageIndex);
                      setMapsImages(newImages);
                      if (newImages.length > 0) {
                        setCurrentImageIndex(0);
                      }
                    }}
                  />
                  
                  {mapsImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </button>
                      
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {mapsImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
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
              
              {activity.ticketProvider && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Ticket Provider</h4>
                  <p className="text-sm text-neutral-600">{activity.ticketProvider}</p>
                </div>
              )}
              
              {googleMapsData?.opening_hours && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Opening Hours</h4>
                  <div className="text-sm text-neutral-600">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      googleMapsData.opening_hours.open_now 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {googleMapsData.opening_hours.open_now ? 'Open Now' : 'Closed'}
                    </div>
                    {googleMapsData.opening_hours.weekday_text && googleMapsData.opening_hours.weekday_text.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {googleMapsData.opening_hours.weekday_text.map((day: string, index: number) => (
                          <div key={index} className="text-xs">{day}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {googleMapsData?.price_level && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Price Level</h4>
                  <div className="flex items-center">
                    {[...Array(4)].map((_, i) => (
                      <DollarSign 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < googleMapsData.price_level ? 'text-green-600' : 'text-neutral-300'
                        }`} 
                      />
                    ))}
                    <span className="ml-2 text-xs text-neutral-500">
                      {googleMapsData.price_level === 1 && 'Inexpensive'}
                      {googleMapsData.price_level === 2 && 'Moderate'}
                      {googleMapsData.price_level === 3 && 'Expensive'}
                      {googleMapsData.price_level === 4 && 'Very Expensive'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="primary"
                size="sm"
                icon={<Navigation className="w-4 h-4" />}
                onClick={() => window.open(getDirectionsUrl(googleMapsData?.formatted_address || activity.location), '_blank')}
              >
                Get Directions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                icon={<MapPin className="w-4 h-4" />}
                onClick={() => window.open(getGoogleMapsUrl(activity.location), '_blank')}
              >
                View on Maps
              </Button>
              
              {/* Only show booking button in expanded view if not already shown in booking notice */}
              {activity.bookingLink && !activity.bookingRequired && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={getBookingIcon(activity)}
                  onClick={() => window.open(activity.bookingLink, '_blank')}
                  className="bg-accent-500 hover:bg-accent-600 text-neutral-900"
                >
                  {getBookingButtonText(activity)}
                </Button>
              )}

              {googleMapsData?.website && !activity.bookingLink && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Globe className="w-4 h-4" />}
                  onClick={() => window.open(googleMapsData.website, '_blank')}
                >
                  Visit Website
                </Button>
              )}
            </div>
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
              Show Details & Photos
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
            <span>{formatTime(travel.startTime)} → {formatTime(travel.endTime)}</span>
            <span className="mx-2">•</span>
            <span>{Math.floor(travel.duration)} min</span>
            <span className="mx-2">•</span>
            <span>{travel.distance} miles</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{travel.mode}</span>
          </div>
          
          {/* Travel booking notice with integrated booking link */}
          {travel.bookingRequired && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-amber-600 flex-shrink-0" />
                <div className="flex-grow">
                  <span className="text-amber-800 font-medium">Booking required: </span>
                  <span className="text-amber-700">{travel.bookingAdvice || 'Advance booking recommended'}</span>
                  {travel.bookingLink && (
                    <a
                      href={travel.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-amber-700 hover:text-amber-800 font-medium underline"
                    >
                      Book Now <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href="#"
            onClick={(e) => handleDirectionsClick(e, getDirectionsUrl())}
            className="ml-2 text-secondary-600 hover:text-secondary-700 flex items-center"
          >
            <Navigation className="h-4 w-4 mr-1" />
            <span className="text-sm">Directions</span>
          </a>
        </div>
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