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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are a UK travel expert. Create a detailed day plan for ${location}, UK.
    
    User preferences: ${JSON.stringify(preferences)}
    ${weather ? `Weather: ${JSON.stringify(weather)}` : ''}
    
    Requirements:
    - Include exact UK postcodes where possible
    - Realistic travel times between locations
    - Pricing in GBP
    - Mix popular attractions with hidden gems
    - Focus on accessibility via UK transport
    
    Return only valid JSON:
    {
      "plan": {
        "morning": [{"name": "", "location": "", "postcode": "", "description": "", "duration_minutes": 0, "cost_gbp": 0, "category": "", "why_special": ""}],
        "afternoon": [{"name": "", "location": "", "postcode": "", "description": "", "duration_minutes": 0, "cost_gbp": 0, "category": "", "why_special": ""}],
        "evening": [{"name": "", "location": "", "postcode": "", "description": "", "duration_minutes": 0, "cost_gbp": 0, "category": "", "why_special": ""}]
      },
      "total_cost": 0,
      "total_duration_hours": 0,
      "special_notes": ""
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const planData = JSON.parse(jsonMatch[0]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(planData)
      };
    } else {
      throw new Error('No valid JSON in AI response');
    }

  } catch (error) {
    console.error('Gemini function error:', error);
    
    // Fallback plan for UK locations
    const { location } = JSON.parse(event.body);
    const fallbackPlan = {
      plan: {
        morning: [{
          name: "Local Coffee & Breakfast",
          location: `${location} city centre`,
          postcode: "",
          description: "Start your day at a highly-rated local café",
          duration_minutes: 60,
          cost_gbp: 8.50,
          category: "food",
          why_special: "Support local business and fuel up for adventures"
        }],
        afternoon: [{
          name: "Historic City Walk",
          location: `${location} historic quarter`,
          postcode: "",
          description: "Self-guided tour of historical landmarks",
          duration_minutes: 120,
          cost_gbp: 0,
          category: "culture",
          why_special: "Free way to discover hidden stories and architecture"
        }],
        evening: [{
          name: "Traditional Pub Experience",
          location: `${location} old town`,
          postcode: "",
          description: "Authentic British pub with local ales and seasonal menu",
          duration_minutes: 90,
          cost_gbp: 22.00,
          category: "food",
          why_special: "Experience genuine local culture and cuisine"
        }]
      },
      total_cost: 30.50,
      total_duration_hours: 5.5,
      special_notes: "This is a fallback plan. Weather and personal preferences may require adjustments."
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackPlan)
    };
  }
};