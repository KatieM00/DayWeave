// If running in Deno, ensure your editor supports Deno types (e.g., enable Deno extension in VSCode).
// If running in Node.js, use a Node.js HTTP server instead:
import { createServer } from 'http';

const serve = (handler: (req: Request) => Promise<Response>) => {
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString();
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers as any,
        body: body || undefined,
      });
      const response = await handler(request);
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      const respBody = await response.text();
      res.end(respBody);
    });
  });
  server.listen(8000);
};
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // Initialize Gemini AI with server-side API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const suggestions = JSON.parse(cleanText)

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
    
    // Return fallback suggestions if AI fails
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