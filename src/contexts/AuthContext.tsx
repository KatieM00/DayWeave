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
  restoreStoredPlan: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Plan restoration helper
  const restoreStoredPlan = (): boolean => {
    try {
      const storedPlan = sessionStorage.getItem('dayweave_current_plan');
      if (!storedPlan) return false;

      const planData = JSON.parse(storedPlan);
      
      // Check if data is valid and not expired (1 hour)
      const now = Date.now();
      const expiry = 60 * 60 * 1000; // 1 hour
      
      if (!planData.timestamp || (now - planData.timestamp) > expiry) {
        sessionStorage.removeItem('dayweave_current_plan');
        return false;
      }

      // Set flag to indicate restoration should happen
      sessionStorage.setItem('dayweave_should_restore', 'true');

      // Dispatch restoration event
      window.dispatchEvent(new CustomEvent('planRestoration', {
        detail: planData
      }));

      console.log('Plan restoration triggered from AuthContext');
      return true;
    } catch (error) {
      console.error('Error restoring stored plan:', error);
      sessionStorage.removeItem('dayweave_current_plan');
      return false;
    }
  };

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
          
          // Attempt to restore stored plan after successful sign-in
          setTimeout(() => {
            const restored = restoreStoredPlan();
            if (restored) {
              console.log('Plan restoration flag set after sign-in');
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear any stored data
          localStorage.removeItem('dayweave_remember_me');
          sessionStorage.removeItem('dayweave_current_plan');
          sessionStorage.removeItem('dayweave_should_restore');
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
      sessionStorage.removeItem('dayweave_should_restore');
      
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
    restoreStoredPlan,
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