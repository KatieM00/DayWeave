import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DayPlan, UserPreferences, Activity } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY!);

export interface LLMItineraryRequest {
  location: string;
  date: string;
  preferences: UserPreferences;
  surpriseMode: boolean;
}

const buildPrompt = (request: LLMItineraryRequest): string => {
  const { location, date, preferences, surpriseMode } = request;
  
  return `You are an expert local travel guide creating a day itinerary for ${location} on ${date}.

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
        "imageUrl": "realistic_image_url"
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
  "totalDuration": total_minutes,
  "weatherForecast": {
    "condition": "weather_description",
    "temperature": celsius_number,
    "precipitation": percentage
  }
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
- Return ONLY valid JSON, no additional text`;
};

export const generateItinerary = async (request: LLMItineraryRequest): Promise<DayPlan> => {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = buildPrompt(request);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Add better JSON parsing with error handling
    let itineraryData;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      itineraryData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from AI');
    }
    
    return {
      id: crypto.randomUUID(),
      date: request.date,
      ...itineraryData,
      preferences: request.preferences,
      revealProgress: request.surpriseMode ? 20 : 100
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate itinerary');
  }
};

export const generateActivitySuggestions = async (
  location: string, 
  preferences: UserPreferences
): Promise<Activity[]> => {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
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
    "imageUrl": "realistic_image_url"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate activity suggestions');
  }
};