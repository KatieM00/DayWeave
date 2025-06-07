import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Download,
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
  Star
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { DayPlan, WeatherForecast, ItineraryEvent, Activity } from '../../types';
import ItineraryItem from './ItineraryItem';
import { generateTravelSegment } from '../../utils/mockData';
import { getActivitySuggestions } from '../../services/activitySuggestions';
import { searchPlaces, getPlaceDetails } from '../../services/api';

interface ItineraryViewProps {
  dayPlan: DayPlan;
  isSurpriseMode?: boolean;
  onRevealMore?: () => void;
  onSharePlan?: () => void;
  onExportPDF?: () => void;
  onSavePlan?: () => void;
  onUpdatePlan?: (updatedPlan: DayPlan) => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  dayPlan,
  isSurpriseMode = false,
  onRevealMore,
  onSharePlan,
  onExportPDF,
  onSavePlan,
  onUpdatePlan
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActivityChoices, setShowActivityChoices] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<ItineraryEvent[]>(() => {
    const lastEvent = dayPlan.events[dayPlan.events.length - 1];
    if (lastEvent.type === 'activity') {
      const finalDestination = dayPlan.preferences.endLocation || dayPlan.preferences.startLocation;
      const finalTravel = {
        ...generateTravelSegment(
          lastEvent.data.location,
          finalDestination,
          lastEvent.data.endTime,
          dayPlan.preferences.transportModes
        ),
        isEndOfDay: true
      };
      return [...dayPlan.events, { type: 'travel', data: finalTravel }];
    }
    return dayPlan.events;
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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

  useEffect(() => {
    if (showActivityChoices) {
      loadActivitySuggestions();
    }
  }, [showActivityChoices]);

  const loadActivitySuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError(null);
    try {
      const suggestions = await getActivitySuggestions({
        location: dayPlan.preferences.startLocation,
        categories: dayPlan.preferences.activityTypes || [],
        maxBudget: extractBudgetLimit(dayPlan.preferences.budgetRange),
        radius: dayPlan.preferences.travelDistance.value
      });

      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion) => {
          try {
            const places = await searchPlaces(
              `${suggestion.name} near ${dayPlan.preferences.startLocation}`,
              dayPlan.preferences.startLocation
            );

            if (places.length > 0) {
              const details = await getPlaceDetails(places[0].place_id);
              return {
                ...suggestion,
                location: details.name,
                address: details.formatted_address,
                ratings: details.rating,
                imageUrl: null
              };
            }
            return suggestion;
          } catch (error) {
            console.error('Error enriching suggestion:', error);
            return suggestion;
          }
        })
      );

      setActivitySuggestions(enrichedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setError('Failed to load activity suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
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
          return {
            id: place.place_id,
            name: details.name,
            description: `Visit ${details.name} - a highly rated destination in ${dayPlan.preferences.startLocation}`,
            location: details.name,
            startTime: '',
            endTime: '',
            duration: 120,
            cost: details.price_level ? details.price_level * 25 : 25,
            activityType: ['custom'],
            address: details.formatted_address,
            ratings: details.rating,
            imageUrl: null
          };
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
      .map(event => event.data as Activity);
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
        newEvents.push({ type: 'travel', data: travels[index] });
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
        newEvents.push({ type: 'travel', data: travels[index] });
      }
    });
    
    setEvents(newEvents);
    updateTotals(newEvents);
  };

  const handleAddSelectedActivities = () => {
    const currentActivities = extractActivities(events);
    
    const allActivities = [...currentActivities, ...selectedActivities];
    
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
        newEvents.push({ type: 'travel', data: travels[index] });
      }
    });
    
    setEvents(newEvents);
    updateTotals(newEvents);
    setSelectedActivities([]);
    setShowActivityChoices(false);
  };

  const WeatherCard = ({ forecast }: { forecast: WeatherForecast }) => (
    <Card className="bg-gradient-to-br from-secondary-100 to-secondary-50 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-secondary-800">Weather Forecast</h3>
          <p className="text-secondary-700">{forecast.condition}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-semibold text-secondary-800">{forecast.temperature}°</div>
          <div className="text-xs text-secondary-600">Feels like {forecast.temperature - 2}°</div>
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
                            £{activity.cost}
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

  const SaveDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-primary-800">Save Your Plan</h3>
          <button 
            onClick={() => setShowSaveDialog(false)}
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Share options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShareOption('link')}
                className={`
                  p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all
                  ${shareOption === 'link' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-neutral-200 hover:border-primary-300 text-neutral-700'}
                `}
              >
                <Link className="w-6 h-6" />
                <span className="text-sm font-medium">Share Link</span>
              </button>

              <button
                onClick={() => setShareOption('pdf')}
                className={`
                  p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all
                  ${shareOption === 'pdf' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-neutral-200 hover:border-primary-300 text-neutral-700'}
                `}
              >
                <Download className="w-6 h-6" />
                <span className="text-sm font-medium">Export PDF</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onSavePlan?.();
                if (shareOption === 'link') {
                  onSharePlan?.();
                } else {
                  onExportPDF?.();
                }
                setShowSaveDialog(false);
              }}
            >
              Confirm & Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const visibleEvents = getVisibleEvents();

  return (
    <div className="max-w-2xl w-full mx-auto">
      <Card className="mb-4">
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-primary-800">{dayPlan.title}</h2>
            {!isSurpriseMode && (
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
              <span>£{dayPlan.totalCost.toFixed(2)} total</span>
            </div>
            
            <div className="flex items-center text-neutral-600">
              <Users className="h-5 w-5 mr-1 text-primary-500" />
              <span>{dayPlan.preferences.groupSize} {dayPlan.preferences.groupSize > 1 ? 'people' : 'person'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isSurpriseMode && onSavePlan && (
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={() => setShowSaveDialog(true)}
            >
              Save Plan
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="h-4 w-4" />}
            onClick={onSharePlan}
          >
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
          >
            Export PDF
          </Button>
        </div>
      </Card>
      
      {dayPlan.weatherForecast && <WeatherCard forecast={dayPlan.weatherForecast} />}
      
      {isEditing && (
        <div className="text-center mb-6">
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setShowActivityChoices(true)}
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
                                  <span>{event.data.startTime} → {event.data.endTime}</span>
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
      {showSaveDialog && <SaveDialog />}
      
      <div className="mt-8 flex justify-center">
        <Button
          variant="success"
          size="lg"
          icon={<Save className="h-5 w-5" />}
          onClick={() => setShowSaveDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Save Day Plan
        </Button>
      </div>

      <div className="text-center text-sm text-neutral-500 mb-8 mt-6">
        <p>Information may not be accurate at time of plan generation.</p>
        <p>Please double-check all details including opening hours, prices, an availability before your planned day.</p>
      </div>
    </div>
  );
};

export default ItineraryView;