import { searchPlaces, getPlaceDetails, getPlacePhoto, PlaceDetails } from './googleMapsService';
import type { Activity, AIActivitySuggestion } from '../types';

const estimateCostFromPriceLevel = (priceLevel: number): number => {
  const baseCosts = {
    0: 10,  // £
    1: 20,  // ££
    2: 35,  // £££
    3: 60,  // ££££
    4: 100  // £££££
  };
  return baseCosts[priceLevel as keyof typeof baseCosts] || 25;
};

const createFallbackActivity = (suggestion: AIActivitySuggestion): Activity => ({
  id: suggestion.id,
  name: suggestion.searchQuery.split(' near ')[0],
  description: suggestion.description,
  location: suggestion.searchQuery.split(' near ')[1],
  startTime: '',
  endTime: '',
  duration: suggestion.suggestedDuration,
  cost: suggestion.estimatedCost,
  activityType: suggestion.activityType,
  address: '',
  ratings: 0,
  imageUrl: null
});

export const resolveActivityWithRealData = async (
  aiSuggestion: AIActivitySuggestion,
  userLocation: string
): Promise<Activity> => {
  try {
    // Search for places matching the AI suggestion
    const places = await searchPlaces(aiSuggestion.searchQuery, userLocation);
    
    if (places.length > 0) {
      // Get detailed information about the best match
      const details = await getPlaceDetails(places[0].place_id);
      
      // Try to get a photo if available
      let imageUrl = null;
      if (details.photos?.length > 0) {
        try {
          imageUrl = await getPlacePhoto(details.photos[0].photo_reference);
        } catch (error) {
          console.error('Failed to get place photo:', error);
        }
      }
      
      return {
        id: aiSuggestion.id,
        name: details.name,
        description: aiSuggestion.description,
        location: details.name,
        startTime: '',  // Will be set by the itinerary generator
        endTime: '',    // Will be set by the itinerary generator
        duration: aiSuggestion.suggestedDuration,
        cost: estimateCostFromPriceLevel(details.price_level),
        activityType: aiSuggestion.activityType,
        address: details.formatted_address,
        ratings: details.rating,
        imageUrl,
        contactInfo: details.formatted_phone_number,
        bookingLink: details.website
      };
    }
    
    // If no places found, return a fallback activity
    return createFallbackActivity(aiSuggestion);
  } catch (error) {
    console.error('Failed to resolve activity with real data:', error);
    return createFallbackActivity(aiSuggestion);
  }
};