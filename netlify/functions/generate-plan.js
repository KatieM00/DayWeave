const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Improved JSON cleaning function
function cleanJsonResponse(text) {
  // Remove any markdown code block markers
  let cleaned = text.replace(/```json\s*|\s*```/g, '');
  
  // Replace smart quotes with regular quotes
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");
  
  // Fix the main issue: replace single quotes with double quotes in JSON keys/values
  // But be careful not to break contractions inside string values
  
  // First, let's properly escape any actual single quotes in string values
  cleaned = cleaned.replace(/"([^"]*?)"/g, (match, content) => {
    // Replace single quotes inside string content with escaped single quotes
    const escapedContent = content.replace(/'/g, "'"); // Keep single quotes as-is inside strings
    return `"${escapedContent}"`;
  });
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Alternative approach: Use a more robust JSON fixer
function fixJsonString(jsonString) {
  try {
    // First try to parse as-is
    return JSON.parse(jsonString);
  } catch (error) {
    console.log('Initial parse failed, attempting to fix JSON...');
    
    // Remove markdown code blocks
    let fixed = jsonString.replace(/```json\s*|\s*```/g, '');
    
    // Replace smart quotes
    fixed = fixed.replace(/[""]/g, '"');
    fixed = fixed.replace(/['']/g, "'");
    
    // Try parsing again
    try {
      return JSON.parse(fixed);
    } catch (error2) {
      console.log('Second parse failed, trying alternative approach...');
      
      // Last resort: replace problematic characters more aggressively
      fixed = fixed.replace(/'/g, "'"); // Ensure single quotes are not escaped
      
      try {
        return JSON.parse(fixed);
      } catch (error3) {
        console.error('All JSON parsing attempts failed');
        throw new Error('Could not parse AI response as valid JSON');
      }
    }
  }
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

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON (no markdown code blocks)
- Use ONLY double quotes for all strings
- DO NOT use apostrophes or single quotes anywhere
- Replace any contractions (like "it's" with "it is", "don't" with "do not")
- Use "of" instead of possessives (like "Museum of London" instead of "London's Museum")

Generate a JSON response with this EXACT structure:
{
  "plan": {
    "morning": [
      {
        "name": "Activity Name Here",
        "location": "Full Address Here",
        "postcode": "Postcode Here",
        "description": "Brief description without any apostrophes",
        "duration_minutes": 90,
        "cost_gbp": 15.50,
        "category": "culture",
        "why_special": "What makes this special without apostrophes"
      }
    ],
    "afternoon": [
      {
        "name": "Activity Name Here",
        "location": "Full Address Here", 
        "postcode": "Postcode Here",
        "description": "Brief description without any apostrophes",
        "duration_minutes": 120,
        "cost_gbp": 25.00,
        "category": "outdoor",
        "why_special": "What makes this special without apostrophes"
      }
    ],
    "evening": [
      {
        "name": "Activity Name Here",
        "location": "Full Address Here",
        "postcode": "Postcode Here", 
        "description": "Brief description without any apostrophes",
        "duration_minutes": 120,
        "cost_gbp": 35.00,
        "category": "food",
        "why_special": "What makes this special without apostrophes"
      }
    ]
  },
  "total_cost": 75.50,
  "total_duration_hours": 5.5,
  "special_notes": "Any special considerations without apostrophes"
}

Remember: NO apostrophes, NO single quotes, NO markdown - only pure JSON with double quotes!`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text);
    
    // Use the improved JSON fixer
    let parsedPlan;
    try {
      parsedPlan = fixJsonString(text);
      console.log('Successfully parsed JSON');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', text);
      
      // Return a fallback response
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to generate plan',
          details: 'AI response could not be parsed as valid JSON',
          raw_response: text.substring(0, 500) // First 500 chars for debugging
        })
      };
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