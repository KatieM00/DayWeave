// Custom React hook for enhancing travel data with real Google Maps directions
import { useState, useEffect, useCallback } from 'react';
import { travelGenerator, type TravelSegmentOptions } from '../services/travelSegmentGenerator';
import type { ItineraryEvent } from '../types';

interface UseEnhancedTravelOptions extends TravelSegmentOptions {
  autoEnhance?: boolean; // Whether to automatically enhance travel segments
  enhanceOnExpand?: boolean; // Whether to enhance when travel segment is expanded
}

interface UseEnhancedTravelReturn {
  enhancedEvents: ItineraryEvent[];
  isEnhancing: boolean;
  enhanceSpecificTravel: (travelIndex: number) => Promise<void>;
  enhanceAllTravel: () => Promise<void>;
  error: string | null;
}

export const useEnhancedTravel = (
  events: ItineraryEvent[],
  options: UseEnhancedTravelOptions = {}
): UseEnhancedTravelReturn => {
  const [enhancedEvents, setEnhancedEvents] = useState<ItineraryEvent[]>(events);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedIndices, setEnhancedIndices] = useState<Set<number>>(new Set());

  // Update enhanced events when input events change
  useEffect(() => {
    setEnhancedEvents(events);
    setEnhancedIndices(new Set()); // Reset enhanced tracking
  }, [events]);

  // Auto-enhance all travel segments on mount if enabled
  useEffect(() => {
    if (options.autoEnhance && events.length > 0 && enhancedIndices.size === 0) {
      enhanceAllTravel();
    }
  }, [events, options.autoEnhance]);

  const enhanceSpecificTravel = useCallback(async (travelIndex: number) => {
    const event = enhancedEvents[travelIndex];
    
    if (!event || event.type !== 'travel' || enhancedIndices.has(travelIndex)) {
      return; // Already enhanced or not a travel event
    }

    console.log(`🚗 Enhancing travel segment ${travelIndex}...`);
    setIsEnhancing(true);
    setError(null);

    try {
      const travelData = event.data;
      const realTravelData = await travelGenerator.generateTravelSegment(
        travelData.startLocation,
        travelData.endLocation,
        travelData.startTime,
        {
          preferredModes: options.preferredModes,
          maxWalkingDistance: options.maxWalkingDistance,
          avoidHighways: options.avoidHighways,
          avoidTolls: options.avoidTolls
        }
      );

      // Update the specific travel segment
      setEnhancedEvents(prev => {
        const newEvents = [...prev];
        newEvents[travelIndex] = {
          ...event,
          data: {
            ...travelData,
            ...realTravelData.data,
            id: travelData.id // Preserve original ID
          }
        };
        return newEvents;
      });

      // Mark this index as enhanced
      setEnhancedIndices(prev => new Set([...prev, travelIndex]));

      console.log(`✅ Successfully enhanced travel segment ${travelIndex}`);
    } catch (err) {
      const errorMessage = `Failed to enhance travel segment: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  }, [enhancedEvents, enhancedIndices, options]);

  const enhanceAllTravel = useCallback(async () => {
    const travelIndices = enhancedEvents
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => event.type === 'travel')
      .map(({ index }) => index)
      .filter(index => !enhancedIndices.has(index));

    if (travelIndices.length === 0) {
      console.log('ℹ️ No travel segments to enhance');
      return;
    }

    console.log(`🚗 Enhancing ${travelIndices.length} travel segments...`);
    setIsEnhancing(true);
    setError(null);

    try {
      // Enhance all travel segments concurrently (with a limit to avoid API rate limits)
      const batchSize = 3; // Process 3 at a time to avoid overwhelming the API
      const batches = [];
      
      for (let i = 0; i < travelIndices.length; i += batchSize) {
        batches.push(travelIndices.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (travelIndex) => {
            try {
              await enhanceSpecificTravel(travelIndex);
            } catch (err) {
              console.error(`❌ Failed to enhance travel segment ${travelIndex}:`, err);
              // Continue with other segments even if one fails
            }
          })
        );
        
        // Small delay between batches to be respectful to the API
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('✅ Finished enhancing all travel segments');
    } catch (err) {
      const errorMessage = `Failed to enhance travel segments: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  }, [enhancedEvents, enhancedIndices, enhanceSpecificTravel]);

  return {
    enhancedEvents,
    isEnhancing,
    enhanceSpecificTravel,
    enhanceAllTravel,
    error
  };
};

// Hook specifically for a single travel segment (useful for ItineraryItem component)
export const useEnhancedTravelSegment = (
  travelData: any,
  options: TravelSegmentOptions = {}
) => {
  const [enhancedData, setEnhancedData] = useState(travelData);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);

  const enhance = useCallback(async () => {
    if (isEnhanced || !travelData.startLocation || !travelData.endLocation) {
      return;
    }

    console.log('🚗 Enhancing single travel segment...');
    setIsEnhancing(true);
    setError(null);

    try {
      const realTravelData = await travelGenerator.generateTravelSegment(
        travelData.startLocation,
        travelData.endLocation,
        travelData.startTime,
        options
      );

      setEnhancedData({
        ...travelData,
        ...realTravelData.data,
        id: travelData.id // Preserve original ID
      });
      
      setIsEnhanced(true);
      console.log('✅ Successfully enhanced travel segment');
    } catch (err) {
      const errorMessage = `Failed to enhance travel segment: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  }, [travelData, options, isEnhanced]);

  return {
    enhancedData,
    isEnhancing,
    enhance,
    isEnhanced,
    error
  };
};

export default useEnhancedTravel;