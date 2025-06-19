import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Edit2,
  Link,
  Plus,
  Save,
  Share2,
  Trash2,
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  Home,
  Search,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import AuthModal from '../auth/AuthModal';
import { DayPlan, WeatherForecast, ItineraryEvent, Activity } from '../../types';
import ItineraryItem from './ItineraryItem';
import { getActivitySuggestions } from '../../services/activitySuggestions';
import { searchPlaces, getPlaceDetails, generateShareableLink } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { usePlans } from '../../hooks/usePlans';
import { useCurrency } from '../../contexts/CurrencyContext';
import { usePlanRestoration } from '../../hooks/usePlanRestoration';
import { WeatherIcon } from '../weather';

// Helper function to generate travel segments between activities
const generateTravelSegment = (
  startLocation: string,
  endLocation: string,
  startTime: string,
  preferredModes: string[] = ['walking', 'driving']
) => {
  // Validate input parameters
  if (!startLocation || !endLocation || !startTime) {
    console.error('Invalid parameters for generateTravelSegment:', { startLocation, endLocation, startTime });
    throw new Error('Invalid travel segment parameters');
  }

  // Validate and parse start time
  if (startTime === 'NaN:NaN' || !startTime.includes(':')) {
    console.error('Invalid start time for travel segment:', startTime);
    throw new Error('Invalid start time for travel segment');
  }

  const [hoursStr, minutesStr] = startTime.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Validate parsed time components
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error('Invalid time components:', { hours, minutes, startTime });
    throw new Error('Invalid time format');
  }
  
  // Generate a random distance between 0.1 and 15 miles
  const distance = Math.round((Math.random() * 14.9 + 0.1) * 10) / 10;
  
  // Choose transport mode based on distance and preferences
  let mode = 'walking';
  if (distance > 2 && preferredModes.includes('driving')) {
    mode = 'driving';
  } else if (distance > 1 && preferredModes.includes('cycling')) {
    mode = 'cycling';
  }
  
  // Calculate duration based on mode and distance
  let speedMph = mode === 'walking' ? 3 : mode === 'cycling' ? 12 : 25;
  const durationMinutes = Math.ceil((distance / speedMph) * 60);
  
  // Calculate end time using proper date arithmetic
  const startDate = new Date(2025, 0, 1, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  // Format times with proper zero padding
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Calculate cost (only for driving/taxi)
  const cost = mode === 'driving' ? Math.round(distance * 0.5 * 100) / 100 : 0;
  
  // Determine if booking is required for this transport mode
  const bookingRequired = mode === 'train' || (mode === 'bus' && distance > 10);
  const bookingLink = bookingRequired ? 
    (mode === 'train' ? 'https://www.trainline.com' : 'https://www.nationalexpress.com') : 
    undefined;
  
  const travelSegment = {
    id: `travel-${startTime.replace(':', '')}-${endTime.replace(':', '')}`,
    startLocation,
    endLocation,
    startTime,
    endTime,
    duration: durationMinutes,
    mode,
    cost,
    distance,
    bookingRequired,
    bookingLink,
    bookingAdvice: bookingRequired ? 'Book in advance for better prices' : undefined
  };

  // Validate the generated travel segment
  if (travelSegment.startTime === 'NaN:NaN' || travelSegment.endTime === 'NaN:NaN') {
    console.error('Generated invalid travel segment:', travelSegment);
    throw new Error('Generated travel segment has invalid times');
  }

  return travelSegment;
};

interface ItineraryViewProps {
  dayPlan: DayPlan;
  isSurpriseMode?: boolean;
  onRevealMore?: () => void;
  onSharePlan?: () => void;
  onSavePlan?: () => void;
  onUpdatePlan?: (updatedPlan: DayPlan) => void;
  disablePlanRestoration?: boolean;
}

// Enhanced time formatting helper function
const formatTimeString = (timeValue: any): string | null => {
  if (!timeValue) return null;
  
  // Handle different input types
  let timeStr: string;
  
  if (Array.isArray(timeValue)) {
    // If it's an array like [17, 35], join with ':'
    const cleanedArray = timeValue.map(val => {
      if (typeof val === 'string') {
        return val.replace(/[,\s]/g, '');
      }
      return val.toString();
    });
    timeStr = cleanedArray.join(':');
  } else {
    timeStr = timeValue.toString();
  }
  
  // Remove any commas and extra spaces
  timeStr = timeStr.replace(/[,\s]/g, '');
  
  // Handle HH:MM format
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':');
    const hourNum = parseInt(hours, 10);
    const minNum = parseInt(minutes, 10);
    
    if (!isNaN(hourNum) && !isNaN(minNum) && hourNum >= 0 && hourNum <= 23 && minNum >= 0 && minNum <= 59) {
      return `${hourNum.toString().padStart(2, '0')}:${minNum.toString().padStart(2, '0')}`;
    }
    return null;
  }
  
  // Handle numeric time (like 1735 for 17:35)
  const numericTime = parseInt(timeStr, 10);
  if (!isNaN(numericTime)) {
    const hours = Math.floor(numericTime / 100);
    const minutes = numericTime % 100;
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  return null;
};

// Function to safely format activity times
const sanitizeActivityTimes = (activity: Activity): Activity => {
  return {
    ...activity,
    startTime: formatTimeString(activity.startTime) || activity.startTime,
    endTime: formatTimeString(activity.endTime) || activity.endTime
  };
};

// Function to safely format travel times
const sanitizeTravelTimes = (travel: any): any => {
  return {
    ...travel,
    startTime: formatTimeString(travel.startTime) || travel.startTime,
    endTime: formatTimeString(travel.endTime) || travel.endTime
  };
};

// Move SaveDialog component OUTSIDE of ItineraryView to prevent re-creation on every render
const SaveDialog = ({ 
  planName, 
  setPlanName, 
  onSave, 
  onClose, 
  isSaving 
}: {
  planName: string;
  setPlanName: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-primary-800">Save Your Plan</h3>
        <button 
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Name your plan
          </label>
          <Input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter a name for your plan"
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            loading={isSaving}
            disabled={isSaving || !planName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Plan'}
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

const ItineraryView: React.FC<ItineraryViewProps> = ({
  dayPlan,
  isSurpriseMode = false,
  onRevealMore,
  onSharePlan,
  onSavePlan,
  onUpdatePlan,
  disablePlanRestoration = false
}) => {
  const { user } = useAuth();
  const { selectedCurrency } = useCurrency();
  const { savePlan, updatePlan, loading: plansLoading } = usePlans();
  const [isEditing, setIsEditing] = useState(false);
  const [showActivityChoices, setShowActivityChoices] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  
  // Initialize events with proper final travel segment and sanitized times
  const [events, setEvents] = useState<ItineraryEvent[]>(() => {
    // First, sanitize all existing events
    const sanitizedBaseEvents = dayPlan.events.map(event => {
      if (event.type === 'activity') {
        return {
          ...event,
          data: sanitizeActivityTimes(event.data as Activity)
        };
      } else {
        return {
          ...event,
          data: sanitizeTravelTimes(event.data)
        };
      }
    });

    const lastEvent = sanitizedBaseEvents[sanitizedBaseEvents.length - 1];
    
    // Only add final travel segment if the last event is an activity
    if (lastEvent && lastEvent.type === 'activity') {
      const finalDestination = dayPlan.preferences.endLocation || dayPlan.preferences.startLocation;
      const lastActivity = lastEvent.data as Activity;
      
      // Ensure we have valid end time before creating travel segment
      if (lastActivity.endTime && lastActivity.endTime !== 'NaN:NaN') {
        try {
          // Use the sanitized end time
          const cleanEndTime = formatTimeString(lastActivity.endTime);
          
          // Only proceed if we have valid time
          if (cleanEndTime) {
            const finalTravel = {
              ...generateTravelSegment(
                lastActivity.location,
                finalDestination,
                cleanEndTime,
                dayPlan.preferences.transportModes
              ),
              isEndOfDay: true
            };
            
            // Sanitize the generated travel times
            const sanitizedFinalTravel = sanitizeTravelTimes(finalTravel);
            
            // Validate that the generated travel segment has valid times
            if (sanitizedFinalTravel.startTime && sanitizedFinalTravel.endTime && 
                sanitizedFinalTravel.startTime !== 'NaN:NaN' && sanitizedFinalTravel.endTime !== 'NaN:NaN') {
              return [...sanitizedBaseEvents, { type: 'travel', data: sanitizedFinalTravel }];
            }
          }
        } catch (error) {
          console.error('Error generating final travel segment:', error);
        }
      }
    }
    
    return sanitizedBaseEvents;
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [planName, setPlanName] = useState(
    `${dayPlan.preferences.startLocation} - ${new Date(dayPlan.date).toLocaleDateString('en-GB', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })}`
  );
  const [shareOption, setShareOption] = useState<'link' | 'pdf'>('link');
  const [revealProgress, setRevealProgress] = useState(dayPlan.revealProgress || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activitySuggestions, setActivitySuggestions] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authAction, setAuthAction] = useState<'save' | 'share' | 'modify' | null>(null);

  // Initialize plan restoration
  const isEditMode = dayPlan.id && dayPlan.id !== ''; // Check if this is an existing plan

// Only use plan restoration for NEW plans, not existing ones
const planRestoration = !isEditMode ? usePlanRestoration({
  onPlanRestore: (storedData) => {
    console.log('Plan restoration callback triggered');
  }
}) : null;

const storePlanData = planRestoration?.storePlanData || (() => {});
const clearStoredPlanData = planRestoration?.clearStoredPlanData || (() => {});

  // Handle post-authentication actions
  useEffect(() => {
    if (user && authAction) {
      // User just authenticated, perform the pending action
      if (authAction === 'save') {
        handleSavePlanAfterAuth();
      } else if (authAction === 'share') {
        handleSharePlanAfterAuth();
      } else if (authAction === 'modify') {
        // User authenticated to modify plan, enable editing and show activity choices
        setIsEditing(true);
        setShowActivityChoices(true);
      }
      setAuthAction(null);
    }
  }, [user, authAction]);

  useEffect(() => {
    if (showActivityChoices && user) {
      loadActivitySuggestions();
    }
  }, [showActivityChoices, user]);

const loadActivitySuggestions = async () => {

    if (isLoadingSuggestions) {
    console.log('Already loading suggestions, skipping...');
    return;
  }
  setIsLoadingSuggestions(true);
  setError(null);
  try {
    console.log('🚀 Loading activity suggestions using Google Places API...');
    
    const location = dayPlan.preferences.startLocation;
    const categories = dayPlan.preferences.activityTypes || [];
    
    // Create search queries based on user preferences and popular activities
    const searchQueries = [
      // User preference-based searches
      ...categories.map(category => {
        const categoryMap: Record<string, string> = {
          'outdoor': 'parks outdoor activities',
          'culture': 'museums galleries cultural sites',
          'food': 'restaurants cafes food',
          'shopping': 'shopping centers markets',
          'nightlife': 'bars pubs nightlife',
          'nature': 'gardens parks nature',
          'history': 'historical sites heritage',
          'art': 'art galleries exhibitions',
          'music': 'music venues concerts',
          'sports': 'sports activities fitness',
          'entertainment': 'entertainment attractions',
          'family': 'family activities kids'
        };
        return categoryMap[category] || category;
      }),
      // Popular general activities
      'popular attractions',
      'recommended restaurants',
      'things to do',
      'local experiences',
      'tourist attractions'
    ].slice(0, 5); // Limit to 5 searches to avoid rate limits

    console.log('🔍 Searching for:', searchQueries);

    const allPlaces: PlaceDetails[] = [];
    
    // Search for each category
    for (const query of searchQueries) {
      try {
        console.log(`🔍 Searching: "${query}" near ${location}`);
        const places = await searchPlaces(`${query} near ${location}`, location);
        allPlaces.push(...places.slice(0, 3)); // Take top 3 from each search
      } catch (error) {
        console.warn(`Search failed for "${query}":`, error);
      }
    }

    console.log(`📍 Found ${allPlaces.length} total places`);

    // Remove duplicates and convert to Activity format
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );

    const suggestions = await Promise.all(
      uniquePlaces.slice(0, 15).map(async (place) => { // Limit to 15 suggestions
        try {
          const details = await getPlaceDetails(place.place_id);
          
          // Determine activity type based on place details
          const activityType = determineActivityType(details.name, details.formatted_address);
          
          // Calculate estimated cost based on price level
          const estimatedCost = details.price_level ? details.price_level * 25 : 15;
          const validSuggestions = suggestions.filter((suggestion): suggestion is Activity => suggestion !== null);
          
          return sanitizeActivityTimes({
            id: place.place_id,
            name: details.name,
            description: `Visit ${details.name} - ${getActivityDescription(details)}`,
            location: details.name,
            startTime: '10:00',
            endTime: '12:00',
            duration: 120,
            cost: estimatedCost,
            activityType: [activityType],
            address: details.formatted_address,
            ratings: details.rating,
            imageUrl: null
          });
        } catch (error) {
          console.error('Error processing place:', error);
          return null;
        }
      })
    );

    // Filter out null results and sort by rating
    const validSuggestions = suggestions
  .filter((suggestion): suggestion is Activity => suggestion !== null) // BETTER NULL FILTERING
  .sort((a, b) => (b.ratings || 0) - (a.ratings || 0));

setActivitySuggestions(validSuggestions);
    
  } catch (error) {
    console.error('❌ Error loading suggestions:', error);
    setError('Failed to load activity suggestions. Please try again.');
  } finally {
    setIsLoadingSuggestions(false);
  }
};

// Helper function to determine activity type from place details
const determineActivityType = (name: string, address: string): string => {
  const nameAndAddress = `${name} ${address}`.toLowerCase();
  
  if (nameAndAddress.includes('museum') || nameAndAddress.includes('gallery') || nameAndAddress.includes('exhibition')) {
    return 'culture';
  }
  if (nameAndAddress.includes('park') || nameAndAddress.includes('garden') || nameAndAddress.includes('green')) {
    return 'outdoor';
  }
  if (nameAndAddress.includes('restaurant') || nameAndAddress.includes('cafe') || nameAndAddress.includes('food') || nameAndAddress.includes('dining')) {
    return 'food';
  }
  if (nameAndAddress.includes('shop') || nameAndAddress.includes('market') || nameAndAddress.includes('mall')) {
    return 'shopping';
  }
  if (nameAndAddress.includes('bar') || nameAndAddress.includes('pub') || nameAndAddress.includes('club')) {
    return 'nightlife';
  }
  if (nameAndAddress.includes('church') || nameAndAddress.includes('cathedral') || nameAndAddress.includes('abbey') || nameAndAddress.includes('heritage')) {
    return 'history';
  }
  if (nameAndAddress.includes('theater') || nameAndAddress.includes('theatre') || nameAndAddress.includes('cinema') || nameAndAddress.includes('entertainment')) {
    return 'entertainment';
  }
  
  return 'culture'; // Default fallback
};

// Helper function to create activity descriptions
const getActivityDescription = (details: PlaceDetails): string => {
  const rating = details.rating ? `rated ${details.rating.toFixed(1)}` : 'highly recommended';
  const reviewCount = details.user_ratings_total ? ` with ${details.user_ratings_total} reviews` : '';
  
  return `a ${rating} destination${reviewCount} in ${details.formatted_address.split(',')[1]?.trim() || 'the area'}`;
};

  const extractBudgetLimit = (budgetRange: string): number => {
    const ranges: Record<string, number> = {
      'budget-low': 20,
      'budget-mid': 35,
      'budget': 50,
      'moderate': 100,
      'premium': 200,
      'luxury': 500
    };
    return ranges[budgetRange] || 100;
  };

  const handleSearchSuggestions = async () => {
    if (!searchQuery.trim()) return;

    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const places = await searchPlaces(
        `${searchQuery} near ${dayPlan.preferences.startLocation}`,
        dayPlan.preferences.startLocation
      );

      const suggestions = await Promise.all(
        places.slice(0, 5).map(async (place) => {
          const details = await getPlaceDetails(place.place_id);
          return sanitizeActivityTimes({
            id: place.place_id,
            name: details.name,
            description: `Visit ${details.name} - a highly rated destination in ${dayPlan.preferences.startLocation}`,
            location: details.name,
            startTime: '10:00',
            endTime: '12:00',
            duration: 120,
            cost: details.price_level ? details.price_level * 25 : 25,
            activityType: ['custom'],
            address: details.formatted_address,
            ratings: details.rating,
            imageUrl: null
          });
        })
      );

      setActivitySuggestions(prev => [...suggestions, ...prev]);
    } catch (error) {
      console.error('Error searching places:', error);
      setError('Failed to search for places. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getVisibleEvents = () => {
    if (!isSurpriseMode || !dayPlan.revealProgress) {
      return events;
    }
    
    const eventsToShow = Math.ceil((events.length * dayPlan.revealProgress) / 100);
    return events.slice(0, eventsToShow);
  };

  const hiddenEvents = events.slice(getVisibleEvents().length);

  const handleRevealAll = () => {
    if (onRevealMore) {
      setRevealProgress(100);
      if (onUpdatePlan) {
        onUpdatePlan({
          ...dayPlan,
          revealProgress: 100
        });
      }
    }
  };

  const extractActivities = (events: ItineraryEvent[]): Activity[] => {
    return events
      .filter(event => event.type === 'activity')
      .map(event => sanitizeActivityTimes(event.data as Activity));
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => {
      const id = event.type === 'activity' ? event.data.id : event.data.id;
      return id !== eventId;
    });
    
    const activities = extractActivities(updatedEvents);
    const travels = recalculateTravel(activities, dayPlan.preferences);
    
    const newEvents: ItineraryEvent[] = [];
    activities.forEach((activity, index) => {
      newEvents.push({ type: 'activity', data: activity });
      if (index < activities.length - 1) {
        newEvents.push({ type: 'travel', data: sanitizeTravelTimes(travels[index]) });
      }
    });
    
    setEvents(newEvents);
    updateTotals(newEvents);
  };

  const updateTotals = (updatedEvents: ItineraryEvent[]) => {
    const totalCost = updatedEvents.reduce((sum, event) => sum + event.data.cost, 0);
    const totalDuration = updatedEvents.reduce((sum, event) => sum + event.data.duration, 0);

    if (onUpdatePlan) {
      onUpdatePlan({
        ...dayPlan,
        events: updatedEvents,
        totalCost,
        totalDuration
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(events);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const activities = extractActivities(items);
    const travels = recalculateTravel(activities, dayPlan.preferences);
    
    const newEvents: ItineraryEvent[] = [];
    activities.forEach((activity, index) => {
      newEvents.push({ type: 'activity', data: activity });
      if (index < activities.length - 1) {
        newEvents.push({ type: 'travel', data: sanitizeTravelTimes(travels[index]) });
      }
    });
    
    setEvents(newEvents);
    updateTotals(newEvents);
  };

  const handleAddSelectedActivities = () => {
    const currentActivities = extractActivities(events);
    
    // Sanitize selected activities
    const sanitizedSelectedActivities = selectedActivities.map(sanitizeActivityTimes);
    
    const allActivities = [...currentActivities, ...sanitizedSelectedActivities];
    
    allActivities.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    const travels = recalculateTravel(allActivities, dayPlan.preferences);
    
    const newEvents: ItineraryEvent[] = [];
    allActivities.forEach((activity, index) => {
      newEvents.push({ type: 'activity', data: activity });
      if (index < allActivities.length - 1) {
        newEvents.push({ type: 'travel', data: sanitizeTravelTimes(travels[index]) });
      }
    });
    
    setEvents(newEvents);
    updateTotals(newEvents);
    setSelectedActivities([]);
    setShowActivityChoices(false);
  };

  const handleAddNewActivity = () => {
    if (!user) {
      setAuthAction('modify');
      setShowAuthModal(true);
      return;
    }

    setShowActivityChoices(true);
  };

  const handleSavePlan = async () => {
    if (!user) {
      setAuthAction('save');
      setShowAuthModal(true);
      return;
    }

    await handleSavePlanAfterAuth();
  };

  const handleSavePlanAfterAuth = async (): Promise<string | null> => {
    setIsSaving(true);
    try {
      const planToSave = {
        ...dayPlan,
        title: planName,
        events
      };

      let savedPlanId: string;

      if (dayPlan.id) {
        // Update existing plan
        await updatePlan(dayPlan.id, planToSave);
        savedPlanId = dayPlan.id;
      } else {
        // Save new plan
        const savedPlan = await savePlan(planToSave);
        savedPlanId = savedPlan?.id || '';
        
        // Update the dayPlan with the new ID so sharing works
        if (onUpdatePlan && savedPlan) {
          onUpdatePlan({
            ...planToSave,
            id: savedPlan.id
          });
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setShowSaveDialog(false);
      
      // Clear stored plan data after successful save
      clearStoredPlanData();
      
      // Call the original onSavePlan if provided
      onSavePlan?.();

      return savedPlanId;
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSharePlan = async () => {
    if (!user) {
      setAuthAction('share');
      setShowAuthModal(true);
      return;
    }

    await handleSharePlanAfterAuth();
  };

  const handleSharePlanAfterAuth = async () => {
    let planIdToShare = dayPlan.id;

    if (!planIdToShare) {
      // If plan isn't saved yet, save it first
      planIdToShare = await handleSavePlanAfterAuth();
      if (!planIdToShare) {
        alert('Failed to save plan. Please try again before sharing.');
        return;
      }
    }

    await handleGenerateShareableLink(planIdToShare);
  };

  const handleGenerateShareableLink = async (planId: string) => {
    if (!planId) {
      alert('Please save your plan first before sharing.');
      return;
    }

    setIsGeneratingLink(true);
    try {
      const result = await generateShareableLink(planId);
      setShareableUrl(result.shareableUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Error generating shareable link:', error);
      alert('Failed to generate shareable link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  const recalculateTravel = (activities: Activity[], preferences: any) => {
    const travels: any[] = [];
    
    for (let i = 0; i < activities.length - 1; i++) {
      const currentActivity = activities[i];
      const nextActivity = activities[i + 1];
      
      const travel = generateTravelSegment(
        currentActivity.location,
        nextActivity.location,
        currentActivity.endTime,
        preferences.transportModes
      );
      
      travels.push(travel);
    }
    
    return travels;
  };

  const WeatherCard = ({ forecast }: { forecast: WeatherForecast }) => (
    <Card className="bg-gradient-to-br from-secondary-100 to-secondary-50 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <WeatherIcon 
              condition={forecast.icon || forecast.condition} 
              size={64}
              className="drop-shadow-sm"
            />
          </div>
          <div>
            <h3 className="font-medium text-secondary-800 text-lg">Weather Forecast</h3>
            <p className="text-secondary-700 capitalize">{forecast.condition}</p>
            {forecast.precipitation !== undefined && forecast.precipitation > 0 && (
              <p className="text-sm text-secondary-600">
                {forecast.precipitation}% chance of rain
              </p>
            )}
            {forecast.windSpeed && (
              <p className="text-sm text-secondary-600">
                Wind: {forecast.windSpeed} km/h
              </p>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-secondary-800">{forecast.temperature}°C</div>
          <div className="text-xs text-secondary-600">Feels like {forecast.temperature - 2}°C</div>
        </div>
      </div>
    </Card>
  );

  const ActivityOverlay = () => {
    const [sortOrder, setSortOrder] = useState<'rating' | 'cost' | 'name'>('rating');
    const [filteredSuggestions, setFilteredSuggestions] = useState<Activity[]>([]);

    useEffect(() => {
      if (activitySuggestions.length > 0) {
        let sorted = [...activitySuggestions];
        
        switch (sortOrder) {
          case 'rating':
            sorted.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
            break;
          case 'cost':
            sorted.sort((a, b) => a.cost - b.cost);
            break;
          case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        }

        setFilteredSuggestions(sorted);
      }
    }, [activitySuggestions, sortOrder]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary-800">Add New Activities</h3>
              <button 
                onClick={() => setShowActivityChoices(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for places..."
                icon={<Search className="w-5 h-5" />}
                fullWidth
              />
              <Button
                variant="primary"
                onClick={handleSearchSuggestions}
                disabled={isLoadingSuggestions || !searchQuery.trim()}
              >
                Search
              </Button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'rating' | 'cost' | 'name')}
                className="border-2 border-neutral-300 rounded-md px-3 focus:border-primary-500 focus:outline-none"
              >
                <option value="rating">Rating (High to Low)</option>
                <option value="cost">Cost (Low to High)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            {error && (
              <div className="bg-error-light text-error-dark p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSuggestions.map((activity) => (
                  <div
                    key={activity.id}
                    className={`
                      relative p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${selectedActivities.some(a => a.id === activity.id)
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-300'}
                    `}
                    onClick={() => {
                      setSelectedActivities(prev => 
                        prev.some(a => a.id === activity.id)
                          ? prev.filter(a => a.id !== activity.id)
                          : [...prev, activity]
                      );
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h4 className="font-medium text-primary-800">{activity.name}</h4>
                        <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.duration} min
                          </span>
                          <span className="flex items-center">
                            {selectedCurrency}{activity.cost}
                          </span>
                          {activity.ratings && (
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-accent-500" />
                              {activity.ratings}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedActivities.some(a => a.id === activity.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200 bg-neutral-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-neutral-600">
                {selectedActivities.length} activities selected
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowActivityChoices(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddSelectedActivities}
                  disabled={selectedActivities.length === 0}
                >
                  Add to Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ShareDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-primary-800">Share Your Plan</h3>
          <button 
            onClick={() => setShowShareDialog(false)}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={shareableUrl}
                readOnly
                fullWidth
                className="bg-neutral-50"
              />
              <Button
                variant={linkCopied ? "primary" : "outline"}
                onClick={handleCopyLink}
                icon={linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-neutral-600 mt-2">
              Anyone with this link can view your plan (but not edit it).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: dayPlan.title,
                    text: `Check out this day plan: ${dayPlan.title}`,
                    url: shareableUrl,
                  });
                } else {
                  handleCopyLink();
                }
              }}
            >
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const getAuthPromptContent = () => {
    switch (authAction) {
      case 'save':
        return {
          title: "Save Your Plan",
          message: "Sign in to save your day plan and access it anytime. You'll also be able to share your plans with friends!"
        };
      case 'share':
        return {
          title: "Share Your Plan",
          message: "Sign in to share your day plan with friends and family. Your plan will be saved automatically when you create a shareable link."
        };
      case 'modify':
        return {
          title: "Modify Your Plan",
          message: "Sign in to add new activities and customize your day plan. You'll return to your completed plan after signing in, and all your current progress will be preserved."
        };
      default:
        return {
          title: "Sign In Required",
          message: "Please sign in to continue."
        };
    }
  };

  const visibleEvents = getVisibleEvents();

  return (
    <div className="max-w-2xl w-full mx-auto">
      {/* Success notification */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Plan saved successfully!
          </div>
        </div>
      )}

      <Card className="mb-4">
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-primary-800">{dayPlan.title}</h2>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-neutral-600">
              <Calendar className="h-5 w-5 mr-1 text-primary-500" />
              <span>{new Date(dayPlan.date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <MapPin className="h-5 w-5 mr-1 text-primary-500" />
              <span>{dayPlan.preferences.startLocation}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-neutral-600">
              <Clock className="h-5 w-5 mr-1 text-primary-500" />
              <span>{formatDuration(dayPlan.totalDuration)}</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <span>{selectedCurrency}{dayPlan.totalCost.toFixed(2)} total</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <Users className="h-5 w-5 mr-1 text-primary-500" />
              <span>{dayPlan.preferences.groupSize} {dayPlan.preferences.groupSize > 1 ? 'people' : 'person'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="h-4 w-4" />}
            onClick={() => setShowSaveDialog(true)}
            loading={isSaving}
          >
            Save Plan
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="h-4 w-4" />}
            onClick={handleSharePlan}
            loading={isGeneratingLink}
            disabled={isGeneratingLink}
          >
            Share
          </Button>

          {!isSurpriseMode && onUpdatePlan && (
            <Button
              variant="outline"
              size="sm"
              icon={isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Save Changes' : 'Modify Plan'}
            </Button>
          )}
        </div>
      </Card>
      
      {dayPlan.weatherForecast && <WeatherCard forecast={dayPlan.weatherForecast} />}
      
      {isEditing && (
        <div className="text-center mb-6">
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
            onClick={handleAddNewActivity}
          >
            Add New Activity
          </Button>
        </div>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="itinerary">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3 mb-6"
            >
              {visibleEvents.map((event, index) => {
                const isLastTravel = index === visibleEvents.length - 1 && event.type === 'travel';
                
                return (
                  <Draggable 
                    key={`${event.type}-${event.data.id}`}
                    draggableId={`${event.type}-${event.data.id}`}
                    index={index}
                    isDragDisabled={!isEditing || isLastTravel}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative"
                      >
                        {isEditing && !isLastTravel && (
                          <button
                            onClick={() => handleDeleteEvent(event.data.id)}
                            className="absolute -right-2 -top-2 w-6 h-6 bg-error-default text-white rounded-full flex items-center justify-center z-10 shadow-md hover:bg-error-dark transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {isLastTravel ? (
                          <Card className="border-l-4 border-accent-400 bg-accent-50">
                            <div className="flex items-center py-2 px-3">
                              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                                <Home className="w-6 h-6 text-accent-600" />
                              </div>
                              
                              <div className="ml-3 flex-grow">
                                <div className="text-accent-800 font-medium">
                                  Time to head {event.data.endLocation === dayPlan.preferences.startLocation ? 'back home' : 'to your destination'}!
                                </div>
                                <div className="flex items-center text-sm text-neutral-600">
                                  <span>{formatTimeString(event.data.startTime) || event.data.startTime} → {formatTimeString(event.data.endTime) || event.data.endTime}</span>
                                  <span className="mx-2">•</span>
                                  <span>{Math.floor(event.data.duration)} min</span>
                                  <span className="mx-2">•</span>
                                  <span>{event.data.distance} miles</span>
                                </div>
                              </div>
                              
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(event.data.startLocation)}&destination=${encodeURIComponent(event.data.endLocation)}&travelmode=${event.data.mode}`;
                                  window.open(url, '_blank');
                                }}
                                className="ml-2 text-accent-600 hover:text-accent-700 flex items-center"
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">Directions</span>
                              </a>
                            </div>
                          </Card>
                        ) : (
                          <ItineraryItem 
                            event={event} 
                            isRevealed={!isSurpriseMode || event.type === 'travel'} 
                            isSurpriseMode={isSurpriseMode}
                            isPreviouslyRevealed={index < visibleEvents.length - 1}
                            planStartLocation={dayPlan.preferences.startLocation}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {hiddenEvents.length > 0 && isSurpriseMode && (
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-600 mx-auto flex items-center justify-center">
              <ChevronDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mt-2">
              {hiddenEvents.length} more {hiddenEvents.length === 1 ? 'activity' : 'activities'} to discover!
            </h3>
            <p className="text-neutral-600 mt-1">
              Ready to see what's next on your surprise itinerary?
            </p>
          </div>
          
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={onRevealMore}
            >
              Reveal Next Activity
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRevealAll}
            >
              Reveal All
            </Button>
          </div>
        </div>
      )}

      {showActivityChoices && <ActivityOverlay />}
      {showSaveDialog && (
        <SaveDialog
          planName={planName}
          setPlanName={setPlanName}
          onSave={handleSavePlan}
          onClose={() => setShowSaveDialog(false)}
          isSaving={isSaving}
        />
      )}
      {showShareDialog && <ShareDialog />}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthAction(null);
        }}
        onSuccess={() => {
          console.log('Auth modal success callback triggered');
        }}
        title={getAuthPromptContent().title}
        message={getAuthPromptContent().message}
      />

      <div className="text-center text-sm text-neutral-500 mb-8 mt-6">
        <p>Information may not be accurate at time of plan generation.</p>
        <p>Please double-check all details including opening hours, prices, and availability before your planned day.</p>
      </div>
    </div>
  );
};

export default ItineraryView;