# DayWeave - AI-Powered Day Planner

A beautiful, production-ready day planning application that creates personalized itineraries using AI and real-time data.

## Features

- **AI-Powered Planning**: Uses Google's Gemini AI to generate intelligent, personalized day plans
- **Real Weather Data**: Integrates OpenWeatherMap for accurate weather forecasts
- **Google Places Integration**: Finds real venues, restaurants, and attractions with photos and details
- **Location Autocomplete**: Smart location suggestions powered by Google Maps
- **Surprise Mode**: Creates mystery itineraries that reveal activities step-by-step
- **User Authentication**: Secure sign-up/sign-in with Supabase Auth
- **Plan Management**: Save, edit, and organize your day plans
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Google Gemini AI
- **APIs**: OpenWeatherMap, Google Maps/Places
- **Deployment**: Netlify

## 🔒 Security Architecture

This application follows security best practices:

- **API Keys**: All sensitive API keys (Google AI, OpenWeather, server-side Google Maps) are stored as Supabase Edge Function secrets, never exposed to the client
- **Server-Side Processing**: All API calls to external services happen through Supabase Edge Functions
- **Client-Side Safety**: Only Supabase URL, anonymous key, and client-side Google Maps key are exposed to the browser
- **No Environment Variables**: No sensitive credentials in `.env` files or client-side code

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI API key
- OpenWeatherMap API key
- Google Maps API keys (2 required - see below)

### 1. Client Configuration

Create a `.env` file with the client-side configuration:

```env
VITE_SUPABASE_DATABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_client_side_google_maps_api_key
```

**⚠️ IMPORTANT**: You need TWO Google Maps API keys:
- `VITE_GOOGLE_MAPS_API_KEY`: For client-side location autocomplete (goes in `.env`)
- `GOOGLE_API_KEY`: For server-side geocoding and places search (Supabase secret only)

### 2. Google Maps API Setup

#### Client-side API Key (VITE_GOOGLE_MAPS_API_KEY)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new API key or use existing
3. **CRITICAL**: Configure HTTP referrer restrictions properly:
   - Navigate to APIs & Services → Credentials
   - Select your API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add these referrers:
     - `localhost:*` (for local development)
     - `127.0.0.1:*` (for local development)
     - `*.webcontainer-api.io/*` (for WebContainer environments like StackBlitz)
     - `*.netlify.app/*` (for Netlify deployment)
     - `yourdomain.com/*` (replace with your actual domain)
     - `*.yourdomain.com/*` (for subdomains)
4. Enable these APIs:
   - Maps JavaScript API
   - Places API

**🚨 Fixing RefererNotAllowedMapError**: 
If you encounter this error, the solution is simple:
1. Copy the URL from the error message
2. Go to Google Cloud Console → APIs & Services → Credentials
3. Select your `VITE_GOOGLE_MAPS_API_KEY`
4. Add the URL to the HTTP referrers list with `/*` at the end
5. Save the changes

#### Server-side API Key (GOOGLE_API_KEY)
1. Create a separate API key in Google Cloud Console
2. Restrict it to server applications (no HTTP referrer restrictions)
3. Enable these APIs:
   - Geocoding API
   - Places API

### 3. Secure API Key Configuration

Configure your server-side API keys as Supabase Edge Function secrets:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Set your API keys as secrets (server-side only)
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key
supabase secrets set OPENWEATHER_API_KEY=your_openweather_key
supabase secrets set GOOGLE_API_KEY=your_server_side_google_maps_key
```

### 4. Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

The database migrations are included in the `supabase/migrations` folder and will be applied automatically when you set up your Supabase project.

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add these environment variables in Netlify dashboard:
   - `VITE_SUPABASE_DATABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`

**🔒 Security Note**: Only add the VITE_ variables to Netlify. Server-side API keys should only exist as Supabase Edge Function secrets.

### Supabase Edge Functions

Deploy the edge functions to your Supabase project:

```bash
# Deploy all functions
supabase functions deploy generate-itinerary
supabase functions deploy get-weather
supabase functions deploy search-places
supabase functions deploy generate-activity-suggestions
supabase functions deploy get-place-details
supabase functions deploy get-place-photo
```

## Key Features Explained

### Location Autocomplete
- Powered by Google Maps Places API
- Provides real-time location suggestions as you type
- Ensures accurate geocoding for better venue recommendations
- Fallback to manual entry if API unavailable

### Google Maps Integration
- Real venue photos from Google Places
- Accurate ratings and reviews
- Opening hours and contact information
- Direct links to Google Maps for directions
- Price level indicators

### AI-Powered Itineraries
- Uses Google Gemini AI for intelligent planning
- Considers real venue names and locations
- Factors in travel times and transportation modes
- Adapts to budget and activity preferences

## Security Best Practices Implemented

1. **API Key Separation**: Client-side and server-side keys are separate
2. **Edge Function Secrets**: Sensitive API keys stored securely in Supabase
3. **CORS Protection**: Proper CORS headers on all edge functions
4. **Domain Restrictions**: Client-side API keys restricted to specific domains
5. **No Credential Leakage**: No sensitive data in repository or client code

## API Documentation

### Edge Functions

- `generate-itinerary`: Creates AI-powered day plans with real venues
- `get-weather`: Fetches weather forecasts from OpenWeatherMap
- `search-places`: Searches for venues using Google Places API
- `get-place-details`: Gets detailed venue information
- `get-place-photo`: Retrieves venue photos from Google Places
- `generate-activity-suggestions`: AI-generated activity recommendations

All edge functions are automatically secured and handle CORS properly.

## Troubleshooting

### Common Issues

1. **RefererNotAllowedMapError (Google Maps API)**
   - **Cause**: Your current URL is not authorized to use the Google Maps API key
   - **Quick Fix**: 
     1. Copy the URL from the error message in your browser console
     2. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
     3. Select your `VITE_GOOGLE_MAPS_API_KEY`
     4. Under "Application restrictions", add the URL with `/*` at the end
     5. Save changes and refresh your page
   - **Prevention**: Add common development URLs like `localhost:*`, `*.webcontainer-api.io/*`

2. **Location autocomplete not working**
   - Check that `VITE_GOOGLE_MAPS_API_KEY` is set correctly
   - Verify Maps JavaScript API and Places API are enabled
   - Ensure API key is not restricted to wrong domains
   - Check browser console for specific error messages

3. **"Location not found" errors**
   - Make sure users select from autocomplete suggestions
   - Verify server-side `GOOGLE_API_KEY` is set in Supabase secrets
   - Check Google Cloud Console for API quotas

4. **Venue photos not loading**
   - Verify `GOOGLE_API_KEY` is configured in Supabase secrets
   - Check Places API is enabled and has quota
   - Some venues may not have photos available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.