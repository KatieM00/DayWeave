import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.2.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Reduced to 1 retry only
const MAX_RETRIES = 1;
// Simplified JSON cleaning - much faster
function cleanJsonString(jsonString) {
  let cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No valid JSON found');
  }
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  // Basic fixes only - removed complex regex operations
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,(\s*[}\]])/g, '$1');
  return cleaned;
}
async function generateItineraryWithRetry(model, prompt, attempt = 1) {
  try {
    // Add timeout to AI call
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), 12000); // 12 second timeout
    const result = await model.generateContent(prompt, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const response = await result.response;
    const text = response.text();
    try {
      const cleanedJson = cleanJsonString(text);
      const itineraryData = JSON.parse(cleanedJson);
      // Quick validation only
      if (!itineraryData.events || !Array.isArray(itineraryData.events)) {
        throw new Error('Invalid events structure');
      }
      return itineraryData;
    } catch (parseError) {
      if (attempt < MAX_RETRIES) {
        return await generateItineraryWithRetry(model, prompt, attempt + 1);
      } else {
        throw new Error(`JSON parsing failed: ${parseError.message}`);
      }
    }
  } catch (error) {
    if (attempt < MAX_RETRIES && !error.message.includes('API key')) {
      return await generateItineraryWithRetry(model, prompt, attempt + 1);
    } else {
      throw error;
    }
  }
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { location, date, preferences, surpriseMode } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro"
    });
    // OPTIMIZED PROMPT - Much shorter but still gets real venue data
    const prompt = `Create a realistic day itinerary for ${location} on ${date}.

User Info:
- ${preferences.groupSize} people
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ') || 'mixed'}
- Time: ${preferences.startTime || '09:00'} to ${preferences.endTime || '21:00'}
- Transport: ${preferences.transportModes?.join(', ') || 'any'}
${surpriseMode ? '- Find hidden gems and unique local spots' : ''}
${preferences.mealPreferences ? `- Include: ${preferences.mealPreferences.includeCoffee ? 'coffee,' : ''} ${preferences.mealPreferences.includeLunch ? 'lunch,' : ''} ${preferences.mealPreferences.includeDinner ? 'dinner' : ''}` : ''}

Return ONLY valid JSON with this structure:
{
  "title": "Day in ${location}",
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "act_1",
        "name": "Real venue name",
        "description": "What you'll do here",
        "location": "Exact venue name for maps",
        "startTime": "10:00",
        "endTime": "11:30",
        "duration": 90,
        "cost": 15,
        "activityType": ["category"],
        "address": "Street address if known",
        "ratings": 4.2,
        "imageUrl": null,
        "bookingRequired": false,
        "bookingLink": null,
        "bookingAdvice": null
      }
    },
    {
      "type": "travel",
      "data": {
        "id": "travel_1",
        "startLocation": "Previous venue",
        "endLocation": "Next venue",
        "startTime": "11:30",
        "endTime": "11:45",
        "duration": 15,
        "mode": "walking",
        "cost": 0,
        "distance": 0.8
      }
    }
  ],
  "totalCost": 85,
  "totalDuration": 420
}

Requirements:
- Use real ${location} venues that exist
- Include 4-5 activities + travel segments
- Realistic costs for ${location}
- Venues typically open on ${date}
- Mix indoor/outdoor based on preferences
- EXACT venue names for Google Maps search
- Travel times realistic for ${location} geography`;
    const itineraryData = await generateItineraryWithRetry(model, prompt);
    const dayPlan = {
      date,
      ...itineraryData,
      preferences,
      revealProgress: surpriseMode ? 20 : 100
    };
    return new Response(JSON.stringify(dayPlan), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    const errorResponse = {
      error: 'Failed to generate itinerary',
      details: error.message,
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
