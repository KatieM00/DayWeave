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

// Helper function to calculate travel time and distance between two points
export const generateTravelSegment = (
  startLocation: string,
  endLocation: string,
  startTime: string,
  preferredModes: TransportMode[] = ['walking', 'driving']
): Travel => {
  // In a real app, this would use Google Maps API or similar
  // For now, we'll generate realistic-looking mock data
  
  // Generate a random distance between 0.1 and 15 miles
  const distance = Math.round((Math.random() * 14.9 + 0.1) * 10) / 10;
  
  // Choose transport mode based on distance and preferences
  let mode: TransportMode = 'walking';
  if (distance > 2 && preferredModes.includes('driving')) {
    mode = 'driving';
  } else if (distance > 1 && preferredModes.includes('cycling')) {
    mode = 'cycling';
  }
  
  // Calculate duration based on mode and distance
  let speedMph = mode === 'walking' ? 3 : mode === 'cycling' ? 12 : 25;
  const durationMinutes = Math.ceil((distance / speedMph) * 60);
  
  // Calculate end time
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date(2025, 0, 1, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Calculate cost (only for driving/taxi)
  const cost = mode === 'driving' ? Math.round(distance * 0.5 * 100) / 100 : 0;
  
  return {
    id: `travel-${startTime}-${endTime}`.replace(/:/g, ''),
    startLocation,
    endLocation,
    startTime,
    endTime,
    duration: durationMinutes,
    mode,
    cost,
    distance
  };
};

// Helper function to recalculate all travel segments in an itinerary
export const recalculateTravel = (
  activities: Activity[],
  preferences: UserPreferences
): Travel[] => {
  const travels: Travel[] = [];
  
  for (let i = 0; i < activities.length - 1; i++) {
    const currentActivity = activities[i];
    const nextActivity = activities[i + 1];
    
    const travel = generateTravelSegment(
      currentActivity.location,
      nextActivity.location,
      currentActivity.endTime,
      preferences.transportModes
    );
    
    // Adjust next activity start time if needed
    const [travelEndHours, travelEndMinutes] = travel.endTime.split(':').map(Number);
    const [nextStartHours, nextStartMinutes] = nextActivity.startTime.split(':').map(Number);
    const travelEndMinutesTotal = travelEndHours * 60 + travelEndMinutes;
    const nextStartMinutesTotal = nextStartHours * 60 + nextStartMinutes;
    
    if (travelEndMinutesTotal > nextStartMinutesTotal) {
      const newStartDate = new Date(2025, 0, 1, travelEndHours, travelEndMinutes);
      nextActivity.startTime = `${newStartDate.getHours().toString().padStart(2, '0')}:${newStartDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Adjust end time accordingly
      const activityDuration = nextActivity.duration;
      const endDate = new Date(newStartDate.getTime() + activityDuration * 60000);
      nextActivity.endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    travels.push(travel);
  }
  
  return travels;
};

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
export const mockTravels: Travel[] = recalculateTravel(mockActivities, {
  startLocation: 'Brighton City Centre',
  groupSize: 2,
  budgetRange: 'moderate',
  travelDistance: { value: 10, unit: 'miles' },
  transportModes: ['walking', 'driving']
});

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