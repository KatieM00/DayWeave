// Enhanced travel segment generator that uses Google Maps Directions API
// This should be used in your ItineraryView component when generating travel segments

interface TravelSegmentOptions {
  preferredModes?: string[];
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  maxWalkingDistance?: number; // in miles
}

interface GeneratedTravelSegment {
  type: 'travel';
  data: {
    id: string;
    startLocation: string;
    endLocation: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    mode: string;
    cost: number;
    distance: number; // in miles
    bookingRequired: boolean;
    bookingLink: string | null;
    bookingAdvice: string | null;
    realDirections?: {
      steps: Array<{
        instructions: string;
        distance: string;
        duration: string;
      }>;
      polyline?: string;
    };
  };
}

class TravelSegmentGenerator {
  private static instance: TravelSegmentGenerator;
  private directionsService: google.maps.DirectionsService | null = null;
  private isGoogleMapsLoaded = false;

  static getInstance(): TravelSegmentGenerator {
    if (!TravelSegmentGenerator.instance) {
      TravelSegmentGenerator.instance = new TravelSegmentGenerator();
    }
    return TravelSegmentGenerator.instance;
  }

  private async ensureGoogleMapsLoaded(): Promise<boolean> {
    if (this.isGoogleMapsLoaded && this.directionsService) {
      return true;
    }

    if (!window.google?.maps) {
      console.warn('Google Maps not loaded, using fallback travel data');
      return false;
    }

    try {
      this.directionsService = new window.google.maps.DirectionsService();
      this.isGoogleMapsLoaded = true;
      return true;
    } catch (error) {
      console.error('Error initializing Google Maps Directions service:', error);
      return false;
    }
  }

  private calculateFallbackTravel(
    startLocation: string,
    endLocation: string,
    startTime: string,
    options: TravelSegmentOptions
  ): GeneratedTravelSegment['data'] {
    // Generate reasonable fallback data when Google Maps isn't available
    const distance = Math.round((Math.random() * 2 + 0.1) * 10) / 10; // 0.1 to 2.1 miles
    const preferredModes = options.preferredModes || ['walking', 'driving'];
    
    let mode = 'walking';
    let speedMph = 3; // walking speed
    let cost = 0;

    // Choose mode based on distance and preferences
    if (distance > (options.maxWalkingDistance || 1.5) && preferredModes.includes('driving')) {
      mode = 'driving';
      speedMph = 25; // average city driving speed
      cost = Math.round(distance * 0.5); // rough cost estimate for fuel/parking
    } else if (distance > 0.8 && preferredModes.includes('cycling')) {
      mode = 'cycling';
      speedMph = 12; // cycling speed
    } else if (distance > 2 && preferredModes.includes('transit')) {
      mode = 'transit';
      speedMph = 15; // average transit speed including waiting
      cost = Math.round(distance * 1.5); // transit fare estimate
    }

    const durationMinutes = Math.max(5, Math.round((distance / speedMph) * 60));
    const endTime = this.addMinutesToTime(startTime, durationMinutes);

    return {
      id: `travel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startLocation,
      endLocation,
      startTime,
      endTime,
      duration: durationMinutes,
      mode,
      cost,
      distance,
      bookingRequired: mode === 'transit' && cost > 0,
      bookingLink: mode === 'transit' ? this.getTransitBookingLink(startLocation, endLocation) : null,
      bookingAdvice: mode === 'transit' ? 'Check local transit apps for real-time schedules' : null
    };
  }

  private addMinutesToTime(timeString: string, minutes: number): string {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  private getTransitBookingLink(startLocation: string, endLocation: string): string | null {
    // Generate transit booking links based on common UK transit systems
    const origin = encodeURIComponent(startLocation);
    const destination = encodeURIComponent(endLocation);
    
    // Default to Google Maps transit directions
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
  }

  private mapGoogleModeToString(mode: google.maps.TravelMode): string {
    switch (mode) {
      case google.maps.TravelMode.DRIVING:
        return 'driving';
      case google.maps.TravelMode.WALKING:
        return 'walking';
      case google.maps.TravelMode.BICYCLING:
        return 'cycling';
      case google.maps.TravelMode.TRANSIT:
        return 'transit';
      default:
        return 'walking';
    }
  }

  private calculateCostFromMode(mode: string, distance: number): number {
    switch (mode) {
      case 'driving':
        return Math.round(distance * 0.5); // fuel + potential parking
      case 'transit':
        return Math.round(distance * 1.5); // typical UK transit fare
      case 'cycling':
      case 'walking':
      default:
        return 0;
    }
  }

  async generateTravelSegment(
    startLocation: string,
    endLocation: string,
    startTime: string,
    options: TravelSegmentOptions = {}
  ): Promise<GeneratedTravelSegment> {
    console.log('🚗 Generating travel segment:', { startLocation, endLocation, startTime });

    // Validate inputs
    if (!startLocation || !endLocation || !startTime) {
      throw new Error('Missing required parameters for travel segment generation');
    }

    const isGoogleMapsAvailable = await this.ensureGoogleMapsLoaded();

    if (!isGoogleMapsAvailable || !this.directionsService) {
      console.log('📍 Using fallback travel calculation');
      return {
        type: 'travel',
        data: this.calculateFallbackTravel(startLocation, endLocation, startTime, options)
      };
    }

    return new Promise((resolve) => {
      const preferredModes = options.preferredModes || ['walking', 'driving', 'transit'];
      let bestResult: GeneratedTravelSegment | null = null;
      let completedRequests = 0;
      const totalRequests = preferredModes.length;

      // Function to handle when all requests are complete
      const handleComplete = () => {
        if (bestResult) {
          console.log('✅ Real travel directions generated:', bestResult.data);
          resolve(bestResult);
        } else {
          console.log('📍 All Google requests failed, using fallback');
          resolve({
            type: 'travel',
            data: this.calculateFallbackTravel(startLocation, endLocation, startTime, options)
          });
        }
      };

      // Try each preferred mode
      preferredModes.forEach((modeString) => {
        let travelMode: google.maps.TravelMode;
        
        switch (modeString) {
          case 'driving':
            travelMode = google.maps.TravelMode.DRIVING;
            break;
          case 'cycling':
            travelMode = google.maps.TravelMode.BICYCLING;
            break;
          case 'transit':
            travelMode = google.maps.TravelMode.TRANSIT;
            break;
          default:
            travelMode = google.maps.TravelMode.WALKING;
        }

        const request: google.maps.DirectionsRequest = {
          origin: startLocation,
          destination: endLocation,
          travelMode: travelMode,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: options.avoidHighways || false,
          avoidTolls: options.avoidTolls || false
        };

        this.directionsService!.route(request, (result, status) => {
          completedRequests++;

          if (status === 'OK' && result?.routes?.[0]) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Convert distance to miles
            const distanceInMiles = leg.distance ? leg.distance.value * 0.000621371 : 0.5;
            
            // Parse duration in minutes
            const durationMinutes = leg.duration ? Math.round(leg.duration.value / 60) : 15;
            
            // Calculate end time
            const endTime = this.addMinutesToTime(startTime, durationMinutes);
            
            // Calculate cost based on mode
            const cost = this.calculateCostFromMode(modeString, distanceInMiles);
            
            const travelData: GeneratedTravelSegment = {
              type: 'travel',
              data: {
                id: `travel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                startLocation,
                endLocation,
                startTime,
                endTime,
                duration: durationMinutes,
                mode: modeString,
                cost,
                distance: Math.round(distanceInMiles * 10) / 10,
                bookingRequired: modeString === 'transit' && cost > 0,
                bookingLink: modeString === 'transit' ? this.getTransitBookingLink(startLocation, endLocation) : null,
                bookingAdvice: modeString === 'transit' ? 'Check local transit apps for real-time schedules' : null,
                realDirections: {
                  steps: leg.steps?.map(step => ({
                    instructions: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
                    distance: step.distance?.text || '',
                    duration: step.duration?.text || ''
                  })) || [],
                  polyline: route.overview_polyline?.points || undefined
                }
              }
            };

            // Choose the best option (prefer walking for short distances, driving for longer)
            if (!bestResult || this.isBetterTravelOption(travelData.data, bestResult.data, options)) {
              bestResult = travelData;
            }
          } else {
            console.log(`❌ Directions request failed for ${modeString}:`, status);
          }

          // Check if all requests are complete
          if (completedRequests >= totalRequests) {
            handleComplete();
          }
        });
      });

      // Timeout after 5 seconds if Google Maps is being slow
      setTimeout(() => {
        if (completedRequests < totalRequests) {
          console.log('⏰ Google Maps timeout, using fallback');
          resolve({
            type: 'travel',
            data: this.calculateFallbackTravel(startLocation, endLocation, startTime, options)
          });
        }
      }, 5000);
    });
  }

  private isBetterTravelOption(
    newOption: GeneratedTravelSegment['data'], 
    currentBest: GeneratedTravelSegment['data'],
    options: TravelSegmentOptions
  ): boolean {
    // Prefer walking for short distances (under max walking distance)
    const maxWalkingDistance = options.maxWalkingDistance || 1.5;
    
    if (newOption.distance <= maxWalkingDistance && newOption.mode === 'walking') {
      return true;
    }
    
    if (currentBest.distance <= maxWalkingDistance && currentBest.mode === 'walking') {
      return false;
    }
    
    // For longer distances, prefer faster options
    if (newOption.duration < currentBest.duration) {
      return true;
    }
    
    // If duration is similar, prefer cheaper options
    if (Math.abs(newOption.duration - currentBest.duration) <= 5) {
      return newOption.cost < currentBest.cost;
    }
    
    return false;
  }

  // Batch generate travel segments for an entire itinerary
  async generateTravelSegmentsForItinerary(
    activities: Array<{ location: string; endTime: string; startTime: string }>,
    options: TravelSegmentOptions = {}
  ): Promise<GeneratedTravelSegment[]> {
    const travelSegments: GeneratedTravelSegment[] = [];
    
    for (let i = 0; i < activities.length - 1; i++) {
      const currentActivity = activities[i];
      const nextActivity = activities[i + 1];
      
      try {
        const travelSegment = await this.generateTravelSegment(
          currentActivity.location,
          nextActivity.location,
          currentActivity.endTime,
          options
        );
        
        // Adjust the travel segment end time to match the next activity start time
        const timeDifference = this.getTimeDifferenceMinutes(
          travelSegment.data.endTime,
          nextActivity.startTime
        );
        
        if (Math.abs(timeDifference) > 5) {
          // Adjust the travel duration to fit the schedule
          const newDuration = this.getTimeDifferenceMinutes(
            currentActivity.endTime,
            nextActivity.startTime
          );
          
          if (newDuration > 0) {
            travelSegment.data.duration = newDuration;
            travelSegment.data.endTime = nextActivity.startTime;
          }
        }
        
        travelSegments.push(travelSegment);
      } catch (error) {
        console.error(`Error generating travel segment ${i}:`, error);
        
        // Create a basic fallback travel segment
        travelSegments.push({
          type: 'travel',
          data: this.calculateFallbackTravel(
            currentActivity.location,
            nextActivity.location,
            currentActivity.endTime,
            options
          )
        });
      }
    }
    
    return travelSegments;
  }

  private getTimeDifferenceMinutes(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    
    return minutes2 - minutes1;
  }

  // Utility method to update an existing itinerary with real travel data
  async enhanceItineraryWithRealTravelData(
    events: Array<{ type: string; data: any }>,
    options: TravelSegmentOptions = {}
  ): Promise<Array<{ type: string; data: any }>> {
    const enhancedEvents = [...events];
    
    for (let i = 0; i < enhancedEvents.length; i++) {
      const event = enhancedEvents[i];
      
      if (event.type === 'travel') {
        try {
          const realTravelData = await this.generateTravelSegment(
            event.data.startLocation,
            event.data.endLocation,
            event.data.startTime,
            options
          );
          
          // Merge the real data with existing data, preserving any custom fields
          enhancedEvents[i] = {
            ...event,
            data: {
              ...event.data,
              ...realTravelData.data,
              id: event.data.id // Preserve original ID
            }
          };
          
          console.log(`✅ Enhanced travel segment ${i} with real data`);
        } catch (error) {
          console.error(`❌ Failed to enhance travel segment ${i}:`, error);
          // Keep original data if enhancement fails
        }
      }
    }
    
    return enhancedEvents;
  }
}

// Export the singleton instance
export const travelGenerator = TravelSegmentGenerator.getInstance();

// Export types for use in other components
export type { GeneratedTravelSegment, TravelSegmentOptions };

// Convenience function for quick travel segment generation
export const generateTravelSegment = (
  startLocation: string,
  endLocation: string,
  startTime: string,
  options?: TravelSegmentOptions
) => {
  return travelGenerator.generateTravelSegment(startLocation, endLocation, startTime, options);
};

// Convenience function for enhancing entire itineraries
export const enhanceItineraryWithRealTravelData = (
  events: Array<{ type: string; data: any }>,
  options?: TravelSegmentOptions
) => {
  return travelGenerator.enhanceItineraryWithRealTravelData(events, options);
};

export default TravelSegmentGenerator;