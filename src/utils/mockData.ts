// Mock data for testing and development
import { 
  Activity, 
  Travel, 
  DayPlan, 
  ActivityType, 
  TransportMode, 
  UserPreferences,
  BudgetRange,
  ActivityVibe,
  WeatherForecast
} from '../types';

// Sample activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Coffee at Coastal Brews',
    description: 'Start your day with a specialty coffee at this cozy local café with ocean views.',
    location: 'Coastal Brews Café',
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    cost: 5,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/6205791/pexels-photo-6205791.jpeg',
    address: '123 Oceanfront Drive',
    contactInfo: '(555) 123-4567',
    ratings: 4.7
  },
  {
    id: '2',
    name: 'Morning Hike at Forest Trails',
    description: 'Explore the scenic forest trails with stunning views of the coastline.',
    location: 'Evergreen National Park',
    startTime: '10:15',
    endTime: '12:15',
    duration: 120,
    cost: 0,
    activityType: ['outdoor', 'nature', 'active'],
    imageUrl: 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg',
    address: '789 Forest Road',
    contactInfo: '(555) 987-6543',
    ratings: 4.9
  },
  {
    id: '3',
    name: 'Lunch at Farm & Table',
    description: 'Enjoy a farm-to-table lunch experience with locally sourced ingredients.',
    location: 'Farm & Table Restaurant',
    startTime: '13:00',
    endTime: '14:30',
    duration: 90,
    cost: 25,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/5490901/pexels-photo-5490901.jpeg',
    address: '456 Main Street',
    contactInfo: '(555) 789-0123',
    ratings: 4.5
  },
  {
    id: '4',
    name: 'Visit City Art Museum',
    description: 'Explore the renowned art museum featuring both local and international exhibits.',
    location: 'City Art Museum',
    startTime: '15:00',
    endTime: '17:00',
    duration: 120,
    cost: 15,
    activityType: ['indoor', 'culture'],
    imageUrl: 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg',
    bookingLink: 'https://cityartmuseum.com/tickets',
    address: '789 Culture Avenue',
    contactInfo: '(555) 321-0987',
    ratings: 4.6
  },
  {
    id: '5',
    name: 'Sunset Beach Walk',
    description: 'Take a relaxing walk along the beach while enjoying a beautiful sunset.',
    location: 'Golden Sands Beach',
    startTime: '17:30',
    endTime: '18:30',
    duration: 60,
    cost: 0,
    activityType: ['outdoor', 'nature', 'relaxing'],
    imageUrl: 'https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg',
    address: 'Golden Sands Beach Access',
    contactInfo: '',
    ratings: 4.8
  },
  {
    id: '6',
    name: 'Dinner at Ocean View Grill',
    description: 'End your day with a delicious dinner at this popular seafood restaurant with ocean views.',
    location: 'Ocean View Grill',
    startTime: '19:00',
    endTime: '21:00',
    duration: 120,
    cost: 45,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    bookingLink: 'https://oceanviewgrill.com/reservations',
    address: '321 Harbor Drive',
    contactInfo: '(555) 654-3210',
    ratings: 4.7
  }
];

// Sample travel segments
export const mockTravels: Travel[] = [
  {
    id: 't1',
    startLocation: 'Coastal Brews Café',
    endLocation: 'Evergreen National Park',
    startTime: '09:45',
    endTime: '10:15',
    duration: 30,
    mode: 'driving',
    cost: 2,
    distance: 5.2
  },
  {
    id: 't2',
    startLocation: 'Evergreen National Park',
    endLocation: 'Farm & Table Restaurant',
    startTime: '12:15',
    endTime: '13:00',
    duration: 45,
    mode: 'driving',
    cost: 3,
    distance: 7.8
  },
  {
    id: 't3',
    startLocation: 'Farm & Table Restaurant',
    endLocation: 'City Art Museum',
    startTime: '14:30',
    endTime: '15:00',
    duration: 30,
    mode: 'driving',
    cost: 2,
    distance: 4.5
  },
  {
    id: 't4',
    startLocation: 'City Art Museum',
    endLocation: 'Golden Sands Beach',
    startTime: '17:00',
    endTime: '17:30',
    duration: 30,
    mode: 'driving',
    cost: 2.5,
    distance: 6.1
  },
  {
    id: 't5',
    startLocation: 'Golden Sands Beach',
    endLocation: 'Ocean View Grill',
    startTime: '18:30',
    endTime: '19:00',
    duration: 30,
    mode: 'driving',
    cost: 2,
    distance: 3.7
  }
];

// Sample day plan
export const mockDayPlan: DayPlan = {
  id: 'plan1',
  title: 'Coastal Adventure Day',
  date: '2025-06-15',
  events: [
    { type: 'activity', data: mockActivities[0] },
    { type: 'travel', data: mockTravels[0] },
    { type: 'activity', data: mockActivities[1] },
    { type: 'travel', data: mockTravels[1] },
    { type: 'activity', data: mockActivities[2] },
    { type: 'travel', data: mockTravels[2] },
    { type: 'activity', data: mockActivities[3] },
    { type: 'travel', data: mockTravels[3] },
    { type: 'activity', data: mockActivities[4] },
    { type: 'travel', data: mockTravels[4] },
    { type: 'activity', data: mockActivities[5] },
  ],
  totalCost: 99.5, // Sum of all activities and travel costs
  totalDuration: 570, // Total minutes of activities and travel
  preferences: {
    startLocation: 'Coastal City Center',
    groupSize: 2,
    budgetRange: 'moderate',
    travelDistance: { value: 10, unit: 'miles' },
    activityVibe: 'mixed',
  },
  weatherForecast: {
    condition: 'Partly Cloudy',
    temperature: 72,
    icon: 'partly-cloudy',
    precipitation: 10,
    windSpeed: 5,
  },
  revealProgress: 100, // Fully revealed
};

// Mock user preferences
export const mockUserPreferences: UserPreferences = {
  startLocation: 'Coastal City Center',
  groupSize: 2,
  budgetRange: 'moderate',
  travelDistance: { value: 10, unit: 'miles' },
  activityVibe: 'mixed',
  transportModes: ['driving', 'walking'],
  activityTypes: ['outdoor', 'food', 'culture', 'nature'],
  ageRestrictions: ['no-restrictions'],
};

// Mock weather forecast
export const mockWeatherForecast: WeatherForecast = {
  condition: 'Partly Cloudy',
  temperature: 72,
  icon: 'partly-cloudy',
  precipitation: 10,
  windSpeed: 5,
};

// Function to generate a surprise day plan
export const generateSurpriseDayPlan = (preferences: UserPreferences): DayPlan => {
  // In a real app, this would make API calls and use algorithms
  // For now, we'll return the mock data with slight modifications
  
  return {
    ...mockDayPlan,
    title: `Surprise Adventure in ${preferences.startLocation}`,
    preferences,
    revealProgress: 0, // Start with nothing revealed
  };
};

// Function to generate a detailed day plan
export const generateDetailedDayPlan = (preferences: UserPreferences): DayPlan => {
  // In a real app, this would make API calls and use algorithms
  // For now, we'll return the mock data with modifications based on preferences
  
  return {
    ...mockDayPlan,
    title: `Custom Day in ${preferences.startLocation}`,
    preferences,
    revealProgress: 100, // Fully revealed for detailed planning
  };
};