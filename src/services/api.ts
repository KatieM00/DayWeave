import type { DayPlan, UserPreferences, Activity, WeatherForecast } from '../types';

// Supabase URL for edge functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_DATABASE_URL;

if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_DATABASE_URL environment variable is required');
}

// Helper function to make authenticated requests to edge functions
const callEdgeFunction = async (functionName: string, payload: any) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
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
    console.log('🚀 Calling Netlify function with:', request);
    
    const response = await fetch('/.netlify/functions/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const dayPlan = await response.json();
    console.log('✅ Success:', dayPlan);
    return dayPlan;
  } catch (error) {
    console.error('💥 Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};

// Weather Forecast
export const getWeatherForecast = async (location: string, date: string): Promise<WeatherForecast | undefined> => {
  try {
    const weatherForecast = await callEdgeFunction('get-weather', { location, date });
    return weatherForecast;
  } catch (error) {
    console.error('Error fetching weather:', error);
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
    const suggestions = await callEdgeFunction('generate-activity-suggestions', { location, preferences });
    return suggestions;
  } catch (error) {
    console.error('Error generating activity suggestions:', error);
    
    // Return fallback suggestions
    return [
      {
        id: 'fallback-1',
        name: 'Local Walk',
        description: 'Take a pleasant walk around the local area',
        location: 'Local area',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        cost: 0,
        activityType: ['outdoor'],
        address: '',
        ratings: 4.0,
        imageUrl: null
      }
    ];
  }
};

// Google Places API (through edge function)
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
    const places = await callEdgeFunction('search-places', { query, location });
    return places;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

export const getPlaceDetails = async (_placeId: string): Promise<PlaceDetails> => {
  // For now, we'll implement a basic version
  // In a full implementation, you'd create another edge function for place details
  throw new Error('Place details not implemented yet');
};

export const getPlacePhoto = async (_photoReference: string): Promise<string> => {
  // For now, we'll implement a basic version
  // In a full implementation, you'd create another edge function for place photos
  throw new Error('Place photos not implemented yet');
};