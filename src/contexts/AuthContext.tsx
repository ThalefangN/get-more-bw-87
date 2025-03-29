
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface User {
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Get user profile from the database
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            const userProfile: User = {
              name: data.name || session.user.email?.split('@')[0] || 'User',
              email: data.email || session.user.email || '',
              address: {
                street: data.street || '',
                city: data.city || ''
              }
            };

            setUser(userProfile);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // If profile fetch fails, still set basic user info
            const userProfile: User = {
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
            };
            setUser(userProfile);
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user profile is handled by the onAuthStateChange listener
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (userData: User) => {
    // In the real app with Supabase, the actual login happens elsewhere
    // This function is kept for backward compatibility but won't be used directly
    console.log('Legacy login function called with:', userData);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    } else {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Signed out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
