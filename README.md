# DayWeave

> **AI-Powered Day Planner - Your perfectly planned day, powered by AI**

Transform 3+ hours of planning into 30 seconds of serendipitous discovery. Built for the World's Largest Hackathon.

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-4A9CB8?style=for-the-badge)](https://dayweave.com)
[![Built with Bolt](https://img.shields.io/badge/⚡-Built%20with%20Bolt-E6D055?style=for-the-badge)](https://bolt.new)

---

## For Judges - Try It Now

**Experience the magic in 2 minutes:**

### Option 1:

1. **Visit**: [dayweave.com](https://dayweave.com)
2. **Click**: "Surprise Me!" (yellow button)
3. **Enter**: Any city worldwide (try "London", "Paris", or "New York")
4. **Follow**: 6-step guided flow
5. **Experience**: AI magic as your mystery day unfolds

### Option 2: Detailed Planning Mode
1. **Visit**: [dayweave.com](https://dayweave.com)
2. **Click**: "Help Me Plan" (blue button)
3. **Enter**: Your preferences and requirements
4. **Review**: Complete itinerary with full visibility
5. **Customize**: Edit and modify your plan as needed

**Demo Account**: `judge@dayweave.com` / `grh-rch-pnd1XDN-rtu`

**Explore the entire platform and have fun! DayWeave is fully functional with real APIs and live data.**

---

## The "Surprise Me!" Differentiator

**Traditional planners overwhelm you with options. DayWeave creates serendipitous discoveries.**

- **Mystery Mode**: Activities hidden until you reveal them
- **30-second results**: Complete itinerary vs hours of research  
- **Hidden gems**: AI finds spots locals love, not tourist traps
- **Real-time fusion**: Weather + Places + AI working together
- **Progressive reveals**: Perfect psychological excitement

---

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   React Client  │    │  Supabase Edge   │    │   External APIs     │
│                 │    │    Functions     │    │                     │
│ • User Interface│◄──►│                  │◄──►│ • Google Gemini AI  │
│ • State Mgmt    │    │ • API Security   │    │ • Google Places     │
│ • Authentication│    │ • Rate Limiting  │    │ • OpenWeather       │
│ • Plan Storage  │    │ • Data Processing│    │ • Google Maps       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
        │                        │                        
        │              ┌──────────────────┐               
        │              │   Supabase DB    │               
        └─────────────►│                  │               
                       │ • User Accounts  │               
                       │ • Saved Plans    │               
                       │ • Preferences    │               
                       └──────────────────┘               

Security: All API keys secured server-side | Client only receives curated results
```

---

## Key Innovation

### Multi-API Orchestration
- **Google Gemini AI** for intelligent curation
- **Google Places API** for real venue data
- **OpenWeather API** for weather-reactive planning
- **Google Maps** for accurate travel times

### Business Model
- **Market**: Global leisure and travel industry
- **Problem**: Decision fatigue from endless options
- **Solution**: AI-powered experience curation
- **Revenue**: Freemium + B2B partnerships

---

## Tech Stack

- **Frontend**: React + TypeScript (Netlify)
- **Backend**: Supabase PostgreSQL + Edge Functions
- **Domain**: dayweave.com (IONOS)
- **APIs**: Secure server-side orchestration

---

## Ready to Weave Your Perfect Day?

**[Start Planning Now →](https://dayweave.com)**

Built with ❤️ using Bolt.new | Deployed on Netlify | Powered by Supabase

---

**© 2025 DayWeave. All Rights Reserved.**
