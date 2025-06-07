# Quick Fix: Google AI API Key Setup

The edge function is failing because the Google AI API key is not configured. Follow these steps:

## Step 1: Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

## Step 3: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Set the API Key as Secret

```bash
# Replace 'your_google_ai_key_here' with your actual API key
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_key_here
```

## Step 5: Redeploy the Function

```bash
supabase functions deploy generate-itinerary
```

## Step 6: Verify Setup

```bash
# Check that the secret is set
supabase secrets list

# Test the function
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

## Important Notes

- **Never put API keys in .env files or client-side code**
- The API key is stored securely in Supabase and only accessible to edge functions
- Google AI Studio offers a free tier to get started
- You can also manage secrets through the Supabase Dashboard under Edge Functions > Secrets

After completing these steps, the itinerary generation should work properly!