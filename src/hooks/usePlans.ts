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
          events: plan.events as any,
          total_cost: plan.totalCost,
          total_duration: plan.totalDuration,
          preferences: plan.preferences as any,
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

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.events !== undefined) updateData.events = updates.events;
      if (updates.totalCost !== undefined) updateData.total_cost = updates.totalCost;
      if (updates.totalDuration !== undefined) updateData.total_duration = updates.totalDuration;
      if (updates.preferences !== undefined) updateData.preferences = updates.preferences;
      if (updates.weatherForecast !== undefined) updateData.weather_forecast = updates.weatherForecast;
      if (updates.revealProgress !== undefined) updateData.reveal_progress = updates.revealProgress;

      const { data, error: updateError } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', planId)
        .select();

      if (updateError) throw updateError;
      
      if (!data || data.length === 0) {
        throw new Error('Plan not found or you do not have permission to update it');
      }
      
      return data[0];
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

  const getUserPlans = async (): Promise<DayPlan[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform database rows to DayPlan objects
      return (data || []).map((plan: Plan): DayPlan => ({
        id: plan.id,
        title: plan.title,
        date: plan.date,
        events: plan.events as any,
        totalCost: plan.total_cost,
        totalDuration: plan.total_duration,
        preferences: plan.preferences as any,
        weatherForecast: plan.weather_forecast as any,
        revealProgress: plan.reveal_progress || 100
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlanById = async (planId: string): Promise<DayPlan | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) return null;

      // Transform database row to DayPlan object
      return {
        id: data.id,
        title: data.title,
        date: data.date,
        events: data.events as any,
        totalCost: data.total_cost,
        totalDuration: data.total_duration,
        preferences: data.preferences as any,
        weatherForecast: data.weather_forecast as any,
        revealProgress: data.reveal_progress || 100
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlanByShareableLinkId = async (shareableLinkId: string): Promise<DayPlan | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('shareable_link_id', shareableLinkId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) return null;

      // Transform database row to DayPlan object
      return {
        id: data.id,
        title: data.title,
        date: data.date,
        events: data.events as any,
        totalCost: data.total_cost,
        totalDuration: data.total_duration,
        preferences: data.preferences as any,
        weatherForecast: data.weather_forecast as any,
        revealProgress: data.reveal_progress || 100
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shared plan';
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
    getPlanById,
    getPlanByShareableLinkId,
  };
};