import { supabase } from '../lib/supabase';
import { generateActivitySuggestions } from './api';
import type { Activity } from '../types';

import type { ActivityType } from '../types';

interface SuggestionParams {
  location: string;
  categories: ActivityType[];
  maxBudget: number;
  radius: number;
}

export const getActivitySuggestions = async (params: SuggestionParams): Promise<Activity[]> => {
  try {
    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('activity_suggestions_cache')
      .select('suggestions')
      .eq('location', params.location)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache query error:', cacheError);
    }

    // If we have cached data, return it
    if (cachedData?.suggestions) {
      return cachedData.suggestions as Activity[];
    }

    const suggestions = await generateActivitySuggestions(params.location, {
      activityTypes: params.categories,
      budgetRange: [{ min: 0, max: params.maxBudget }],
      travelDistance: { value: params.radius, unit: 'miles' }
    });

    // Cache the results
    const { error: insertError } = await supabase
      .from('activity_suggestions_cache')
      .insert({
        location: params.location,
        query_params: params,
        suggestions,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours cache
      });

    if (insertError) {
      console.error('Failed to cache suggestions:', insertError);
    }

    return suggestions;
  } catch (error) {
    console.error('Error fetching activity suggestions:', error);
    
    // Return fallback suggestions if everything fails
    return [
      {
        id: 'fallback-1',
        name: 'Local Walk',
        description: 'Take a pleasant walk around the local area',
        location: params.location,
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        cost: 0,
        activityType: ['outdoor'],
        ratings: 4.0
      }
    ];
  }
};