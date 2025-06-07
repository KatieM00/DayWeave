import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PlaceSearchRequest {
  query: string;
  location: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, location }: PlaceSearchRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) {
      console.error('GOOGLE_API_KEY environment variable is not set')
      throw new Error('Google Maps API key is not configured')
    }

    console.log('Google Maps API key found, searching places...')

    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
    const geocodeResponse = await fetch(geocodeUrl)
    
    if (!geocodeResponse.ok) {
      throw new Error('Geocoding failed')
    }

    const geocodeData = await geocodeResponse.json()
    if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
      console.log('Location not found, returning empty results')
      return new Response(
        JSON.stringify([]),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const { lat, lng } = geocodeData.results[0].geometry.location

    // Search for places using Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=5000&key=${apiKey}`
    const placesResponse = await fetch(placesUrl)
    
    if (!placesResponse.ok) {
      throw new Error('Places search failed')
    }

    const placesData = await placesResponse.json()
    
    if (placesData.status !== 'OK') {
      throw new Error(`Places API error: ${placesData.status}`)
    }

    // Transform the results to match our interface
    const places = placesData.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      photos: place.photos?.map((photo: any) => ({ photo_reference: photo.photo_reference })) || [],
      opening_hours: {
        open_now: place.opening_hours?.open_now || false,
        weekday_text: []
      },
      price_level: place.price_level || 0,
      website: '',
      formatted_phone_number: '',
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        }
      }
    }))

    console.log('Successfully searched places')

    return new Response(
      JSON.stringify(places),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error searching places:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search places',
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