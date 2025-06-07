import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ItineraryRequest {
  location: string;
  date: string;
  preferences: any;
  surpriseMode: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, date, preferences, surpriseMode }: ItineraryRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY environment variable is not set')
      throw new Error('Google AI API key is not configured')
    }

    console.log('API key found, initializing Gemini AI...')

    // Initialize Gemini AI with server-side API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `You are an expert local travel guide creating a day itinerary for ${location} on ${date}.

User Preferences:
- Start Location: ${preferences.startLocation}
- Group Size: ${preferences.groupSize} people
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ') || 'Any'}
- Transport: ${preferences.transportModes?.join(', ') || 'Any'}
- Time: ${preferences.startTime || '09:00'} to ${preferences.endTime || '21:00'}
- Surprise Mode: ${surpriseMode}
${preferences.mealPreferences ? `
- Meal Preferences:
  * Morning Coffee: ${preferences.mealPreferences.includeCoffee}
  * Lunch: ${preferences.mealPreferences.includeLunch}
  * Dinner: ${preferences.mealPreferences.includeDinner}` : ''}

Generate a JSON response with this exact structure:
{
  "title": "Engaging day plan title",
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "unique_id",
        "name": "Activity name",
        "description": "Detailed description",
        "location": "Specific venue name",
        "startTime": "HH:MM",
        "endTime": "HH:MM", 
        "duration": minutes_as_number,
        "cost": cost_in_pounds,
        "activityType": ["outdoor", "culture"],
        "address": "Full address",
        "ratings": 4.5,
        "imageUrl": null
      }
    },
    {
      "type": "travel",
      "data": {
        "id": "travel_id",
        "startLocation": "Previous location",
        "endLocation": "Next location", 
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "duration": minutes_as_number,
        "mode": "walking",
        "cost": cost_in_pounds,
        "distance": distance_in_miles
      }
    }
  ],
  "totalCost": total_pounds,
  "totalDuration": total_minutes
}

REQUIREMENTS:
- Include 4-6 activities with travel between them
- Use real venue names and accurate addresses for ${location}
- Calculate realistic travel times and costs
- Include mix of activities based on user preferences
- For surprise mode: focus on hidden gems and unique experiences
- Ensure activities are open on ${date}
- Keep within specified budget range
- Include meal options if meal preferences selected
- Set imageUrl to null - do not generate image URLs
- Return ONLY valid JSON, no additional text`

    console.log('Generating content with Gemini AI...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('AI response received, parsing JSON...')
    
    let itineraryData
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      itineraryData = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw AI response:', text)
      throw new Error('Invalid JSON response from AI')
    }
    
    const dayPlan = {
      id: crypto.randomUUID(),
      date,
      ...itineraryData,
      preferences,
      revealProgress: surpriseMode ? 20 : 100
    }

    console.log('Successfully generated itinerary')

    return new Response(
      JSON.stringify(dayPlan),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating itinerary:', error)
    
    // Return more detailed error information
    const errorResponse = {
      error: 'Failed to generate itinerary',
      details: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})