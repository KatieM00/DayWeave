import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
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
  placeholder = "Enter a specific city, town, or postcode (e.g., London, SW1A 0AA)",
  error,
  label,
  fullWidth = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    try {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });

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

  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        initializeAutocomplete();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const displayError = error || loadError;
  const displayPlaceholder = isGoogleMapsLoaded 
    ? "Start typing a city, town, or address..."
    : placeholder;

  return (
    <div className="relative">
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
      {loadError && (
        <p className="mt-1 text-xs text-amber-600">
          Location autocomplete unavailable. Please enter a specific city or address manually.
        </p>
      )}
    </div>
  );
};

export default LocationInput;