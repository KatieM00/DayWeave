import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const authHelpers = {
  signUp: (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  },
  signIn: (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signOut: () => {
    return supabase.auth.signOut();
  },
  resetPassword: (email: string) => {
    return supabase.auth.resetPasswordForEmail(email);
  }
};