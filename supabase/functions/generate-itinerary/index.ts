// Supabase Edge Function for itinerary generation
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

interface Activity {
  id: string
  name: string
  description: string
  location: string
  startTime: string
  endTime: string
  duration: number
  cost: number
  activityType: string[]
  imageUrl?: string
  address?: string
  contactInfo?: string
  ratings?: number
}

interface Travel {
  id: string
  startLocation: string
  endLocation: string
  startTime: string
  endTime: string
  duration: number
  mode: string
  cost: number
  distance: number
}

interface ItineraryEvent {
  type: 'activity' | 'travel'
  data: Activity | Travel
}

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9)
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { preferences, planData } = await req.json()
    
    if (!preferences || !planData) {
      return new Response(
        JSON.stringify({ error: 'Preferences and plan data are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Generating itinerary for:', preferences.startLocation)

    // Create itinerary events from plan data
    const events: ItineraryEvent[] = []
    let currentTime = '09:00' // Default start time

    // Helper function to add minutes to time
    const addMinutes = (time: string, minutes: number): string => {
      const [hours, mins] = time.split(':').map(Number)
      const totalMinutes = hours * 60 + mins + minutes
      const newHours = Math.floor(totalMinutes / 60) % 24
      const newMins = totalMinutes % 60
      return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
    }

    // Process each time period
    const periods = ['morning', 'afternoon', 'evening']
    let previousLocation = preferences.startLocation

    periods.forEach((period) => {
      if (planData.plan[period] && Array.isArray(planData.plan[period])) {
        planData.plan[period].forEach((activityData: any) => {
          // Add travel if not the first activity
          if (previousLocation !== activityData.location) {
            const travelDuration = 30 // Default 30 minutes travel time
            const travelEndTime = addMinutes(currentTime, travelDuration)
            
            const travel: Travel = {
              id: generateUniqueId(),
              startLocation: previousLocation,
              endLocation: activityData.location,
              startTime: currentTime,
              endTime: travelEndTime,
              duration: travelDuration,
              mode: 'walking',
              cost: 0,
              distance: 1.5
            }

            events.push({ type: 'travel', data: travel })
            currentTime = travelEndTime
          }

          // Add activity
          const endTime = addMinutes(currentTime, activityData.duration_minutes)
          
          const activity: Activity = {
            id: generateUniqueId(),
            name: activityData.name,
            description: activityData.description,
            location: activityData.location,
            startTime: currentTime,
            endTime: endTime,
            duration: activityData.duration_minutes,
            cost: activityData.cost_gbp,
            activityType: [activityData.category],
            address: activityData.location,
            ratings: 4.5 // Default rating
          }

          events.push({ type: 'activity', data: activity })
          
          currentTime = endTime
          previousLocation = activityData.location
        })
      }
    })

    // Calculate totals
    const totalCost = events.reduce((sum, event) => sum + event.data.cost, 0)
    const totalDuration = events.reduce((sum, event) => sum + event.data.duration, 0)

    // Create the full day plan
    const dayPlan = {
      id: generateUniqueId(),
      title: `${preferences.startLocation} Adventure`,
      date: new Date().toISOString().split('T')[0],
      events: events,
      totalCost: totalCost,
      totalDuration: totalDuration,
      preferences: preferences,
      revealProgress: preferences.surpriseMode ? 0 : 100
    }

    console.log('Itinerary generated successfully')

    return new Response(
      JSON.stringify(dayPlan),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Itinerary generation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})