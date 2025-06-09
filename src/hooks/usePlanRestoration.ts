import { useEffect, useCallback } from 'react';
import type { DayPlan } from '../types';

interface StoredPlanData {
  dayPlan: DayPlan;
  events: any[];
  planName: string;
  revealProgress: number;
  currentUrl: string;
  timestamp: number;
}

interface PlanRestorationCallbacks {
  onPlanRestore?: (planData: StoredPlanData) => void;
  onEventsRestore?: (events: any[]) => void;
  onNameRestore?: (name: string) => void;
  onProgressRestore?: (progress: number) => void;
}

const STORAGE_KEY = 'dayweave_current_plan';
const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export const usePlanRestoration = (callbacks: PlanRestorationCallbacks = {}) => {
  const {
    onPlanRestore,
    onEventsRestore,
    onNameRestore,
    onProgressRestore
  } = callbacks;

  // Store plan data with timestamp
  const storePlanData = useCallback((data: Omit<StoredPlanData, 'timestamp'>) => {
    try {
      const storedData: StoredPlanData = {
        ...data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
      console.log('Plan data stored successfully');
    } catch (error) {
      console.error('Error storing plan data:', error);
    }
  }, []);

  // Retrieve and validate stored plan data
  const getStoredPlanData = useCallback((): StoredPlanData | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: StoredPlanData = JSON.parse(stored);
      
      // Check if data has expired
      if (Date.now() - data.timestamp > EXPIRY_TIME) {
        console.log('Stored plan data has expired, removing...');
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validate data structure
      if (!data.dayPlan || !data.currentUrl) {
        console.log('Invalid stored plan data structure, removing...');
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving stored plan data:', error);
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  // Clear stored plan data
  const clearStoredPlanData = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('dayweave_should_restore');
      console.log('Stored plan data cleared');
    } catch (error) {
      console.error('Error clearing stored plan data:', error);
    }
  }, []);

  // Restore plan data and trigger callbacks
  const restorePlanData = useCallback(() => {
    const storedData = getStoredPlanData();
    if (!storedData) return false;

    try {
      console.log('Restoring plan data...');
      
      // Trigger callbacks with restored data
      if (onPlanRestore) {
        onPlanRestore(storedData);
      }
      
      if (onEventsRestore && storedData.events) {
        onEventsRestore(storedData.events);
      }
      
      if (onNameRestore && storedData.planName) {
        onNameRestore(storedData.planName);
      }
      
      if (onProgressRestore && typeof storedData.revealProgress === 'number') {
        onProgressRestore(storedData.revealProgress);
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('planRestoration', {
        detail: storedData
      }));

      // Smooth scroll to top after restoration
      window.scrollTo({ top: 0, behavior: 'smooth' });

      console.log('Plan data restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring plan data:', error);
      clearStoredPlanData();
      return false;
    }
  }, [onPlanRestore, onEventsRestore, onNameRestore, onProgressRestore, getStoredPlanData, clearStoredPlanData]);

  // Listen for custom restoration events - but don't auto-restore on mount
  useEffect(() => {
    // Listen for custom restoration events
    const handleRestorationEvent = (event: CustomEvent) => {
      console.log('Plan restoration event received:', event.detail);
    };

    window.addEventListener('planRestoration', handleRestorationEvent as EventListener);

    return () => {
      window.removeEventListener('planRestoration', handleRestorationEvent as EventListener);
    };
  }, []);

  // Cleanup expired data periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const storedData = getStoredPlanData();
      // getStoredPlanData already handles cleanup of expired data
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [getStoredPlanData]);

  return {
    storePlanData,
    getStoredPlanData,
    clearStoredPlanData,
    restorePlanData
  };
};