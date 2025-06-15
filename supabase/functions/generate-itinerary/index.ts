import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.2.1';
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
      model: "gemini-1.5-pro"
    });
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

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no text before or after
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
        "name": "EXACT venue name as it appears on Google Maps",
        "description": "Detailed description",
        "location": "EXACT venue name for Google Maps search",
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
        "endTime": "11:15",
        "duration": 15,
        "mode": "walking",
        "cost": 0,
        "distance": 0.5,
        "bookingRequired": false,
        "bookingLink": null,
        "bookingAdvice": null
      }
    }
  ],
  "totalCost": 50.75,
  "totalDuration": 480
}

REQUIREMENTS:
- Use EXACT venue names as they appear on Google Maps
- Include 4-6 activities with travel between them
- Calculate realistic travel times and costs for ${location}
- Include mix of activities based on user preferences
- For surprise mode: focus on hidden gems and unique experiences
- Ensure activities are typically open on ${date}
- Keep within specified budget range
- Set imageUrl to null always
- Use simple time format like "09:30" not complex arrays
- ALL numbers should be simple integers or decimals, no arrays
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
