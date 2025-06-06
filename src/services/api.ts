import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader } from '@googlemaps/js-api-loader';
import type { DayPlan, UserPreferences, Activity, WeatherForecast } from '../types';

// API Keys
const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Initialize services
const genAI = GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(GOOGLE_AI_API_KEY) : null;

const loader = GOOGLE_MAPS_API_KEY ? new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places']
}) : null;

let placesService: google.maps.places.PlacesService | null = null;

// Google Maps Service Functions
const initPlacesService = async () => {
  if (!placesService && loader) {
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
    console.warn('Google Maps API key not configured');
    return [];
  }

  try {
    const service = await initPlacesService();
    if (!service) throw new Error('Places service not available');

    // First, geocode the location to get coordinates
    const geocoder = new google.maps.Geocoder();
    const { results } = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK') resolve({ results });
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
        query,
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
            photos: place.photos?.map(photo => ({ photo_reference: photo.photo_reference! })) || [],
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
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const service = await initPlacesService();
  if (!service) throw new Error('Places service not available');

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
          photos: place.photos?.map(photo => ({ photo_reference: photo.photo_reference! })) || [],
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

// Weather Service Functions
export const getWeatherForecast = async (location: string, date: string): Promise<WeatherForecast | undefined> => {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return undefined;
  }

  try {
    // First, get coordinates for the location using Google Geocoding
    let lat: number, lon: number;

    if (GOOGLE_MAPS_API_KEY && loader) {
      try {
        await loader.load();
        const geocoder = new google.maps.Geocoder();
        const { results } = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
          geocoder.geocode({ address: location }, (results, status) => {
            if (status === 'OK') resolve({ results });
            else reject(new Error(`Geocoding failed: ${status}`));
          });
        });

        if (results?.[0]?.geometry?.location) {
          lat = results[0].geometry.location.lat();
          lon = results[0].geometry.location.lng();
        } else {
          throw new Error('Location not found');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback to a default location (London)
        lat = 51.5074;
        lon = -0.1278;
      }
    } else {
      // Fallback to a default location (London)
      lat = 51.5074;
      lon = -0.1278;
    }

    // Get weather forecast from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find forecast for the specified date
    const targetDate = new Date(date);
    const forecast = data.list.find((item: any) => {
      const forecastDate = new Date(item.dt * 1000);
      return forecastDate.toDateString() === targetDate.toDateString();
    });

    if (forecast) {
      return {
        condition: forecast.weather[0].description,
        temperature: Math.round(forecast.main.temp),
        icon: forecast.weather[0].icon,
        precipitation: forecast.pop ? Math.round(forecast.pop * 100) : 0,
        windSpeed: Math.round(forecast.wind.speed * 3.6) // Convert m/s to km/h
      };
    } else {
      // Return current weather if no forecast for specific date
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const currentResponse = await fetch(currentWeatherUrl);
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        return {
          condition: currentData.weather[0].description,
          temperature: Math.round(currentData.main.temp),
          icon: currentData.weather[0].icon,
          precipitation: 0,
          windSpeed: Math.round(currentData.wind.speed * 3.6)
        };
      }
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }

  return undefined;
};

// Gemini AI Service Functions
export interface LLMItineraryRequest {
  location: string;
  date: string;
  preferences: UserPreferences;
  surpriseMode: boolean;
}

const buildPrompt = (request: LLMItineraryRequest): string => {
  const { location, date, preferences, surpriseMode } = request;
  
  return `You are an expert local travel guide creating a day itinerary for ${location} on ${date}.

User Preferences:
- Start Location: ${preferences.startLocation}
- Group Size: ${preferences.groupSize} people
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ') || 'Any'}
- Transport: ${preferences.transportModes?.join(', ') || 'Any'}
- Time: ${preferences.startTime || '09:00'} to ${preferences.endTime || '21:00'}
- Surprise Mode: ${surpriseMode}
${preferences.mealPreferences ? `
- Meal Preferences:
  * Morning Coffee: ${preferences.mealPreferences.includeCoffee}
  * Lunch: ${preferences.mealPreferences.includeLunch}
  * Dinner: ${preferences.mealPreferences.includeDinner}` : ''}

Generate a JSON response with this exact structure:
{
  "title": "Engaging day plan title",
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "unique_id",
        "name": "Activity name",
        "description": "Detailed description",
        "location": "Specific venue name",
        "startTime": "HH:MM",
        "endTime": "HH:MM", 
        "duration": minutes_as_number,
        "cost": cost_in_pounds,
        "activityType": ["outdoor", "culture"],
        "address": "Full address",
        "ratings": 4.5,
        "imageUrl": null
      }
    },
    {
      "type": "travel",
      "data": {
        "id": "travel_id",
        "startLocation": "Previous location",
        "endLocation": "Next location", 
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "duration": minutes_as_number,
        "mode": "walking",
        "cost": cost_in_pounds,
        "distance": distance_in_miles
      }
    }
  ],
  "totalCost": total_pounds,
  "totalDuration": total_minutes
}

REQUIREMENTS:
- Include 4-6 activities with travel between them
- Use real venue names and accurate addresses for ${location}
- Calculate realistic travel times and costs
- Include mix of activities based on user preferences
- For surprise mode: focus on hidden gems and unique experiences
- Ensure activities are open on ${date}
- Keep within specified budget range
- Include meal options if meal preferences selected
- Set imageUrl to null - do not generate image URLs
- Return ONLY valid JSON, no additional text`;
};

export const generateItinerary = async (request: LLMItineraryRequest): Promise<DayPlan> => {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = buildPrompt(request);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let itineraryData;
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      itineraryData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from AI');
    }
    
    return {
      id: crypto.randomUUID(),
      date: request.date,
      ...itineraryData,
      preferences: request.preferences,
      revealProgress: request.surpriseMode ? 20 : 100
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate itinerary');
  }
};

export const generateActivitySuggestions = async (
  location: string, 
  preferences: UserPreferences
): Promise<Activity[]> => {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Generate 5 activity suggestions for ${location} based on these preferences:
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ')}
- Group Size: ${preferences.groupSize}

Return ONLY a JSON array of activities with this structure:
[
  {
    "id": "unique_id",
    "name": "Activity name",
    "description": "Detailed description",
    "location": "Specific venue name",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "duration": minutes_as_number,
    "cost": cost_in_pounds,
    "activityType": ["type1", "type2"],
    "address": "Full address",
    "ratings": 4.5,
    "imageUrl": null
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate activity suggestions');
  }
};