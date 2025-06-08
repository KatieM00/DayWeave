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

#### Step 1: Create Client-side API Key (VITE_GOOGLE_MAPS_API_KEY)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create a new API key:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the key for your `.env` file
5. **CRITICAL**: Configure HTTP referrer restrictions:
   - Click on your newly created API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add these referrers:
     - `localhost:*` (for local development)
     - `127.0.0.1:*` (for local development)
     - `*.webcontainer-api.io/*` (for WebContainer environments like StackBlitz)
     - `*.netlify.app/*` (for Netlify deployment)
     - `yourdomain.com/*` (replace with your actual domain)
     - `*.yourdomain.com/*` (for subdomains)
   - Save the changes

#### Step 2: Create Server-side API Key (GOOGLE_API_KEY)
1. In the same Google Cloud project, create another API key
2. Enable these APIs:
   - **Geocoding API**
   - **Places API**
3. **Important**: Leave this key unrestricted (no HTTP referrer restrictions)
4. This key will be stored as a Supabase secret (never in `.env`)

**🚨 Fixing RefererNotAllowedMapError**: 
If you encounter this error:
1. Copy the URL from the error message in your browser console
2. Go to Google Cloud Console → APIs & Services → Credentials
3. Select your `VITE_GOOGLE_MAPS_API_KEY`
4. Add the URL to the HTTP referrers list with `/*` at the end
5. Save the changes and refresh your page

### 3. Secure API Key Configuration

Configure your server-side API keys as Supabase Edge Function secrets:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref your-project-ref

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

2. **"Google Maps API key not configured"**
   - Check that `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file
   - Ensure the API key is valid and not expired
   - Verify Maps JavaScript API and Places API are enabled in Google Cloud Console

3. **Location autocomplete not working**
   - Verify `VITE_GOOGLE_MAPS_API_KEY` is correctly configured
   - Check browser console for specific error messages
   - Ensure API key is not restricted to wrong domains
   - Make sure Maps JavaScript API and Places API are enabled

4. **"Location not found" errors**
   - Make sure users select from autocomplete suggestions
   - Verify server-side `GOOGLE_API_KEY` is set in Supabase secrets
   - Check Google Cloud Console for API quotas

5. **Venue photos not loading**
   - Verify `GOOGLE_API_KEY` is configured in Supabase secrets
   - Check Places API is enabled and has quota
   - Some venues may not have photos available

## API Key Summary

**Client-side (in .env file):**
- `VITE_SUPABASE_DATABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for autocomplete

**Server-side (Supabase secrets only):**
- `GOOGLE_AI_API_KEY`: Google AI/Gemini API key
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key
- `GOOGLE_API_KEY`: Google Maps API key for geocoding/places

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.