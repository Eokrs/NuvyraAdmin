
"use client";

import type { User, Session } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle redirects based on auth state
      if (session) {
        if (pathname === '/login') {
          router.push('/admin/products');
        }
      } else {
        if (pathname.startsWith('/admin')) {
          router.push('/login');
        }
      }
    });

    // Check initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (!data.session && pathname.startsWith('/admin')) {
        router.push('/login');
      } else if (data.session && pathname === '/login') {
         router.push('/admin/products');
      }
    };
    getInitialSession();


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);


  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error("Supabase Sign In Error:", signInError);
      setError(signInError);
    }
    // onAuthStateChange will handle user state update and redirect
    setLoading(false);
    return { error: signInError };
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // setUser and setSession will be handled by onAuthStateChange
      router.push('/login'); // Explicit redirect after sign out
    } catch (e) {
      console.error("Supabase Sign out error:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // This effect might be redundant due to onAuthStateChange handling, but kept as a safeguard.
    if (!loading) {
      if (!session && pathname !== '/login' && pathname.startsWith('/admin')) {
        router.push('/login');
      }
      if (session && pathname === '/login') {
        router.push('/admin/products');
      }
    }
  }, [session, loading, pathname, router]);


  if (loading && (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/')) {
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
