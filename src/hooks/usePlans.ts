import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DayPlan } from '../types';
import type { Database } from '../types/database';

type Plan = Database['public']['Tables']['plans']['Row'];

export const usePlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePlan = async (plan: DayPlan) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: saveError } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          title: plan.title,
          date: plan.date,
          events: plan.events,
          total_cost: plan.totalCost,
          total_duration: plan.totalDuration,
          preferences: plan.preferences,
          weather_forecast: plan.weatherForecast || null,
          reveal_progress: plan.revealProgress || 100,
        })
        .select()
        .single();

      if (saveError) throw saveError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<DayPlan>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('plans')
        .update({
          title: updates.title,
          date: updates.date,
          events: updates.events,
          total_cost: updates.totalCost,
          total_duration: updates.totalDuration,
          preferences: updates.preferences,
          weather_forecast: updates.weatherForecast || null,
          reveal_progress: updates.revealProgress || 100,
        })
        .eq('id', planId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    savePlan,
    updatePlan,
    deletePlan,
    getUserPlans,
  };
};