# DayWeave Deployment Guide

This guide will help you deploy DayWeave with all API connections working properly.

## Prerequisites

You'll need accounts and API keys for:
- [Supabase](https://supabase.com) (Database & Edge Functions)
- [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini AI)
- [OpenWeatherMap](https://openweathermap.org/api) (Weather data)
- [Google Cloud Console](https://console.cloud.google.com) (Maps & Places API)
- [Netlify](https://netlify.com) (Frontend hosting)

## Step 1: Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API and copy:
   - Project URL (for `VITE_SUPABASE_DATABASE_URL`)
   - Anon/Public key (for `VITE_SUPABASE_ANON_KEY`)

3. Update your `.env` file:
```env
VITE_SUPABASE_DATABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Step 2: Database Migration

The database schema will be automatically applied when you deploy the edge functions. The migrations are in `supabase/migrations/`.

## Step 3: API Keys Setup

### Get Your API Keys

1. **Google AI (Gemini)**: https://makersuite.google.com/app/apikey
2. **OpenWeatherMap**: https://openweathermap.org/api (free tier available)
3. **Google Maps/Places**: https://console.cloud.google.com
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - **Important**: You need TWO Google API keys:
     - One for client-side autocomplete (goes in `.env` as `VITE_GOOGLE_MAPS_API_KEY`)
     - One for server-side geocoding (stored as Supabase secret `GOOGLE_API_KEY`)

### Google Maps API Configuration

For the **client-side API key** (`VITE_GOOGLE_MAPS_API_KEY`):
1. In Google Cloud Console, create a new API key or use existing
2. **CRITICAL**: Configure HTTP referrer restrictions properly:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Select your API key for `VITE_GOOGLE_MAPS_API_KEY`
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add these referrers:
     - `localhost:*` (for local development)
     - `127.0.0.1:*` (for local development)
     - `*.webcontainer-api.io/*` (for WebContainer environments)
     - `*.netlify.app/*` (for Netlify deployment)
     - `yourdomain.com/*` (replace with your actual domain)
     - `*.yourdomain.com/*` (for subdomains)
3. **CRITICAL**: Enable these APIs for the client-side key:
   - Maps JavaScript API
   - Places API
   - **Geocoding API** (required for current location features)

**🚨 RefererNotAllowedMapError Fix**: If you see this error, you need to add your current URL to the allowed referrers list. The error message will show the exact URL that needs to be authorized.

**🚨 Geocoding Service Error Fix**: If you see "This API key is not authorized to use this service", you need to enable the Geocoding API for your client-side API key in Google Cloud Console.

For the **server-side API key** (`GOOGLE_API_KEY`):
1. Create a separate API key in Google Cloud Console
2. Restrict it to server applications (no HTTP referrer restrictions)
3. Enable these APIs:
   - Geocoding API
   - Places API

### Secure API Key Storage

**⚠️ CRITICAL: Server-side API keys must never be in .env files or client-side code!**

Install Supabase CLI and configure secrets:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your Supabase account
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref your-project-ref

# Set API keys as secure secrets (server-side only)
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key_here
supabase secrets set OPENWEATHER_API_KEY=your_openweather_key_here
supabase secrets set GOOGLE_API_KEY=your_server_side_google_maps_key_here
```

## Step 4: Deploy Edge Functions

Deploy all the edge functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy generate-itinerary
supabase functions deploy get-weather
supabase functions deploy search-places
supabase functions deploy generate-activity-suggestions
supabase functions deploy get-place-details
supabase functions deploy get-place-photo

# Verify deployment
supabase functions list
```

## Step 5: Test Edge Functions

Test that your functions are working:

```bash
# Test itinerary generation
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-itinerary' \
  -H 'Authorization: Bearer your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "location": "London",
    "date": "2025-01-15",
    "preferences": {
      "startLocation": "London",
      "groupSize": 2,
      "budgetRange": "moderate"
    },
    "surpriseMode": false
  }'
```

## Step 6: Frontend Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_DATABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_GOOGLE_MAPS_API_KEY`: Your client-side Google Maps API key

**🔒 Security Note**: Only add the VITE_ variables to Netlify. Server-side API keys should only exist in Supabase secrets.

## Step 7: Verification

After deployment, test these features:

1. **User Authentication**: Sign up/sign in should work
2. **Location Autocomplete**: Should suggest real places as you type
3. **Current Location**: Should detect user's current location (requires Geocoding API)
4. **Itinerary Generation**: Both surprise and detailed planning
5. **Weather Data**: Should show real weather forecasts
6. **Place Search**: Should find real venues and restaurants
7. **Plan Saving**: Save and retrieve plans from database

## Troubleshooting

### Common Issues

1. **"RefererNotAllowedMapError" - Google Maps API Error**
   - **Cause**: Your current URL is not authorized to use the Google Maps API key
   - **Solution**: 
     1. Go to [Google Cloud Console](https://console.cloud.google.com)
     2. Navigate to APIs & Services → Credentials
     3. Select your `VITE_GOOGLE_MAPS_API_KEY` API key
     4. Under "Application restrictions", select "HTTP referrers (web sites)"
     5. Add the URL from the error message to the allowed referrers list
     6. Include a wildcard `*` at the end (e.g., `https://your-url.com/*`)
     7. For development, also add: `localhost:*`, `127.0.0.1:*`, `*.webcontainer-api.io/*`
   - **Note**: The error message will show the exact URL that needs authorization

2. **"Geocoding Service: This API key is not authorized to use this service"**
   - **Cause**: The client-side Google Maps API key doesn't have Geocoding API enabled
   - **Solution**:
     1. Go to [Google Cloud Console](https://console.cloud.google.com)
     2. Navigate to APIs & Services → Credentials
     3. Select your `VITE_GOOGLE_MAPS_API_KEY` API key
     4. Under "API restrictions", ensure "Geocoding API" is enabled
     5. If using "Restrict key", add "Geocoding API" to the list of allowed APIs
     6. Save the changes and wait a few minutes for propagation
   - **Note**: This API is required for current location detection features

3. **"Failed to generate itinerary"**
   - Check that `GOOGLE_AI_API_KEY` is set in Supabase secrets
   - Verify the edge function deployed successfully
   - Check function logs in Supabase dashboard

4. **"Weather forecast failed"**
   - Verify `OPENWEATHER_API_KEY` is set correctly
   - Check your OpenWeatherMap API quota

5. **"Failed to search places" / "Location not found"**
   - Ensure `GOOGLE_API_KEY` is set in Supabase secrets (server-side)
   - Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in environment (client-side)
   - Verify Google Places API and Geocoding API are enabled in Google Cloud Console
   - Check API quotas and billing
   - Make sure users are selecting locations from autocomplete suggestions

6. **Location autocomplete not working**
   - Check that `VITE_GOOGLE_MAPS_API_KEY` is correctly set
   - Verify Maps JavaScript API and Places API are enabled
   - Check browser console for API key errors
   - Ensure API key is not restricted to wrong domains
   - **Most common**: Add your current domain to the API key's HTTP referrer restrictions

7. **Database connection issues**
   - Verify `VITE_SUPABASE_DATABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Check that RLS policies are properly configured

### Debug Commands

```bash
# Check edge function logs
supabase functions logs generate-itinerary

# Check secrets are set
supabase secrets list

# Test database connection
supabase db ping
```

## Security Checklist

- ✅ Server-side API keys stored only in Supabase secrets
- ✅ Client-side API keys properly restricted by domain
- ✅ No sensitive data in .env files
- ✅ No server-side API keys in client-side code
- ✅ CORS properly configured on edge functions
- ✅ RLS enabled on all database tables
- ✅ Only public Supabase credentials in frontend

## API Key Summary

**Client-side (in .env file):**
- `VITE_SUPABASE_DATABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for autocomplete and geocoding

**Server-side (Supabase secrets only):**
- `GOOGLE_AI_API_KEY`: Google AI/Gemini API key
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key
- `GOOGLE_API_KEY`: Google Maps API key for geocoding/places

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase function logs
3. Verify all API keys are valid and have proper quotas
4. Ensure all required APIs are enabled in Google Cloud Console
5. Test location autocomplete by typing in location fields
6. **For RefererNotAllowedMapError**: Add your current URL to the Google Maps API key restrictions
7. **For Geocoding Service errors**: Enable Geocoding API for your client-side API key

The application should now be fully functional with real API connections and proper location validation!