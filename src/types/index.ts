// Add new types for AI activity suggestions
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

// Update existing types
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