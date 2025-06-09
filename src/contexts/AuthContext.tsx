import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session - check for existing valid session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          // Only set session if it's valid and not expired
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at > now) {
            setSession(session);
            setUser(session.user);
            console.log('Restored valid session for user:', session.user.email);
          } else {
            console.log('Session expired, clearing...');
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
          // Don't redirect here - let the component handle it
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear any stored data
          localStorage.removeItem('dayweave_remember_me');
          sessionStorage.removeItem('dayweave_current_plan');
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const result = await authHelpers.signUp(email, password, fullName);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const result = await authHelpers.signIn(email, password);
      
      // Set remember me flag based on user choice
      if (result.data?.session && !result.error) {
        if (rememberMe) {
          localStorage.setItem('dayweave_remember_me', 'true');
        } else {
          localStorage.removeItem('dayweave_remember_me');
        }
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authHelpers.signOut();
      
      // Clear remember me flag and stored data
      localStorage.removeItem('dayweave_remember_me');
      sessionStorage.removeItem('dayweave_current_plan');
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return authHelpers.resetPassword(email);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};