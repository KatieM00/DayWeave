import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found. Some features may be limited.');
}

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places']
});

let placesService: google.maps.places.PlacesService;

const initPlacesService = async () => {
  if (!placesService) {
    await loader.load();
    const mapDiv = document.createElement('div');
    const map = new google.maps.Map(mapDiv, { center: { lat: 0, lng: 0 }, zoom: 1 });
    placesService = new google.maps.places.PlacesService(map);
  }
  return placesService;
};

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  photos: { photo_reference: string }[];
  opening_hours: {
    open_now: boolean;
    weekday_text: string[];
  };
  price_level: number;
  website: string;
  formatted_phone_number: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export const searchPlaces = async (query: string, location: string): Promise<PlaceDetails[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    return [];
  }

  const service = await initPlacesService();

  // First, geocode the location to get coordinates
  const geocoder = new google.maps.Geocoder();
  const { results } = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK') resolve({ results: results ?? [] });
      else reject(new Error(`Geocoding failed: ${status}`));
    });
  });

  if (!results?.[0]?.geometry?.location) {
    throw new Error('Location not found');
  }

  const locationCoords = results[0].geometry.location;

  // Then search for places near that location
  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceSearchRequest = {
      keyword: query,
      location: locationCoords,
      radius: 5000 // 5km radius
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places = results.map(place => ({
          place_id: place.place_id!,
          name: place.name!,
          formatted_address: place.formatted_address!,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          photos: place.photos?.map(photo => ({ photo_reference: photo.photo_reference ?? '' })) || [],
          opening_hours: {
            open_now: place.opening_hours?.isOpen() || false,
            weekday_text: place.opening_hours?.weekday_text || []
          },
          price_level: place.price_level || 0,
          website: '',
          formatted_phone_number: '',
          geometry: {
            location: {
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng()
            }
          }
        }));
        resolve(places);
      } else {
        reject(new Error(`Place search failed: ${status}`));
      }
    });
  });
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const service = await initPlacesService();

  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: [
        'name',
        'formatted_address',
        'rating',
        'user_ratings_total',
        'photos',
        'opening_hours',
        'price_level',
        'website',
        'formatted_phone_number',
        'geometry'
      ]
    };

    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        resolve({
          place_id: place.place_id!,
          name: place.name!,
          formatted_address: place.formatted_address!,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          photos: place.photos?.map(photo => ({ photo_reference: photo.photo_reference ?? '' })) || [],
          opening_hours: {
            open_now: place.opening_hours?.isOpen() || false,
            weekday_text: place.opening_hours?.weekday_text || []
          },
          price_level: place.price_level || 0,
          website: place.website || '',
          formatted_phone_number: place.formatted_phone_number || '',
          geometry: {
            location: {
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng()
            }
          }
        });
      } else {
        reject(new Error(`Place details failed: ${status}`));
      }
    });
  });
};

export const getPlacePhoto = async (photoReference: string, maxWidth: number = 400): Promise<string> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/place/photo';
  const url = `${baseUrl}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch photo');
    return url;
  } catch (error) {
    console.error('Error fetching place photo:', error);
    throw error;
  }
};