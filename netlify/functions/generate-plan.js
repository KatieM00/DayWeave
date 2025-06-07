import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://dayweave.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { location, preferences, weather } = JSON.parse(event.body);

    if (!location || !preferences) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // More specific prompt to ensure valid JSON
    const prompt = `Create a day plan for ${location}, UK. You MUST respond with ONLY valid JSON, no other text.

User preferences: Group size ${preferences.groupSize}, Budget ${preferences.budgetRange}, Vibe ${preferences.activityVibe || 'mixed'}

Return this exact JSON structure:
{
  "plan": {
    "morning": [
      {
        "name": "Activity Name",
        "location": "Specific location in ${location}",
        "postcode": "UK postcode if known or empty string",
        "description": "Brief description",
        "duration_minutes": 90,
        "cost_gbp": 10.50,
        "category": "food/culture/outdoor/indoor",
        "why_special": "Why this is recommended"
      }
    ],
    "afternoon": [
      {
        "name": "Activity Name",
        "location": "Specific location in ${location}",
        "postcode": "UK postcode if known or empty string", 
        "description": "Brief description",
        "duration_minutes": 120,
        "cost_gbp": 15.00,
        "category": "food/culture/outdoor/indoor",
        "why_special": "Why this is recommended"
      }
    ],
    "evening": [
      {
        "name": "Activity Name",
        "location": "Specific location in ${location}",
        "postcode": "UK postcode if known or empty string",
        "description": "Brief description", 
        "duration_minutes": 120,
        "cost_gbp": 25.00,
        "category": "food/culture/outdoor/indoor",
        "why_special": "Why this is recommended"
      }
    ]
  },
  "total_cost": 50.50,
  "total_duration_hours": 6.5,
  "special_notes": "Weather or seasonal notes"
}

Remember: ONLY return valid JSON, no markdown, no backticks, no explanation text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response - remove markdown formatting if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    let cleanJson = jsonMatch[0];
    
    // Fix common JSON formatting issues
    cleanJson = cleanJson
      .replace(/'/g, '"')  // Replace single quotes with double quotes
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted property names
    
    console.log('Cleaned JSON:', cleanJson); // Debug log
    
    try {
      const planData = JSON.parse(cleanJson);
      
      // Validate the structure
      if (!planData.plan || !planData.plan.morning || !planData.plan.afternoon || !planData.plan.evening) {
        throw new Error('Invalid plan structure');
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(planData)
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', text);
      throw new Error('Failed to parse AI response as JSON');
    }

  } catch (error) {
    console.error('Gemini function error:', error);
    
    // Enhanced fallback plan
    const parsedBody = JSON.parse(event.body);
    const location = parsedBody.location || 'London';
    const preferences = parsedBody.preferences || {};
    
    const fallbackPlan = {
      plan: {
        morning: [{
          name: "Local Coffee & Breakfast",
          location: `${location} city centre`,
          postcode: "",
          description: "Start your day at a highly-rated local café with fresh pastries and artisan coffee",
          duration_minutes: 60,
          cost_gbp: 8.50,
          category: "food",
          why_special: "Perfect way to fuel up and get a feel for the local morning atmosphere"
        }],
        afternoon: [{
          name: "Historic Walking Discovery",
          location: `${location} historic district`,
          postcode: "",
          description: "Self-guided exploration of historical landmarks and hidden architectural gems",
          duration_minutes: 150,
          cost_gbp: 0,
          category: "culture",
          why_special: "Uncover stories and viewpoints that most tourists miss - completely free"
        }],
        evening: [{
          name: "Traditional Pub Experience",
          location: `${location} old town`,
          postcode: "",
          description: "Authentic British pub with local ales, seasonal menu, and friendly atmosphere",
          duration_minutes: 120,
          cost_gbp: 24.00,
          category: "food",
          why_special: "Experience genuine local culture and meet locals over traditional British fare"
        }]
      },
      total_cost: 32.50,
      total_duration_hours: 5.5,
      special_notes: "This is a reliable backup plan. All activities are weather-flexible and suitable for different group sizes."
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackPlan)
    };
  }
};