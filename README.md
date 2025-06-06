# DayWeave - AI-Powered Day Planner

A beautiful, production-ready day planning application that creates personalized itineraries using AI and real-time data.

## Features

- **AI-Powered Planning**: Uses Google's Gemini AI to generate intelligent, personalized day plans
- **Real Weather Data**: Integrates OpenWeatherMap for accurate weather forecasts
- **Google Places Integration**: Finds real venues, restaurants, and attractions
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

## Security

All API keys are securely stored and accessed through Supabase Edge Functions, ensuring no sensitive credentials are exposed to the client.

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI API key
- OpenWeatherMap API key
- Google Maps API key

### Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase project details:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### API Key Configuration

Configure your API keys as Supabase secrets (not in environment files):

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Set your API keys as secrets
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key
supabase secrets set OPENWEATHER_API_KEY=your_openweather_key
supabase secrets set GOOGLE_API_KEY=your_google_maps_key
```

### Installation

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
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Supabase Edge Functions

Deploy the edge functions to your Supabase project:

```bash
# Deploy all functions
supabase functions deploy generate-itinerary
supabase functions deploy get-weather
supabase functions deploy search-places
supabase functions deploy generate-activity-suggestions
```

## API Documentation

### Edge Functions

- `generate-itinerary`: Creates AI-powered day plans
- `get-weather`: Fetches weather forecasts
- `search-places`: Searches for venues using Google Places
- `generate-activity-suggestions`: AI-generated activity recommendations

All edge functions are automatically secured and handle CORS properly.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.