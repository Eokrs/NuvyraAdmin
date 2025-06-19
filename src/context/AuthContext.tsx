
"use client";

import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { deleteAuthCookie, setAuthCookie } from '@/lib/auth/actions';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>; // Placeholder, implement if needed
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const idToken = await authUser.getIdToken();
          await setAuthCookie(idToken);
        } catch (e) {
          console.error("Error setting auth cookie:", e);
          setError(e as Error);
          // Optionally sign out user if cookie setting fails
          await firebaseSignOut(auth);
          setUser(null);
          await deleteAuthCookie();
        }
      } else {
        setUser(null);
        await deleteAuthCookie();
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Placeholder for Google Sign-In, implement using Firebase SDK if needed
  const signInWithGoogle = async () => {
    // Example:
    // const provider = new GoogleAuthProvider();
    // await signInWithPopup(auth, provider);
    console.warn("signInWithGoogle not implemented");
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // setUser(null) will be handled by onAuthStateChanged
      // await deleteAuthCookie(); // also handled by onAuthStateChanged
      router.push('/login');
    } catch (e) {
      console.error("Sign out error:", e);
      setError(e as Error);
    } finally {
      // setLoading(false) will be handled by onAuthStateChanged
    }
  };
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname.startsWith('/admin')) {
      router.push('/login');
    }
    if (!loading && user && pathname === '/login') {
      router.push('/admin/products');
    }
  }, [user, loading, pathname, router]);


  if (loading && (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/')) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOut }}>
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
