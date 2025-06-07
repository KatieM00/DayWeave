const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to clean JSON response
function cleanJsonResponse(text) {
  // Remove any markdown code block markers
  let cleaned = text.replace(/```json\s*|\s*```/g, '');
  
  // Replace smart quotes with regular quotes
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");
  
  // Escape unescaped quotes within string values
  // This regex finds strings and escapes single quotes within them
  cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
    // Escape single quotes within the string content
    const escapedContent = content.replace(/'/g, "\\'");
    return `"${escapedContent}"`;
  });
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Validate and sanitize the parsed plan
function validatePlan(plan) {
  if (!plan || !plan.plan) {
    throw new Error('Invalid plan structure');
  }

  const sanitizedPlan = {
    plan: {},
    total_cost: plan.total_cost || 0,
    total_duration_hours: plan.total_duration_hours || 0,
    special_notes: plan.special_notes || ''
  };

  // Process each time period
  ['morning', 'afternoon', 'evening'].forEach(period => {
    if (plan.plan[period] && Array.isArray(plan.plan[period])) {
      sanitizedPlan.plan[period] = plan.plan[period].map(activity => ({
        name: activity.name || 'Unknown Activity',
        location: activity.location || '',
        postcode: activity.postcode || '',
        description: activity.description || '',
        duration_minutes: activity.duration_minutes || 60,
        cost_gbp: activity.cost_gbp || 0,
        category: activity.category || 'general',
        why_special: activity.why_special || ''
      }));
    }
  });

  return sanitizedPlan;
}

exports.handler = async (event, context) => {
  console.log('Generate plan function called');
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { preferences } = JSON.parse(event.body);
    console.log('Preferences received:', preferences);

    if (!preferences) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Preferences are required' })
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Create a detailed day plan for someone in ${preferences.startLocation} with these preferences:
- Group size: ${preferences.groupSize}
- Budget: ${preferences.budgetRange}
- Travel distance: ${preferences.travelDistance?.value} ${preferences.travelDistance?.unit}
- Activity vibes: ${preferences.activityVibe || 'mixed'}

Generate a JSON response with this EXACT structure (no markdown, no extra text):
{
  "plan": {
    "morning": [
      {
        "name": "Activity Name",
        "location": "Full Address",
        "postcode": "Postcode",
        "description": "Brief description",
        "duration_minutes": 90,
        "cost_gbp": 15.50,
        "category": "culture|outdoor|food|shopping|entertainment",
        "why_special": "What makes this special"
      }
    ],
    "afternoon": [
      {
        "name": "Activity Name",
        "location": "Full Address", 
        "postcode": "Postcode",
        "description": "Brief description",
        "duration_minutes": 120,
        "cost_gbp": 25.00,
        "category": "culture|outdoor|food|shopping|entertainment",
        "why_special": "What makes this special"
      }
    ],
    "evening": [
      {
        "name": "Activity Name",
        "location": "Full Address",
        "postcode": "Postcode", 
        "description": "Brief description",
        "duration_minutes": 120,
        "cost_gbp": 35.00,
        "category": "culture|outdoor|food|shopping|entertainment",
        "why_special": "What makes this special"
      }
    ]
  },
  "total_cost": 75.50,
  "total_duration_hours": 5.5,
  "special_notes": "Any special considerations"
}

IMPORTANT: 
- Use only double quotes in JSON
- Do NOT use apostrophes in any text - replace with "of" or rephrase
- Ensure all string values are properly escaped
- Return only valid JSON, no other text`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text);
    
    const cleanedJson = cleanJsonResponse(text);
    console.log('Cleaned JSON:', cleanedJson);

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', text);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and sanitize the plan
    const validatedPlan = validatePlan(parsedPlan);
    console.log('Plan generated successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(validatedPlan)
    };

  } catch (error) {
    console.error('Gemini function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate plan',
        details: error.message 
      })
    };
  }
};