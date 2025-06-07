// Supabase Edge Function for weather data
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

interface WeatherData {
  condition: string
  temperature: number
  icon: string
  precipitation: number
  windSpeed: number
  humidity: number
  description: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location } = await req.json()
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')

    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key not configured')
      return new Response(
        JSON.stringify({ error: 'Weather service unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Fetching weather for: ${location}`)

    // Get coordinates from location name
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    
    const geocodeResponse = await fetch(geocodeUrl)
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding failed: ${geocodeResponse.status}`)
    }
    
    const geocodeData = await geocodeResponse.json()
    
    if (!geocodeData || geocodeData.length === 0) {
      console.error(`No coordinates found for location: ${location}`)
      return new Response(
        JSON.stringify({ error: 'Location not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { lat, lon } = geocodeData[0]
    console.log(`Coordinates found: ${lat}, ${lon}`)

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    
    const weatherResponse = await fetch(weatherUrl)
    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.status}`)
    }
    
    const weatherData = await weatherResponse.json()
    console.log('Weather data received:', weatherData)

    // Transform the data
    const result: WeatherData = {
      condition: weatherData.weather[0]?.main || 'Unknown',
      temperature: Math.round(weatherData.main?.temp || 0),
      icon: weatherData.weather[0]?.icon || '01d',
      precipitation: Math.round((weatherData.rain?.['1h'] || weatherData.snow?.['1h'] || 0) * 100) / 100,
      windSpeed: Math.round((weatherData.wind?.speed || 0) * 3.6 * 10) / 10, // Convert m/s to km/h
      humidity: weatherData.main?.humidity || 0,
      description: weatherData.weather[0]?.description || 'No description available'
    }

    console.log('Transformed weather data:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Weather function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch weather data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})