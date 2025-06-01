import React, { useState } from 'react';
import { Clock, DollarSign, MapPin, Calendar, Share2, Users, Edit2, Save, X, Plus, ChevronDown, Download, Link } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { DayPlan, WeatherForecast, ItineraryEvent, Activity } from '../../types';
import ItineraryItem from './ItineraryItem';
import { mockActivities } from '../../utils/mockData';

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
  const [events, setEvents] = useState<ItineraryEvent[]>(dayPlan.events);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState(
    `${dayPlan.preferences.startLocation} - ${new Date(dayPlan.date).toLocaleDateString('en-GB', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })}`
  );
  const [shareOption, setShareOption] = useState<'link' | 'pdf'>('link');
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => {
      const id = event.type === 'activity' ? event.data.id : event.data.id;
      return id !== eventId;
    });
    
    setEvents(updatedEvents);
    updateTotals(updatedEvents);
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

    setEvents(items);
    recalculateTimesAndDistances(items);
  };

  const recalculateTimesAndDistances = (updatedEvents: ItineraryEvent[]) => {
    updateTotals(updatedEvents);
  };

  const handleAddSelectedActivities = () => {
    const newEvents = selectedActivities.map(activity => ({
      type: 'activity' as const,
      data: activity
    }));
    
    const updatedEvents = [...events, ...newEvents];
    setEvents(updatedEvents);
    updateTotals(updatedEvents);
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

  const ActivityOverlay = () => (
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
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid gap-4">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className={`
                  relative p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedActivities.includes(activity) 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-neutral-200 hover:border-primary-300'}
                `}
                onClick={() => {
                  setSelectedActivities(prev => 
                    prev.includes(activity)
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
                        {formatDuration(activity.duration)}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        £{activity.cost}
                      </span>
                    </div>
                  </div>
                  {activity.imageUrl && (
                    <img 
                      src={activity.imageUrl} 
                      alt={activity.name}
                      className="w-24 h-24 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>

                {selectedActivities.includes(activity) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
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
              <DollarSign className="h-5 w-5 mr-1 text-primary-500" />
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
              {events.map((event, index) => (
                <Draggable 
                  key={`${event.type}-${event.data.id}`}
                  draggableId={`${event.type}-${event.data.id}`}
                  index={index}
                  isDragDisabled={!isEditing}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative"
                    >
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteEvent(event.data.id)}
                          className="absolute -right-2 -top-2 w-6 h-6 bg-error-default text-white rounded-full flex items-center justify-center z-10 shadow-md hover:bg-error-dark transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ItineraryItem event={event} isRevealed={true} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
        <p>Please double-check all details including opening hours, prices, and availability before your planned day.</p>
      </div>
    </div>
  );
};

export default ItineraryView;