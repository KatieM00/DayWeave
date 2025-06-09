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

const MAX_RETRIES = 3;

function cleanJsonString(jsonString: string): string {
  let cleaned = jsonString
    // Remove markdown code blocks
    .replace(/```json\n?/g, '').replace(/```\n?/g, '')
    .trim();

  // Find the first opening brace and last closing brace
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in AI response');
  }
  
  // Extract only the JSON content
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  // Apply comprehensive JSON cleaning
  cleaned = cleaned
    // Fix unquoted property names
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    // Fix single quotes to double quotes
    .replace(/'/g, '"')
    // Fix trailing commas before closing brackets/braces
    .replace(/,(\s*[}\]])/g, '$1')
    // Add missing commas between string values and new properties
    .replace(/("(?:[^"\\]|\\.)*")\s*([a-zA-Z_"]\w*\s*:)/g, '$1,$2')
    // Add missing commas between closing braces/brackets and new properties
    .replace(/([}\]])\s*("?\w+"?\s*:)/g, '$1,$2')
    // Add missing commas between values and opening braces/brackets
    .replace(/("(?:[^"\\]|\\.)*")\s*([{\[])/g, '$1,$2')
    // Add missing commas between numbers and new properties
    .replace(/(\d)\s*("?\w+"?\s*:)/g, '$1,$2')
    // Add missing commas between boolean values and new properties
    .replace(/(true|false|null)\s*("?\w+"?\s*:)/g, '$1,$2')
    // Fix multiple consecutive commas
    .replace(/,+/g, ',')
    // Remove commas before closing brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Normalize whitespace
    .replace(/\s+/g, ' ');

  return cleaned;
}

async function generateItineraryWithRetry(model: any, prompt: string, attempt: number = 1): Promise<any> {
  console.log(`Attempt ${attempt}/${MAX_RETRIES}: Generating content with Gemini AI...`)
  
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log(`Attempt ${attempt}: AI response received, parsing JSON...`)
    console.log(`Attempt ${attempt}: Raw response preview:`, text.substring(0, 200) + '...')
    
    try {
      const cleanedJson = cleanJsonString(text);
      console.log(`Attempt ${attempt}: Cleaned JSON preview:`, cleanedJson.substring(0, 200) + '...')
      
      const itineraryData = JSON.parse(cleanedJson);
      console.log(`Attempt ${attempt}: Successfully parsed JSON`);
      return itineraryData;
    } catch (parseError) {
      console.error(`Attempt ${attempt}: JSON parsing error:`, parseError.message);
      console.error(`Attempt ${attempt}: Raw AI response:`, text.substring(0, 500) + '...');
      
      if (attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt}: Retrying due to JSON parsing error...`);
        return await generateItineraryWithRetry(model, prompt, attempt + 1);
      } else {
        throw new Error(`Failed to parse JSON after ${MAX_RETRIES} attempts. Last error: ${parseError.message}`);
      }
    }
  } catch (error) {
    console.error(`Attempt ${attempt}: Error during AI generation:`, error.message)
    
    if (attempt < MAX_RETRIES && !error.message.includes('API key')) {
      console.log(`Attempt ${attempt}: Retrying due to generation error...`)
      return await generateItineraryWithRetry(model, prompt, attempt + 1)
    } else {
      throw error
    }
  }
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

CRITICAL: You MUST return ONLY valid JSON with properly quoted property names. Do not include any text before or after the JSON.

Generate a JSON response with this exact structure:
{
  "title": "Engaging day plan title",
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "unique_id",
        "name": "EXACT venue name as it appears on Google Maps",
        "description": "Detailed description",
        "location": "EXACT venue name for Google Maps search",
        "startTime": "HH:MM",
        "endTime": "HH:MM", 
        "duration": minutes_as_number,
        "cost": cost_in_pounds,
        "activityType": ["outdoor", "culture"],
        "address": "Full street address if known",
        "ratings": 4.5,
        "imageUrl": null,
        "bookingRequired": true_or_false,
        "bookingLink": "https://booking-url.com" or null,
        "bookingAdvice": "Specific booking advice" or null,
        "ticketProvider": "Provider name" or null
      }
    },
    {
      "type": "travel",
      "data": {
        "id": "travel_id",
        "startLocation": "Previous exact venue name",
        "endLocation": "Next exact venue name", 
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "duration": minutes_as_number,
        "mode": "walking",
        "cost": cost_in_pounds,
        "distance": distance_in_miles,
        "bookingRequired": true_or_false,
        "bookingLink": "https://booking-url.com" or null,
        "bookingAdvice": "Booking advice for transport" or null
      }
    }
  ],
  "totalCost": total_pounds,
  "totalDuration": total_minutes
}

BOOKING REQUIREMENTS - Include booking information for:
- Cinema/Theatre: Set bookingRequired=true, provide booking links (Odeon, Vue, Cineworld, etc.)
- Restaurants: Set bookingRequired=true for popular restaurants, provide OpenTable/restaurant website
- Museums/Attractions: Include booking links for timed entry venues
- Train/Bus travel: Include booking links for advance tickets when cost-effective
- Concert venues: Include ticket booking links
- Tours: Include tour operator booking links

CRITICAL REQUIREMENTS:
- Use EXACT venue names as they appear on Google Maps for better search results
- Include real, well-known venues and restaurants in ${location}
- For location field, use the exact business name (e.g. "The Shard", "Borough Market", "Tate Modern")
- Include 4-6 activities with travel between them
- Calculate realistic travel times and costs based on ${location} geography
- Include mix of activities based on user preferences
- For surprise mode: focus on hidden gems and unique experiences
- Ensure activities are typically open on ${date}
- Keep within specified budget range
- Include meal options if meal preferences selected
- Set imageUrl to null - Google Maps integration will handle images
- Add booking information where appropriate with real booking URLs when possible
- For bookingAdvice, provide specific guidance like "Book 2-3 days in advance" or "Walk-ins available but booking recommended"
- Return ONLY valid JSON with properly quoted property names, no additional text
- Make venue names specific and searchable (avoid generic terms like "local café")
- ALL property names MUST be enclosed in double quotes
- Use double quotes for all string values, never single quotes`

    const itineraryData = await generateItineraryWithRetry(model, prompt)
    
    const dayPlan = {
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