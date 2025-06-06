import { createClient } from '@supabase/supabase-js'

// Use Netlify's Supabase extension variable names
const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_DATABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For debugging - remove this in production
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')