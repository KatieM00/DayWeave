// src/services/optimizedApi.ts
import { supabase } from '../lib/supabase';

interface ParallelPlanRequest {
  location: string;
  date: string;
  preferences: any;
  surpriseMode: boolean;
}

interface OptimizedPlanResponse {
  plan: any;
  weather: any;
  places: any[];
  photos: string[];
}

class OptimizedPlanService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL?.replace(/\/+$/, '') || '';
  }

  async generateOptimizedPlan(request: ParallelPlanRequest): Promise<OptimizedPlanResponse> {
    console.log('🚀 Starting optimized plan generation...');
    
    // Step 1: Start all API calls in parallel
    const [planResult, weatherResult, placesResult] = await Promise.allSettled([
      this.generateBasePlan(request),
      this.getWeatherForecast(request.location, request.date),
      this.preloadPlacesData(request.location)
    ]);

    // Step 2: Process results and handle any failures gracefully
    const plan = planResult.status === 'fulfilled' ? planResult.value : null;
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    const places = placesResult.status === 'fulfilled' ? placesResult.value : [];

    if (!plan) {
      throw new Error('Failed to generate base plan');
    }

    // Step 3: Enhance plan with Google Maps data in parallel
    const enhancedPlan = await this.enhancePlanWithMapsData(plan, places);

    console.log('✅ Optimized plan generation completed');
    
    return {
      plan: enhancedPlan,
      weather,
      places,
      photos: [] // Will be loaded lazily when needed
    };
  }

  private async generateBasePlan(request: ParallelPlanRequest) {
    const response = await this.callEdgeFunction('generate-itinerary', request);
    return response;
  }

  private async getWeatherForecast(location: string, date: string) {
    try {
      const response = await this.callEdgeFunction('get-weather', { location, date });
      return response;
    } catch (error) {
      console.warn('Weather fetch failed, continuing without weather data');
      return null;
    }
  }

  private async preloadPlacesData(location: string) {
    try {
      // Pre-fetch popular places in the area to speed up later enrichment
      const response = await this.callEdgeFunction('search-places', {
        query: `attractions restaurants things to do in ${location}`,
        location
      });
      return response || [];
    } catch (error) {
      console.warn('Places preload failed, will fetch individually');
      return [];
    }
  }

  private async enhancePlanWithMapsData(plan: any, preloadedPlaces: any[]) {
    if (!plan.events) return plan;

    // Process activities in parallel batches to avoid rate limits
    const activities = plan.events.filter((event: any) => event.type === 'activity');
    const batchSize = 3; // Process 3 activities at once
    
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (event: any) => {
          try {
            const enrichedData = await this.enrichActivityData(event.data, preloadedPlaces);
            Object.assign(event.data, enrichedData);
          } catch (error) {
            console.warn(`Failed to enrich activity ${event.data.name}:`, error);
          }
        })
      );
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < activities.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return plan;
  }

  private async enrichActivityData(activity: any, preloadedPlaces: any[]) {
    // First try to find in preloaded data
    const preloaded = preloadedPlaces.find(place => 
      place.name.toLowerCase().includes(activity.name.toLowerCase()) ||
      activity.name.toLowerCase().includes(place.name.toLowerCase())
    );

    if (preloaded) {
      return {
        address: preloaded.formatted_address,
        ratings: preloaded.rating,
        placeId: preloaded.place_id
      };
    }

    // Fallback to individual search
    try {
      const places = await this.callEdgeFunction('search-places', {
        query: activity.name,
        location: activity.location
      });
      
      if (places && places.length > 0) {
        return {
          address: places[0].formatted_address,
          ratings: places[0].rating,
          placeId: places[0].place_id
        };
      }
    } catch (error) {
      console.warn(`Individual place search failed for ${activity.name}`);
    }

    return {};
  }

  private async callEdgeFunction(functionName: string, payload: any) {
    const url = `${this.baseUrl}/functions/v1/${functionName}`;
    
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Edge function failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }
}

export const optimizedPlanService = new OptimizedPlanService();