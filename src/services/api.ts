import type { DayPlan, UserPreferences, Activity, WeatherForecast, ItineraryEvent, ActivityType } from '../types';

// Itinerary Generation
export interface LLMItineraryRequest {
  location: string;
  date: string;
  preferences: UserPreferences;
  surpriseMode: boolean;
}

// Raw data interfaces for the API response
interface RawActivity {
  name?: string;
  description?: string;
  why_special?: string;
  location?: string;
  duration_minutes?: number;
  cost_gbp?: number;
  category?: string;
  postcode?: string;
}

interface RawPlan {
  morning?: RawActivity[];
  afternoon?: RawActivity[];
  evening?: RawActivity[];
}

interface RawData {
  plan?: RawPlan;
  total_cost?: number;
  total_duration_hours?: number;
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

    const rawData = await response.json() as RawData;
    console.log('✅ Raw data from API:', rawData);

    // Convert the API response to DayPlan format
    const events: ItineraryEvent[] = [];
    
    // Convert activities from the plan structure
    if (rawData.plan) {
      const allActivities = [
        ...(rawData.plan.morning || []),
        ...(rawData.plan.afternoon || []),
        ...(rawData.plan.evening || [])
      ];

      console.log('📋 All activities:', allActivities);

      allActivities.forEach((activity, index) => {
        const startTime = calculateTime(index, activity.duration_minutes || 60);
        const endTime = calculateTime(index, activity.duration_minutes || 60, true);
        
        events.push({
          type: 'activity',
          data: {
            id: `activity-${index}`,
            name: activity.name || 'Unknown Activity',
            description: activity.description || activity.why_special || 'No description available',
            location: activity.location || 'Unknown Location',
            startTime: startTime,
            endTime: endTime,
            duration: activity.duration_minutes || 60,
            cost: activity.cost_gbp || 0,
            activityType: [(activity.category as ActivityType) || 'mixed'],
            address: activity.postcode ? `${activity.location}, ${activity.postcode}` : (activity.location || 'Unknown Location'),
            ratings: Math.round((Math.random() * 2 + 3.5) * 10) / 10,
            imageUrl: null
          }
        });
      });
    }

    const dayPlan: DayPlan = {
      id: crypto.randomUUID(),
      title: `AI-Generated Adventure in ${request.location}`,
      date: request.date,
      events: events,
      totalCost: rawData.total_cost || 0,
      totalDuration: (rawData.total_duration_hours || 0) * 60,
      preferences: request.preferences,
      revealProgress: request.surpriseMode ? 25 : 100,
    };

    console.log('✅ Converted dayPlan:', dayPlan);
    console.log('📅 Events array:', events);
    return dayPlan;
  } catch (error) {
    console.error('💥 Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};

// Helper function to calculate activity times
const calculateTime = (index: number, duration: number, isEndTime: boolean = false): string => {
  const startHour = 9; // 9 AM start
  const bufferTime = 30; // 30 minutes between activities
  
  let totalMinutes = startHour * 60;
  
  // Calculate start time based on previous activities
  for (let i = 0; i < index; i++) {
    totalMinutes += duration + bufferTime;
  }
  
  // If calculating end time, add the current activity duration
  if (isEndTime) {
    totalMinutes += duration;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Simple weather fallback
export const getWeatherForecast = async (location: string): Promise<WeatherForecast | undefined> => {
  console.log('Returning fallback weather for:', location);
  return {
    condition: 'Partly Cloudy',
    temperature: 18,
    precipitation: 20
  };
};

// Simple activity suggestions fallback
export const generateActivitySuggestions = async (
  location: string, 
  _preferences: UserPreferences
): Promise<Activity[]> => {
  console.log('Returning fallback activity suggestions for:', location);
  
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
};

// Simple places search fallback
export const searchPlaces = async (_query: string, _location: string): Promise<any[]> => {
  console.log('Places search not implemented, returning empty array');
  return [];
};