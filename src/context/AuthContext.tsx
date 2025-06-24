
"use client";

import type { User, Session } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This is the primary listener for auth state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Also check the initial session state when the provider mounts.
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error("Supabase Sign In Error:", signInError);
      setError(signInError);
    } else {
        // Redirect on successful login is now handled by middleware.
        // We can just refresh the router to make sure it re-evaluates the route.
        router.refresh();
    }
    setLoading(false);
    return { error: signInError };
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Redirect after sign-out is also handled by middleware.
      // Force a navigation event to trigger middleware check.
      router.push('/login');
    } catch (e) {
      console.error("Supabase Sign out error:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  // The loading screen is important to prevent content flashing before auth state is determined.
  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, session, loading, error, signInWithEmail, signOut }}>
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
