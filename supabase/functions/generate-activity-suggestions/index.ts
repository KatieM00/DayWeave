import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.2.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SuggestionsRequest {
  location: string;
  preferences: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, preferences }: SuggestionsRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY environment variable is not set')
      throw new Error('Google AI API key is not configured')
    }

    console.log('Google AI API key found, generating activity suggestions...')

    // Initialize Gemini AI with server-side API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    
    const prompt = `Generate 5 activity suggestions for ${location} based on these preferences:
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ')}
- Group Size: ${preferences.groupSize}

Return ONLY a JSON array of activities with this structure:
[
  {
    "id": "unique_id",
    "name": "Activity name",
    "description": "Detailed description",
    "location": "Specific venue name",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "duration": minutes_as_number,
    "cost": cost_in_pounds,
    "activityType": ["type1", "type2"],
    "address": "Full address",
    "ratings": 4.5,
    "imageUrl": null
  }
]`

    console.log('Generating activity suggestions with Gemini AI...')

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('AI response received, parsing JSON...')
    
    let suggestions
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      suggestions = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw AI response:', text)
      
      // Return fallback suggestions if AI fails
      suggestions = [
        {
          id: 'fallback-1',
          name: 'Local Walk',
          description: 'Take a pleasant walk around the local area',
          location: 'Local area',
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          cost: 0,
          activityType: ['outdoor'],
          address: '',
          ratings: 4.0,
          imageUrl: null
        }
      ]
    }

    console.log('Successfully generated activity suggestions')

    return new Response(
      JSON.stringify(suggestions),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating activity suggestions:', error)
    
    // Return fallback suggestions if everything fails
    const fallbackSuggestions = [
      {
        id: 'fallback-1',
        name: 'Local Walk',
        description: 'Take a pleasant walk around the local area',
        location: 'Local area',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        cost: 0,
        activityType: ['outdoor'],
        address: '',
        ratings: 4.0,
        imageUrl: null
      }
    ]

    return new Response(
      JSON.stringify(fallbackSuggestions),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})