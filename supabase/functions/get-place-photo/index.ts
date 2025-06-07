import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlacePhotoRequest {
  photoReference: string;
  maxWidth?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { photoReference, maxWidth = 400 }: PlacePhotoRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_API_KEY environment variable is not set')
      throw new Error('Google Maps API key is not configured')
    }

    console.log('Google Maps API key found, generating photo URL...')

    // Generate the photo URL using Google Places Photo API
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`

    console.log('Successfully generated photo URL')

    return new Response(
      JSON.stringify({ photoUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error getting place photo:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get place photo',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
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