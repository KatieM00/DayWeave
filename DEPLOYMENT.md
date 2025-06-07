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
```

## Step 2: Database Migration

The database schema will be automatically applied when you deploy the edge functions. The migrations are in `supabase/migrations/`.

## Step 3: API Keys Setup

### Get Your API Keys

1. **Google AI (Gemini)**: https://makersuite.google.com/app/apikey
2. **OpenWeatherMap**: https://openweathermap.org/api (free tier available)
3. **Google Maps/Places**: https://console.cloud.google.com
   - Enable: Maps JavaScript API, Places API, Geocoding API

### Secure API Key Storage

**⚠️ CRITICAL: Never put API keys in .env files or client-side code!**

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
supabase secrets set GOOGLE_API_KEY=your_google_maps_key_here
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

**🔒 Security Note**: Only add the VITE_ variables to Netlify. API keys should only exist in Supabase secrets.

## Step 7: Verification

After deployment, test these features:

1. **User Authentication**: Sign up/sign in should work
2. **Itinerary Generation**: Both surprise and detailed planning
3. **Weather Data**: Should show real weather forecasts
4. **Place Search**: Should find real venues and restaurants
5. **Plan Saving**: Save and retrieve plans from database

## Troubleshooting

### Common Issues

1. **"Failed to generate itinerary"**
   - Check that `GOOGLE_AI_API_KEY` is set in Supabase secrets
   - Verify the edge function deployed successfully
   - Check function logs in Supabase dashboard

2. **"Weather forecast failed"**
   - Verify `OPENWEATHER_API_KEY` is set correctly
   - Check your OpenWeatherMap API quota

3. **"Failed to search places"**
   - Ensure `GOOGLE_API_KEY` is set in Supabase secrets
   - Verify Google Places API is enabled in Google Cloud Console
   - Check API quotas and billing

4. **Database connection issues**
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

- ✅ API keys stored only in Supabase secrets
- ✅ No sensitive data in .env files
- ✅ No API keys in client-side code
- ✅ CORS properly configured on edge functions
- ✅ RLS enabled on all database tables
- ✅ Only public Supabase credentials in frontend

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase function logs
3. Verify all API keys are valid and have proper quotas
4. Ensure all required APIs are enabled in Google Cloud Console

The application should now be fully functional with real API connections!