// Core application types

export type PlanningMode = 'surprise' | 'detailed';

export type TravelDistance = {
  value: number;
  unit: 'miles' | 'hours';
};

export type BudgetRange = 
  | 'budget-low'
  | 'budget-mid'
  | 'budget'
  | 'moderate'
  | 'premium'
  | 'luxury';

export type ActivityVibe = 'relaxing' | 'adventurous' | 'cultural' | 'active' | 'mixed';

export type TransportMode = 
  | 'walking' 
  | 'cycling' 
  | 'driving' 
  | 'bus' 
  | 'train' 
  | 'boat'
  | 'taxi';

export type ActivityType = 
  | 'indoor' 
  | 'outdoor' 
  | 'nature' 
  | 'culture' 
  | 'shopping' 
  | 'tourist' 
  | 'music'
  | 'food' 
  | 'movies' 
  | 'theatre';

export type AgeRestriction =
  | 'family-friendly'
  | 'adults-only'
  | 'seniors'
  | 'under-18'
  | 'no-restrictions';

export interface MealPreferences {
  includeCoffee: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
}

// User preferences for planning
export interface UserPreferences {
  // Step 1: Where?
  startLocation: string;
  endLocation?: string;
  transportModes?: TransportMode[];
  travelDistance: TravelDistance;

  // Step 2: When?
  planDate?: string;
  startTime?: string;
  endTime?: string;
  totalHours?: number;

  // Step 3: Who?
  groupSize: number;
  ageRestrictions?: AgeRestriction[];

  // Step 4: What?
  activityTypes?: ActivityType[];
  budgetRange: BudgetRange;
  mealPreferences?: MealPreferences;

  // Surprise mode specific
  activityVibe?: ActivityVibe;
  indoorBackup?: boolean;
}

// Activity/Event in an itinerary
export interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  cost: number;
  activityType: ActivityType[];
  imageUrl?: string;
  bookingLink?: string;
  address?: string;
  contactInfo?: string;
  ratings?: number;
}

// Travel segment between activities
export interface Travel {
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  mode: TransportMode;
  cost: number;
  distance: number; // in miles
}

// Combined itinerary event (either an activity or travel)
export type ItineraryEvent = 
  | { type: 'activity', data: Activity }
  | { type: 'travel', data: Travel };

// Complete day plan
export interface DayPlan {
  id: string;
  title: string;
  date: string;
  events: ItineraryEvent[];
  totalCost: number;
  totalDuration: number; // in minutes
  preferences: UserPreferences;
  weatherForecast?: WeatherForecast;
  revealProgress?: number; // For surprise mode, percentage of plan revealed
}

// Weather data
export interface WeatherForecast {
  condition: string;
  temperature: number;
  icon: string;
  precipitation: number;
  windSpeed: number;
}