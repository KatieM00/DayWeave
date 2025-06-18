# DayWeave ✨

> **AI-Powered Day Planner - Your perfectly planned day, powered by AI**

A beautiful, production-ready day planning application that creates personalized itineraries using AI and real-time data. Built for the World's Largest Hackathon.

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-4A9CB8?style=for-the-badge)](https://dayweave.com)
[![Built with Bolt](https://img.shields.io/badge/⚡-Built%20with%20Bolt-E6D055?style=for-the-badge)](https://bolt.new)

---

## 🏆 **FOR JUDGES - QUICK START**

**Try DayWeave in 2 minutes:**

1. **Visit**: [https://dayweave.com](https://dayweave.com)
2. **Click**: "Surprise Me!" button (yellow)
3. **Enter**: "London" (or any UK city)
4. **Select**: Your preferences in 6 simple steps
5. **Experience**: AI magic as your mystery day unfolds!

**Test Account Access:**
- **Email**: `judge@dayweave.com`
- **Password**: `JudgeTest2025!`
- *(Full credentials will be provided via secure 1Password link upon submission)*

**Alternative**: Click "Try Demo Account" for instant access

---

## 🎯 **The "Surprise Me!" Differentiator**

**What makes DayWeave special:**
- **🎲 Mystery Mode**: Activities are hidden until you "reveal" them
- **⚡ 30-second planning**: AI generates full itineraries instantly
- **🤖 Hidden gem discovery**: AI finds unique spots locals love
- **🔄 Multi-API orchestration**: Weather + Places + AI working together
- **📱 Progressive reveal**: Perfect for spontaneous travelers

**Traditional planners show you everything upfront. DayWeave creates serendipitous discoveries.**

---

## ✨ **Key Features**

### 🧠 **Intelligent AI Planning**
- **Google Gemini AI (1.5 Pro)** for personalized itinerary generation
- **Smart curation** considering weather, distance, budget, and preferences
- **Real venue integration** with Google Places for authentic recommendations
- **Dynamic scheduling** with optimal travel times

### 🎲 **Dual Planning Modes**
- **"Surprise Me!"**: Mystery adventure mode with progressive activity reveals
- **"Help Me Plan"**: Traditional detailed planning with full visibility
- **Seamless switching** between modes during your journey

### 🌤️ **Real-Time Data Integration**
- **OpenWeatherMap** for accurate weather forecasts
- **Google Places** with real photos, ratings, and opening hours
- **Live location search** with autocomplete powered by Google Maps
- **Current pricing** and availability information

### 👤 **User Experience & Management**
- **Supabase Authentication** with secure sign-up/sign-in
- **Save & organize** unlimited day plans
- **Edit and modify** existing itineraries
- **Share plans** with friends and family
- **Responsive design** optimized for all devices

---

## 🎨 **Brand Identity**

- **Logo**: Interwoven lines representing the "weaving" of your perfect day
- **Colors**: Sky blues (#4A9CB8, #3F7A9A), accent yellow (#E6D055), navy (#2E5A6B)
- **Tagline**: "Your perfectly planned day"
- **Market**: £47 billion UK leisure industry

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for consistent, responsive design
- **Vite** for fast development and optimized builds
- **React Router** for seamless navigation

### **Backend & Database**
- **Supabase** (PostgreSQL) for data storage and real-time features
- **Supabase Auth** for secure user authentication
- **Supabase Edge Functions** for server-side API processing

### **AI & APIs**
- **Google Gemini AI (2.0 Flash)** for intelligent itinerary generation
- **OpenWeatherMap API** for real-time weather data
- **Google Maps/Places API** for location services and venue data
- **Google Geocoding API** for precise location positioning

### **Deployment**
- **Netlify** for frontend hosting and continuous deployment
- **Custom domain** via Ionis: [dayweave.com](https://dayweave.com)
- **Edge Functions** deployed to Supabase global infrastructure

---

## 🔒 **Security Architecture**

**Enterprise-grade security practices:**

- **🔐 API Key Protection**: All sensitive keys stored as Supabase Edge Function secrets
- **⚡ Server-Side Processing**: External API calls happen through secure edge functions
- **✅ Client-Side Safety**: Only public-safe keys exposed to browsers
- **🚫 Zero Environment Exposure**: No sensitive credentials in `.env` files
- **🛡️ Supabase RLS**: Row-level security for data protection

**Architecture Pattern:**
```
Client → Supabase Edge Function → External APIs
```

---

## 🚀 **Complete Setup Guide**

### **Prerequisites**

- Node.js 18+
- Supabase account
- Google AI API key (Gemini)
- OpenWeatherMap API key
- Google Maps API keys (client + server)

### **1. Environment Configuration**

Create `.env` file with client-side configuration:

```env
VITE_SUPABASE_DATABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_client_side_google_maps_api_key
```

### **2. Google Maps API Setup**

**⚠️ IMPORTANT**: You need TWO separate Google Maps API keys:

#### **Client-Side Key** (`VITE_GOOGLE_MAPS_API_KEY`)
1. Enable APIs: **Maps JavaScript API**, **Places API**, **Geocoding API**
2. Configure HTTP referrer restrictions:
   - `localhost:*`
   - `127.0.0.1:*`
   - `*.webcontainer-api.io/*` (for WebContainer environments)
   - `*.netlify.app/*`
   - `dayweave.com/*`
   - `*.dayweave.com/*`

#### **Server-Side Key** (`GOOGLE_API_KEY`)
1. Enable APIs: **Geocoding API**, **Places API**
2. **No HTTP restrictions** (for server-side use)
3. Store as Supabase secret only

### **3. Secure API Configuration**

Configure server-side keys as Supabase Edge Function secrets:

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Set API secrets (server-side only)
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key
supabase secrets set OPENWEATHER_API_KEY=your_openweather_key
supabase secrets set GOOGLE_API_KEY=your_server_side_google_maps_key
```

### **4. Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **5. Deployment**

#### **Netlify Deployment**
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables (Netlify dashboard):
   - `VITE_SUPABASE_DATABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`

#### **Deploy Supabase Edge Functions**
```bash
supabase functions deploy generate-itinerary
supabase functions deploy get-weather
supabase functions deploy search-places
supabase functions deploy generate-activity-suggestions
supabase functions deploy get-place-details
supabase functions deploy get-place-photo
supabase functions deploy share-plan
```

---

## 📱 **User Journey Walkthrough**

### **Step 1: Choose Your Adventure**
- **Home Page**: Choose between "Surprise Me!" or "Help Me Plan"
- **Clear value proposition**: Instant planning vs manual research

### **Step 2: "Surprise Me!" Flow (6 Steps)**
1. **Location**: Enter starting point with Google autocomplete
2. **Group Size**: Solo, Duo, or Group planning
3. **Transport & Duration**: Select preferences and time allocation
4. **Budget**: Free, Budget (£5-50), Moderate (£25-150), Premium (£150+)
5. **Vibe Selection**: Relaxing, Adventurous, Cultural, Active, Romantic, etc.
6. **Experience Mode**: Surprise vs Standard viewing

### **Step 3: AI Magic Happens**
- **Real-time processing**: Weather + Location + AI working together
- **30-second generation**: Complete itinerary with travel times
- **Smart scheduling**: Optimized for distance and opening hours

### **Step 4: Progressive Discovery**
- **Mystery reveals**: Each activity unveiled step-by-step
- **Rich details**: Photos, ratings, booking links, directions
- **Flexible modification**: Edit times, skip activities, add stops

### **Step 5: Save & Share**
- **Account creation**: Secure signup with email verification
- **Plan management**: Save, organize, and revisit itineraries
- **Social sharing**: Send plans to friends and family

---

## 🔧 **Troubleshooting**

### **Common Issues & Quick Fixes**

**🚨 RefererNotAllowedMapError**
- **Fix**: Add your current URL to Google Cloud Console → API restrictions
- **Add**: `yourdomain.com/*` to HTTP referrer list

**🚨 Geocoding Service Error**
- **Fix**: Enable Geocoding API for your client-side key
- **Wait**: 2-5 minutes for API propagation

**🚨 Location Autocomplete Issues**
- **Check**: `VITE_GOOGLE_MAPS_API_KEY` in `.env`
- **Verify**: API key validity and enabled services

---

## 🎯 **Challenge Submissions**

### **Deploy Challenge** ✅ **QUALIFIED - $25,000**
- **Netlify Team**: `katiem00`
- **Live URL**: [dayweave.com](https://dayweave.com)
- **Performance**: Optimized builds with Vite

### **Custom Domain Challenge** ✅ **QUALIFIED - $25,000**
- **Domain**: `dayweave.com` (via Ionis)
- **Creative naming**: Reflects the "weaving" of perfect days
- **Professional branding**: Custom logo and cohesive design

### **Startup Challenge** ✅ **QUALIFIED - $25,000**
- **Supabase Org**: `hseznwzstxfmoahfrnba`
- **Scalable architecture**: Edge functions + PostgreSQL
- **Business model**: Freemium with premium features
- **Market opportunity**: £47B UK leisure industry

---

## 🔑 **API Key Reference**

### **Client-Side (in .env)**
```env
VITE_SUPABASE_DATABASE_URL=  # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anonymous key  
VITE_GOOGLE_MAPS_API_KEY=    # Google Maps (client-side)
```

### **Server-Side (Supabase Secrets)**
```bash
GOOGLE_AI_API_KEY=           # Google Gemini AI
OPENWEATHER_API_KEY=         # Weather data
GOOGLE_API_KEY=              # Google Maps (server-side)
```

---

## 💡 **Innovation Highlights**

### **Technical Innovation**
- **Multi-API orchestration**: Seamless integration of 4+ external services
- **Edge function architecture**: Scalable serverless backend
- **Progressive Web App**: Fast, responsive, app-like experience
- **Real-time data fusion**: Weather + location + AI in perfect harmony

### **User Experience Innovation**
- **Serendipity engine**: AI discovers hidden gems vs. obvious tourist spots
- **Mystery planning**: Psychological excitement of progressive reveals
- **Contextual intelligence**: Plans adapt to weather, budget, and preferences
- **Instant gratification**: 30-second results vs. hours of research

### **Business Model Innovation**
- **Experience curation**: Not just booking, but intelligent discovery
- **Local-first approach**: Supporting independent venues alongside popular spots
- **Community-driven**: User feedback improves AI recommendations
- **Scalable growth**: UK foundation for global expansion

---

## 🚀 **Future Roadmap**

### **Phase 1: UK Expansion** (Next 3 months)
- Major UK cities coverage 
- Public transport integration
- Weather-reactive planning
- User review system

### **Phase 2: Feature Enhancement** (3-6 months)
- Voice AI integration (ElevenLabs)
- Multi-day trip planning
- Group collaboration features
- Accessibility improvements

### **Phase 3: International** (6-12 months)
- European city expansion
- Currency and language localization
- Cultural preference adaptation
- Partnership with local tourism boards

---

## 📊 **Market Opportunity**

- **UK Leisure Market**: £47 billion annually
- **Target Demographic**: Anyone who wants to adventure!
- **Problem Solved**: Decision fatigue from overwhelming options
- **Competitive Advantage**: AI-powered serendipity vs. manual searching

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 **Contact & Support**

- **Live Demo**: [dayweave.com](https://dayweave.com)
- **Business Inquiries**: [hello@dayweave.com](mailto:hello@dayweave.com)
- **Technical Support**: Coming soon (via the website)
- **Investment Opportunities**: Contact via "Work With Me" page

---

## 📄 **Legal & Compliance**

- **Terms of Service**: Available at [dayweave.com/legal](https://dayweave.com/legal)
- **Privacy Policy**: GDPR compliant via Supabase standards
- **Data Storage**: EU-based servers with Supabase
- **User Rights**: Account deletion, data export available

---

## 🏆 **Built for the World's Largest Hackathon**

**© 2025 DayWeave. All Rights Reserved.**

This software represents months of development, AI integration, and user experience design. Built with ❤️ using Bolt.new, deployed on Netlify, powered by Supabase.

**Ready to weave your perfect day?** [Start planning now →](https://dayweave.com)

---
