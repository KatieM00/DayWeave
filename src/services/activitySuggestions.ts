import { supabase } from '../lib/supabase';
import { generateActivitySuggestions } from './api';
import type { Activity } from '../types';

interface SuggestionParams {
  location: string;
  categories: string[];
  maxBudget: number;
  radius: number;
}

export const getActivitySuggestions = async (params: SuggestionParams): Promise<Activity[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Build cache query conditionally based on user authentication
    let cacheQuery = supabase
      .from('activity_suggestions_cache')
      .select('suggestions')
      .eq('location', params.location)
      .gte('expires_at', new Date().toISOString());

    // Add user_id filter conditionally
    if (userId) {
      cacheQuery = cacheQuery.eq('user_id', userId);
    } else {
      cacheQuery = cacheQuery.is('user_id', null);
    }

    const { data: cachedData, error: cacheError } = await cacheQuery.maybeSingle();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache query error:', cacheError);
    }

    // If we have cached data, return it
    if (cachedData?.suggestions) {
      return cachedData.suggestions as Activity[];
    }

    // Generate new suggestions using AI
    const suggestions = await generateActivitySuggestions(params.location, {
      activityTypes: params.categories,
      budgetRange: `0-${params.maxBudget}`,
      travelDistance: { value: params.radius, unit: 'miles' }
    });

    // Cache the results with user_id
    const { error: insertError } = await supabase
      .from('activity_suggestions_cache')
      .insert({
        user_id: userId,
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