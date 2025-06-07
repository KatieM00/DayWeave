# API Keys Setup Instructions

The edge functions are failing because the required API keys are not configured as Supabase secrets.

## Required API Keys

You need to obtain the following API keys:

1. **Google AI API Key** (for itinerary generation)
   - Get from: https://makersuite.google.com/app/apikey
   - Used by: `generate-itinerary` function

2. **OpenWeatherMap API Key** (for weather data)
   - Get from: https://openweathermap.org/api
   - Used by: `get-weather` function

3. **Google Maps API Key** (for places search and details)
   - Get from: https://console.cloud.google.com
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Used by: `search-places`, `get-place-details`, `get-place-photo` functions

## Setup Commands

Once you have your API keys, run these commands to configure them:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Set the API keys as secrets
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key_here
supabase secrets set OPENWEATHER_API_KEY=your_openweather_key_here
supabase secrets set GOOGLE_API_KEY=your_google_maps_key_here

# Redeploy the functions to use the new secrets
supabase functions deploy generate-itinerary
supabase functions deploy get-weather
supabase functions deploy search-places
supabase functions deploy get-place-details
supabase functions deploy get-place-photo
```

## Verification

After setting up the secrets, test the functions:

```bash
# Check that secrets are set
supabase secrets list

# Test the functions
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-itinerary' \
  -H 'Authorization: Bearer your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{"location": "London", "date": "2025-01-15", "preferences": {}, "surpriseMode": false}'
```

## Important Notes

- **Never put API keys in .env files or client-side code**
- API keys are stored securely in Supabase and only accessible to edge functions
- You can manage secrets through the Supabase Dashboard under Edge Functions > Secrets
- Free tiers are available for all these APIs to get started

## Troubleshooting

If functions still fail after setting secrets:
1. Verify secrets are set: `supabase secrets list`
2. Check function logs: `supabase functions logs function-name`
3. Ensure APIs are enabled in respective consoles
4. Check API key quotas and billing settings