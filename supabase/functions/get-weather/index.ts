import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WeatherRequest {
  location: string;
  date: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { location, date }: WeatherRequest = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY environment variable is not set')
      throw new Error('OpenWeather API key is not configured')
    }

    console.log('OpenWeather API key found, fetching weather data...')

    // Get coordinates for the location using a geocoding service
    let lat: number, lon: number

    try {
      // Use OpenWeatherMap's geocoding API
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
      const geocodeResponse = await fetch(geocodeUrl)
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json()
        if (geocodeData.length > 0) {
          lat = geocodeData[0].lat
          lon = geocodeData[0].lon
        } else {
          throw new Error('Location not found')
        }
      } else {
        throw new Error('Geocoding failed')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      // Fallback to London coordinates
      lat = 51.5074
      lon = -0.1278
    }

    // Get weather forecast from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    
    const response = await fetch(weatherUrl)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Find forecast for the specified date
    const targetDate = new Date(date)
    const forecast = data.list.find((item: any) => {
      const forecastDate = new Date(item.dt * 1000)
      return forecastDate.toDateString() === targetDate.toDateString()
    })

    let weatherForecast
    if (forecast) {
      weatherForecast = {
        condition: forecast.weather[0].description,
        temperature: Math.round(forecast.main.temp),
        icon: forecast.weather[0].icon,
        precipitation: forecast.pop ? Math.round(forecast.pop * 100) : 0,
        windSpeed: Math.round(forecast.wind.speed * 3.6) // Convert m/s to km/h
      }
    } else {
      // Return current weather if no forecast for specific date
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      const currentResponse = await fetch(currentWeatherUrl)
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        weatherForecast = {
          condition: currentData.weather[0].description,
          temperature: Math.round(currentData.main.temp),
          icon: currentData.weather[0].icon,
          precipitation: 0,
          windSpeed: Math.round(currentData.wind.speed * 3.6)
        }
      } else {
        weatherForecast = null
      }
    }

    console.log('Successfully fetched weather data')

    return new Response(
      JSON.stringify(weatherForecast),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error fetching weather:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch weather',
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