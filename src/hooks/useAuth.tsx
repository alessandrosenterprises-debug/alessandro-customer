import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { getCustomerWithRetry } from '../services/customers';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    business?: string,
    phone?: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };

    // The database trigger, rather than the client, creates this row. Wait
    // briefly so the portal never opens before the profile is available.
    if (data.user) {
      const { data: customer, error: customerError } = await getCustomerWithRetry(
        data.user.id
      );
      if (!customer) {
        await supabase.auth.signOut();
        return {
          error:
            customerError instanceof Error
              ? 'Your account profile is still being created. Please try again in a moment.'
              : 'Your account profile could not be verified. Please try again in a moment.',
        };
      }
      const accessStatus = (customer as { access_status?: string }).access_status;
      if (accessStatus && accessStatus !== 'active') {
        await supabase.auth.signOut();
        return {
          error:
            accessStatus === 'blocked'
              ? 'Your portal access has been blocked. Please contact the business.'
              : 'Your portal access is currently unavailable. Please contact the business.',
        };
      }
    }

    return { error: null };
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    business?: string,
    phone?: string
  ) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, business, phone } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
