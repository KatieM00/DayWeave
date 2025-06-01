// Mock data for testing and development
import type { 
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

// Sample activities with UK locations and pound sterling
export const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Morning Coffee at The Clocktower Café',
    description: 'Start your day with a speciality coffee and freshly baked pastries at this charming local café.',
    location: 'The Clocktower Café',
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    cost: 5.50,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/6205791/pexels-photo-6205791.jpeg',
    address: '123 High Street, Brighton, BN1 1AA',
    contactInfo: '01273 123 456',
    ratings: 4.7
  },
  {
    id: '2',
    name: 'South Downs Walking Trail',
    description: 'Explore the stunning chalk cliffs and rolling hills of the South Downs National Park.',
    location: 'Seven Sisters Country Park',
    startTime: '10:15',
    endTime: '12:15',
    duration: 120,
    cost: 0,
    activityType: ['outdoor', 'nature', 'active'],
    imageUrl: 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg',
    address: 'Seven Sisters Country Park, Exceat, Seaford, BN25 4AD',
    contactInfo: '01323 423 197',
    ratings: 4.9
  },
  {
    id: '3',
    name: 'Lunch at The Garden Kitchen',
    description: 'Enjoy a farm-to-table lunch experience featuring seasonal British ingredients.',
    location: 'The Garden Kitchen',
    startTime: '13:00',
    endTime: '14:30',
    duration: 90,
    cost: 25,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/5490901/pexels-photo-5490901.jpeg',
    address: '45 Market Street, Brighton, BN1 1HH',
    contactInfo: '01273 987 654',
    ratings: 4.5
  },
  {
    id: '4',
    name: 'Brighton Museum & Art Gallery',
    description: 'Discover Brighton\'s rich history and contemporary art exhibitions in this stunning Victorian building.',
    location: 'Brighton Museum',
    startTime: '15:00',
    endTime: '17:00',
    duration: 120,
    cost: 15,
    activityType: ['indoor', 'culture'],
    imageUrl: 'https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg',
    bookingLink: 'https://brightonmuseums.org.uk/brighton/tickets',
    address: 'Royal Pavilion Gardens, Brighton, BN1 1EE',
    contactInfo: '01273 290 900',
    ratings: 4.6
  },
  {
    id: '5',
    name: 'Brighton Beach Sunset Walk',
    description: 'Take a relaxing stroll along Brighton\'s famous pebble beach and historic pier.',
    location: 'Brighton Beach',
    startTime: '17:30',
    endTime: '18:30',
    duration: 60,
    cost: 0,
    activityType: ['outdoor', 'nature', 'relaxing'],
    imageUrl: 'https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg',
    address: 'Brighton Beach, Brighton, BN1 1NB',
    contactInfo: '',
    ratings: 4.8
  },
  {
    id: '6',
    name: 'Dinner at The Salt Room',
    description: 'End your day with fresh seafood and coastal views at this award-winning restaurant.',
    location: 'The Salt Room',
    startTime: '19:00',
    endTime: '21:00',
    duration: 120,
    cost: 45,
    activityType: ['food', 'indoor'],
    imageUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    bookingLink: 'https://www.saltroom-restaurant.co.uk/book',
    address: '106 Kings Road, Brighton, BN1 2FU',
    contactInfo: '01273 929 488',
    ratings: 4.7
  }
];

// Sample travel segments with UK locations
export const mockTravels: Travel[] = [
  {
    id: 't1',
    startLocation: 'The Clocktower Café',
    endLocation: 'Seven Sisters Country Park',
    startTime: '09:45',
    endTime: '10:15',
    duration: 30,
    mode: 'driving',
    cost: 2.50,
    distance: 5.2
  },
  {
    id: 't2',
    startLocation: 'Seven Sisters Country Park',
    endLocation: 'The Garden Kitchen',
    startTime: '12:15',
    endTime: '13:00',
    duration: 45,
    mode: 'driving',
    cost: 3.50,
    distance: 7.8
  },
  {
    id: 't3',
    startLocation: 'The Garden Kitchen',
    endLocation: 'Brighton Museum',
    startTime: '14:30',
    endTime: '15:00',
    duration: 30,
    mode: 'walking',
    cost: 0,
    distance: 0.5
  },
  {
    id: 't4',
    startLocation: 'Brighton Museum',
    endLocation: 'Brighton Beach',
    startTime: '17:00',
    endTime: '17:30',
    duration: 30,
    mode: 'walking',
    cost: 0,
    distance: 0.3
  },
  {
    id: 't5',
    startLocation: 'Brighton Beach',
    endLocation: 'The Salt Room',
    startTime: '18:30',
    endTime: '19:00',
    duration: 30,
    mode: 'walking',
    cost: 0,
    distance: 0.2
  }
];

// Sample day plan with UK location
export const mockDayPlan: DayPlan = {
  id: 'plan1',
  title: 'Brighton Coastal Adventure',
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
  totalCost: 96.50,
  totalDuration: 570,
  preferences: {
    startLocation: 'Brighton City Centre',
    groupSize: 2,
    budgetRange: 'moderate',
    travelDistance: { value: 10, unit: 'miles' },
    activityVibe: 'mixed',
  },
  weatherForecast: {
    condition: 'Partly Cloudy',
    temperature: 18,
    icon: 'partly-cloudy',
    precipitation: 10,
    windSpeed: 5,
  },
  revealProgress: 100,
};

// Mock user preferences with UK location
export const mockUserPreferences: UserPreferences = {
  startLocation: 'Brighton City Centre',
  groupSize: 2,
  budgetRange: 'moderate',
  travelDistance: { value: 10, unit: 'miles' },
  activityVibe: 'mixed',
  transportModes: ['walking', 'driving'],
  activityTypes: ['outdoor', 'food', 'culture', 'nature'],
  ageRestrictions: ['no-restrictions'],
};

// Mock weather forecast with Celsius
export const mockWeatherForecast: WeatherForecast = {
  condition: 'Partly Cloudy',
  temperature: 18,
  icon: 'partly-cloudy',
  precipitation: 10,
  windSpeed: 5,
};

// Function to generate a surprise day plan
export const generateSurpriseDayPlan = (preferences: UserPreferences): DayPlan => {
  return {
    ...mockDayPlan,
    title: `Surprise Adventure in ${preferences.startLocation}`,
    preferences,
    revealProgress: 0,
  };
};

// Function to generate a detailed day plan
export const generateDetailedDayPlan = (preferences: UserPreferences): DayPlan => {
  return {
    ...mockDayPlan,
    title: `Custom Day in ${preferences.startLocation}`,
    preferences,
    revealProgress: 100,
  };
};