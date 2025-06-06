import { supabase } from '../lib/supabase';

export const trackEvent = async (eventType: string, eventData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};