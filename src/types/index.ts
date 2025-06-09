// Core types for the application
export type ActivityType = 
  | 'outdoor' 
  | 'indoor' 
  | 'nature' 
  | 'culture' 
  | 'shopping' 
  | 'tourist' 
  | 'music' 
  | 'food' 
  | 'movies' 
  | 'theatre'
  | 'active'
  | 'relaxing'
  | 'custom';

export type TransportMode = 
  | 'walking' 
  | 'cycling' 
  | 'driving' 
  | 'bus' 
  | 'train';

export type BudgetRange = 
  | 'budget-low'
  | 'budget-mid' 
  | 'budget' 
  | 'moderate' 
  | 'premium' 
  | 'luxury';

export type ActivityVibe = 
  | 'relaxing' 
  | 'adventurous' 
  | 'cultural' 
  | 'active'
  | 'mixed';

export type AgeRestriction = 
  | 'family-friendly' 
  | 'adults-only' 
  | 'seniors' 
  | 'under-18' 
  | 'no-restrictions';

export interface TravelDistance {
  value: number;
  unit: 'miles' | 'hours';
}

export interface MealPreferences {
  includeBreakfast?: boolean;
  includeCoffee?: boolean;
  includeLunch?: boolean;
  includeDinner?: boolean;
}

export interface UserPreferences {
  startLocation: string;
  endLocation?: string;
  groupSize: number;
  budgetRange: BudgetRange;
  travelDistance: TravelDistance;
  transportModes?: TransportMode[];
  activityTypes?: ActivityType[];
  activityVibe?: ActivityVibe[];
  ageRestrictions?: AgeRestriction[];
  planDate?: string;
  startTime?: string;
  endTime?: string;
  mealPreferences?: MealPreferences;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  duration: number;
  cost: number;
  activityType: ActivityType[];
  address?: string;
  ratings?: number;
  imageUrl?: string | null;
  contactInfo?: string;
  bookingLink?: string;
}

export interface Travel {
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  duration: number;
  mode: TransportMode;
  cost: number;
  distance: number;
  isEndOfDay?: boolean;
}

export interface WeatherForecast {
  condition: string;
  temperature: number;
  icon?: string;
  precipitation?: number;
  windSpeed?: number;
}

export interface ItineraryEvent {
  type: 'activity' | 'travel';
  data: Activity | Travel;
}

export interface DayPlan {
  id: string;
  title: string;
  date: string;
  events: ItineraryEvent[];
  totalCost: number;
  totalDuration: number;
  preferences: UserPreferences;
  weatherForecast?: WeatherForecast;
  revealProgress?: number;
}

// AI activity suggestions
export interface AIActivitySuggestion {
  id: string;
  category: string;
  searchQuery: string;
  description: string;
  suggestedDuration: number;
  estimatedCost: number;
  timeOfDay: string;
  activityType: ActivityType[];
}