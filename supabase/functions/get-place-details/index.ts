import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlaceDetailsRequest {
  placeId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { placeId }: PlaceDetailsRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_API_KEY environment variable is not set')
      throw new Error('Google Maps API key is not configured')
    }

    console.log('Google Maps API key found, getting place details...')

    // Get place details from Google Places API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,photos,opening_hours,price_level,website,formatted_phone_number,geometry&key=${apiKey}`
    
    const response = await fetch(detailsUrl)
    
    if (!response.ok) {
      throw new Error('Place details request failed')
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Places API error: ${data.status}`)
    }

    const place = data.result

    // Transform the result to match our interface
    const placeDetails = {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      photos: place.photos?.map((photo: any) => ({ photo_reference: photo.photo_reference })) || [],
      opening_hours: {
        open_now: place.opening_hours?.open_now || false,
        weekday_text: place.opening_hours?.weekday_text || []
      },
      price_level: place.price_level || 0,
      website: place.website || '',
      formatted_phone_number: place.formatted_phone_number || '',
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        }
      }
    }

    console.log('Successfully retrieved place details')

    return new Response(
      JSON.stringify(placeDetails),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error getting place details:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get place details',
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