interface AIActivity {
  name: string;
  location: string;
  postcode: string;
  description: string;
  duration_minutes: number;
  cost_gbp: number;
  category: string;
  why_special: string;
}

interface AIPlan {
  plan: {
    morning: AIActivity[];
    afternoon: AIActivity[];
    evening: AIActivity[];
  };
  total_cost: number;
  total_duration_hours: number;
  special_notes: string;
}

interface DayPlanEvent {
  type: 'activity';
  data: {
    id: string;
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    duration: number;
    cost: number;
    activityType: string[];
    address: string;
    ratings: number;
  };
}

interface GeneratedDayPlan {
  id: string;
  title: string;
  date: string;
  events: DayPlanEvent[];
  totalCost: number;
  totalDuration: number;
  preferences: any;
  revealProgress: number;
  aiGenerated: boolean;
  specialNotes?: string;
}

class DayWeaveAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/.netlify/functions';
  }

async generateDayPlan(location: string, preferences: any, weather: any = null): Promise<GeneratedDayPlan> {
  try {
    const response = await fetch(`${this.baseUrl}/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // Add this line
      },
      body: JSON.stringify({
        location,
        preferences,
        weather
      })
    });

    if (!response.ok) {
      throw new Error(`Plan generation failed: ${response.status}`);
    }

    const data: AIPlan = await response.json();
    
    // Convert AI response to your existing DayPlan format
    return this.convertToDayPlan(data, location, preferences);
  } catch (error) {
    console.error('Error generating plan:', error);
    throw error;
  }
}

  private convertToDayPlan(aiData: AIPlan, location: string, preferences: any): GeneratedDayPlan {
    const allActivities = [
      ...aiData.plan.morning,
      ...aiData.plan.afternoon,
      ...aiData.plan.evening
    ];

    const events: DayPlanEvent[] = allActivities.map((activity, index) => ({
      type: 'activity',
      data: {
        id: `ai-${index}`,
        name: activity.name,
        description: activity.description,
        location: activity.location,
        startTime: this.calculateTime(index, activity.duration_minutes),
        endTime: this.calculateTime(index + 1, activity.duration_minutes),
        duration: activity.duration_minutes,
        cost: activity.cost_gbp,
        activityType: [activity.category || 'mixed'],
        address: activity.postcode ? `${activity.location}, ${activity.postcode}` : activity.location,
        ratings: Math.random() * 2 + 3.5 // Placeholder until we get real ratings
      }
    }));

    return {
      id: Date.now().toString(),
      title: `AI-Generated Adventure in ${location}`,
      date: new Date().toISOString().split('T')[0],
      events: events,
      totalCost: aiData.total_cost || allActivities.reduce((sum, a) => sum + a.cost_gbp, 0),
      totalDuration: aiData.total_duration_hours * 60 || allActivities.reduce((sum, a) => sum + a.duration_minutes, 0),
      preferences: preferences,
      revealProgress: preferences.surpriseMode ? 25 : 100,
      aiGenerated: true,
      specialNotes: aiData.special_notes
    };
  }

  private calculateTime(index: number, duration: number): string {
    const startHour = 9; // 9 AM start
    const totalMinutes = startHour * 60 + (index * (duration + 30)); // 30 min travel between activities
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

export const dayWeaveAPI = new DayWeaveAPI();