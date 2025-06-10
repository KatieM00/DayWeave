import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Locate } from 'lucide-react';
import Input from './Input';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  fullWidth?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter a specific address, hotel, venue, or location (e.g., The Shard London, Marriott Hotel Manchester)",
  error,
  label,
  fullWidth = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userGeolocation, setUserGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const loadGoogleMapsAPI = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        resolve();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true);
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        const errorMsg = 'Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.';
        setLoadError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      // Create callback function
      window.initGoogleMaps = () => {
        setIsGoogleMapsLoaded(true);
        resolve();
      };

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        const errorMsg = 'Failed to load Google Maps API. Please check your API key and internet connection.';
        setLoadError(errorMsg);
        reject(new Error(errorMsg));
      };
      
      document.head.appendChild(script);
    });
  };

  const initializeAutocomplete = (center?: { lat: number; lng: number }) => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    try {
      // Create autocomplete instance with broader search capabilities
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        // Remove types restriction to allow all place types (businesses, addresses, POIs, etc.)
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types']
      });

      // If we have user's location, bias the results towards their area
      if (center) {
        const circle = new window.google.maps.Circle({
          center: center,
          radius: 50000 // 50km radius
        });
        autocompleteRef.current.setBounds(circle.getBounds());
      }

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
        } else if (place && place.name) {
          onChange(place.name);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setLoadError('Failed to initialize location autocomplete. You can still enter locations manually.');
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLoadError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    setLoadError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserGeolocation(location);
        setIsLocating(false);

        // If autocomplete is already initialized, update its bounds
        if (autocompleteRef.current && window.google) {
          const circle = new window.google.maps.Circle({
            center: location,
            radius: 50000 // 50km radius
          });
          autocompleteRef.current.setBounds(circle.getBounds());
        }

        // Reverse geocode to get a detailed address (avoiding Plus Codes)
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ 
            location,
            // Add parameters to get better address resolution
            region: 'GB', // Since you're in Oxford, UK
            language: 'en'
          }, (results: any[], status: string) => {
            if (status === 'OK' && results && results.length > 0) {
              // Find the most specific address that's not a Plus Code
              let bestResult = results.find(result => 
                result.types.includes('street_address') || 
                result.types.includes('premise')
              );
              
              if (!bestResult) {
                bestResult = results.find(result => 
                  result.types.includes('route') || 
                  result.types.includes('neighborhood') ||
                  result.types.includes('sublocality')
                );
              }
              
              if (!bestResult) {
                bestResult = results.find(result => 
                  !result.formatted_address.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2}/)
                );
              }
              
              if (!bestResult) {
                bestResult = results[0];
              }
              
              // Try to build a readable address from components
              const components = bestResult.address_components;
              const addressParts = [];
              
              // Get street number and route
              const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name;
              const route = components.find((c: any) => c.types.includes('route'))?.long_name;
              
              if (streetNumber && route) {
                addressParts.push(`${streetNumber} ${route}`);
              } else if (route) {
                addressParts.push(route);
              }
              
              // Get neighborhood/area
              const neighborhood = components.find((c: any) => 
                c.types.includes('neighborhood') || 
                c.types.includes('sublocality') ||
                c.types.includes('sublocality_level_1')
              )?.long_name;
              
              if (neighborhood && !addressParts.includes(neighborhood)) {
                addressParts.push(neighborhood);
              }
              
              // Get city/town
              const city = components.find((c: any) => 
                c.types.includes('locality') || 
                c.types.includes('postal_town')
              )?.long_name;
              
              if (city && !addressParts.includes(city)) {
                addressParts.push(city);
              }
              
              // Use the constructed address if we have parts, otherwise use formatted_address
              if (addressParts.length > 0) {
                onChange(addressParts.join(', '));
              } else if (!bestResult.formatted_address.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2}/)) {
                onChange(bestResult.formatted_address);
              } else {
                // Last resort - just use the area if Plus Code is still showing
                const area = components.find((c: any) => 
                  c.types.includes('locality') || c.types.includes('postal_town')
                )?.long_name;
                onChange(area || bestResult.formatted_address);
              }
            }
          });
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLoadError('Location access denied. Please enable location permissions and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLoadError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLoadError('Location request timed out. Please try again.');
            break;
          default:
            setLoadError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        initializeAutocomplete(userGeolocation || undefined);
      })
      .catch((error) => {
        console.error('Google Maps API loading error:', error);
      });

    return () => {
      // Cleanup autocomplete
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Update autocomplete bounds when user location changes
  useEffect(() => {
    if (userGeolocation && isGoogleMapsLoaded && autocompleteRef.current) {
      const circle = new window.google.maps.Circle({
        center: userGeolocation,
        radius: 50000 // 50km radius
      });
      autocompleteRef.current.setBounds(circle.getBounds());
    }
  }, [userGeolocation, isGoogleMapsLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const displayError = error || loadError;
  const displayPlaceholder = isGoogleMapsLoaded 
    ? "Start typing..."
    : placeholder;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={displayPlaceholder}
            error={displayError}
            label={label}
            fullWidth={fullWidth}
            icon={<MapPin className="h-5 w-5 text-neutral-400" />}
          />
        </div>
        
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating || !isGoogleMapsLoaded}
          className={`
            flex items-center justify-center px-3 py-2 border-2 rounded-md
            transition-colors duration-200 min-w-[44px]
            ${isLocating || !isGoogleMapsLoaded
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-300'
              : 'bg-primary-600 text-white hover:bg-primary-700 border-primary-600 hover:border-primary-700 cursor-pointer'
            }
          `}
          title={isLocating ? "Locating..." : "Use my current location"}
        >
          {isLocating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <Locate className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {loadError && (
        <p className="mt-1 text-xs text-amber-600">
          Location autocomplete unavailable. Please enter a specific address, hotel, or venue manually.
        </p>
      )}
    </div>
  );
};

export default LocationInput;