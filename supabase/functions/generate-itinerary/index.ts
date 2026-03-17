import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const MAX_RETRIES = 3;
function cleanJsonString(jsonString) {
  console.log('Original JSON string length:', jsonString.length);
  let cleaned = jsonString// Remove markdown code blocks
  .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Find the first opening brace and last closing brace
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in AI response');
  }
  // Extract only the JSON content
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  console.log('Extracted JSON length:', cleaned.length);
  // More aggressive JSON cleaning
  cleaned = cleaned// Remove escaped quotes and backslashes first
  .replace(/\\"/g, '"').replace(/\\\\/g, '\\')// Fix unquoted property names (more specific regex)
  .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')// Fix single quotes to double quotes (but not inside strings)
  .replace(/'/g, '"')// Remove trailing commas before closing brackets/braces
  .replace(/,(\s*[}\]])/g, '$1')// Fix escaped characters that shouldn't be escaped
  .replace(/\\([^"\\\/bfnrt])/g, '$1')// Clean up any remaining backslashes at the end of values
  .replace(/(\w+)\\+"/g, '$1"').replace(/"([^"]*?)\\+"/g, '"$1"')// Fix multiple consecutive commas
  .replace(/,+/g, ',')// Normalize whitespace
  .replace(/\s+/g, ' ')// Remove any trailing backslashes
  .replace(/\\+$/, '');
  console.log('Cleaned JSON preview:', cleaned.substring(0, 300) + '...');
  return cleaned;
}
async function generateItineraryWithRetry(model, prompt, attempt = 1) {
  console.log(`Attempt ${attempt}/${MAX_RETRIES}: Generating content with Gemini AI...`);
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(`Attempt ${attempt}: AI response received, parsing JSON...`);
    console.log(`Attempt ${attempt}: Raw response preview:`, text.substring(0, 200) + '...');
    try {
      const cleanedJson = cleanJsonString(text);
      console.log(`Attempt ${attempt}: About to parse cleaned JSON...`);
      const itineraryData = JSON.parse(cleanedJson);
      console.log(`Attempt ${attempt}: Successfully parsed JSON`);
      // Validate the structure
      if (!itineraryData.events || !Array.isArray(itineraryData.events)) {
        throw new Error('Invalid JSON structure: missing or invalid events array');
      }
      return itineraryData;
    } catch (parseError) {
      console.error(`Attempt ${attempt}: JSON parsing error:`, parseError.message);
      console.error(`Attempt ${attempt}: Raw AI response:`, text.substring(0, 1000));
      if (attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt}: Retrying due to JSON parsing error...`);
        // Wait a bit before retrying
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        return await generateItineraryWithRetry(model, prompt, attempt + 1);
      } else {
        throw new Error(`Failed to parse JSON after ${MAX_RETRIES} attempts. Last error: ${parseError.message}`);
      }
    }
  } catch (error) {
    console.error(`Attempt ${attempt}: Error during AI generation:`, error.message);
    if (attempt < MAX_RETRIES && !error.message.includes('API key')) {
      console.log(`Attempt ${attempt}: Retrying due to generation error...`);
      // Wait a bit before retrying
      await new Promise((resolve)=>setTimeout(resolve, 1000));
      return await generateItineraryWithRetry(model, prompt, attempt + 1);
    } else {
      throw error;
    }
  }
}
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { location, date, preferences, surpriseMode } = await req.json();
    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY environment variable is not set');
      throw new Error('Google AI API key is not configured');
    }
    console.log('API key found, initializing Gemini AI...');
    // Initialize Gemini AI with server-side API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }],
    });
    const prompt = `Before generating this itinerary, search the web for:
- Reddit recommendations for ${preferences.activityTypes?.join(', ') || 'days out'} near ${location} (e.g. r/travel, r/unitedkingdom, r/london, local city subreddits)
- Travel blog hidden gems for ${location} and surrounding areas within ${preferences.travelRadius || 'a reasonable'} miles
- Time Out, VisitBritain, and local tourism site recommendations for ${location}
- Any recent (last 2 years) articles about underrated or lesser-known spots in ${location} and within the user's selected travel radius

Use these real-world sources to inform your activity suggestions. Prioritise places that appear in "hidden gem", "locals recommend", or "underrated" contexts over places that appear in generic "top 10 tourist attractions" lists.

You are an expert local travel guide creating a day itinerary starting from ${preferences.startLocation || location} on ${date}.

User Preferences:
- Start Location: ${preferences.startLocation}
- Travel Radius: ${preferences.travelRadius || 'flexible'} miles
- Group Size: ${preferences.groupSize} people
- Budget: ${preferences.budgetRange}
- Activities: ${preferences.activityTypes?.join(', ') || 'Any'}
- Transport: ${preferences.transportModes?.join(', ') || 'Any'}
- Time: ${preferences.startTime || '09:00'} to ${preferences.endTime || '21:00'}
- Surprise Mode: ${surpriseMode}
${preferences.mealPreferences ? `- Meal Preferences:
  * Morning Coffee: ${preferences.mealPreferences.includeCoffee}
  * Lunch: ${preferences.mealPreferences.includeLunch}
  * Dinner: ${preferences.mealPreferences.includeDinner}` : ''}

VENUE NAMES — NON-NEGOTIABLE:
Every activity MUST use a specific, real, named venue. Generic names are completely unacceptable.
- CORRECT: "Bray Lake Watersports", "The Hinds Head", "Waddesdon Manor", "The Crooked Billet"
- WRONG: "Local Water Sports", "Local Pub", "Local Restaurant", "Nearby Attraction"
If you cannot name a specific real venue for a category, drop that category and suggest a different one where you can name a real place.

CRITICAL — THE "location" FIELD:
The "location" field is used as a Google Maps search query. It MUST contain ONLY the venue name and town.
- CORRECT: "Bray Lake Watersports, Bray" or "The Hinds Head, Bray"
- WRONG: "37 Goswell Hill, Windsor, SL4 1AB" or any street address or postcode
Never put a street address in the "location" field. Street addresses go in the "address" field only.

DISTANCE VARIETY — USE THE TRAVEL RADIUS:
The user has selected a travel radius of ${preferences.travelRadius || 30} miles. Spread activities across this range:
- Some activities should be local (under 20 mins from start location)
- Some should be mid-range (30-60 mins away)
- At least one should be near the outer limit of the selected radius
Do NOT cluster all activities at or near the starting postcode.

NO REPEATED ACTIVITY TYPES:
Each activity must be a different category. Only one restaurant, only one café, only one museum, etc.
Do not suggest two meals of the same type in one plan.

TIME ALLOCATIONS — ENFORCE STRICTLY:
- Breakfast: 30-45 minutes maximum
- Coffee stop: 20-30 minutes maximum
- Lunch: 60-90 minutes maximum (do NOT allocate 3-4 hours to lunch)
- Dinner: 60-90 minutes maximum
- Museum or gallery: 90-150 minutes
- Outdoor activity: appropriate to the specific activity
- Travel between locations: MUST be included as separate travel events with realistic durations

LOCAL KNOWLEDGE:
Suggest where locals actually go, not tourist traps. Avoid chains (Starbucks, Wetherspoons, McDonald's, Costa, TGI Fridays, Nando's). Prefer independent venues rated 4.2-4.6 on Google Maps. Favour places mentioned in "hidden gem" or "locals recommend" articles found in your web search.

ABSOLUTE BANNED PLACEHOLDERS — never use these or anything like them:
"Local Restaurant", "Local Walk", "Local area", "City Centre", "Local Pub", "Nearby Park", "Local Museum", "Local Attraction", "Local Café", "Local Shop"

CRITICAL JSON INSTRUCTIONS:
1. Return ONLY valid JSON - no text before or after, no markdown
2. Use double quotes for ALL property names and string values
3. Do NOT use any escape characters except for quotes within strings
4. Ensure all property names are properly quoted

Generate a JSON response with this EXACT structure:
{
  "title": "Engaging day plan title",
  "events": [
    {
      "type": "activity",
      "data": {
        "id": "unique_id_1",
        "name": "Exact venue name as it appears on Google Maps",
        "description": "Detailed description of what to do and why it is worth visiting",
        "location": "Venue Name, Town",
        "startTime": "09:30",
        "endTime": "11:00",
        "duration": 90,
        "cost": 15.50,
        "activityType": ["outdoor", "culture"],
        "address": "Full street address if known",
        "ratings": 4.5,
        "imageUrl": null,
        "bookingRequired": false,
        "bookingLink": null,
        "bookingAdvice": null,
        "ticketProvider": null
      }
    },
    {
      "type": "travel",
      "data": {
        "id": "travel_id_1",
        "startLocation": "Previous venue name",
        "endLocation": "Next venue name",
        "startTime": "11:00",
        "endTime": "11:20",
        "duration": 20,
        "mode": "driving",
        "cost": 0,
        "distance": 8.5,
        "bookingRequired": false,
        "bookingLink": null,
        "bookingAdvice": null
      }
    }
  ],
  "totalCost": 50.75,
  "totalDuration": 480
}

FINAL CHECKLIST before returning JSON:
- Every activity has a real, named venue (not a placeholder)
- Every "location" field is "Venue Name, Town" format — no street addresses
- Activities are spread across the travel radius, not all clustered locally
- No two activities are the same category
- Meal durations are 90 minutes or less
- Travel events exist between every pair of activities
- imageUrl is null on every activity
- All times use "HH:MM" format
- All numbers are simple integers or decimals, not arrays
- Return ONLY the JSON object, no additional text`;
    const itineraryData = await generateItineraryWithRetry(model, prompt);
    const dayPlan = {
      date,
      ...itineraryData,
      preferences,
      revealProgress: surpriseMode ? 20 : 100
    };
    console.log('Successfully generated itinerary');
    return new Response(JSON.stringify(dayPlan), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    // Return more detailed error information
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
