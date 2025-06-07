import type { DayPlan, UserPreferences, Activity, WeatherForecast } from '../types';

// Get the correct Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_DATABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Extract the base URL (remove any trailing paths)
const baseUrl = SUPABASE_URL.replace(/\/+$/, '');

// Helper function to make authenticated requests to edge functions
const callEdgeFunction = async (functionName: string, payload: any) => {
  const url = `${baseUrl}/functions/v1/${functionName}`;
  
  console.log(`Calling edge function: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error (${response.status}):`, errorText);
      throw new Error(`Edge function failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw new Error(`Failed to call ${functionName}: ${error.message}`);
  }
};

// Itinerary Generation
export interface LLMItineraryRequest {
  location: string;
  date: string;
  preferences: UserPreferences;
  surpriseMode: boolean;
}

export const generateItinerary = async (request: LLMItineraryRequest): Promise<DayPlan> => {
  try {
    console.log('Generating itinerary with request:', request);
    
    const result = await callEdgeFunction('generate-itinerary', request);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error(`Failed to generate itinerary: ${error.message}`);
  }
};

// Weather Forecast
export const getWeatherForecast = async (location: string, date: string): Promise<WeatherForecast | undefined> => {
  try {
    console.log('Getting weather forecast for:', location, date);
    
    const result = await callEdgeFunction('get-weather', { location, date });
    
    if (result.error) {
      console.warn('Weather forecast failed:', result.error);
      return undefined; // Weather is optional, don't fail the whole request
    }
    
    return result;
  } catch (error) {
    console.warn('Error fetching weather:', error);
    // Return undefined instead of throwing to allow the app to continue without weather
    return undefined;
  }
};

// Activity Suggestions
export const generateActivitySuggestions = async (
  location: string, 
  preferences: UserPreferences
): Promise<Activity[]> => {
  try {
    console.log('Generating activity suggestions for:', location);
    
    const result = await callEdgeFunction('generate-activity-suggestions', {
      location,
      preferences
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error generating activity suggestions:', error);
    throw new Error(`Failed to generate activity suggestions: ${error.message}`);
  }
};

// Google Places API
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
  try {
    console.log('Searching places:', query, 'near', location);
    
    const result = await callEdgeFunction('search-places', { query, location });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error searching places:', error);
    throw new Error(`Failed to search places: ${error.message}`);
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  try {
    console.log('Getting place details for:', placeId);
    
    const result = await callEdgeFunction('get-place-details', { placeId });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw new Error(`Failed to get place details: ${error.message}`);
  }
};

export const getPlacePhoto = async (photoReference: string, maxWidth: number = 400): Promise<string> => {
  try {
    console.log('Getting place photo:', photoReference);
    
    const result = await callEdgeFunction('get-place-photo', { photoReference, maxWidth });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.photoUrl;
  } catch (error) {
    console.error('Error getting place photo:', error);
    throw new Error(`Failed to get place photo: ${error.message}`);
  }
};