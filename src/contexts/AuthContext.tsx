
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface User {
  id?: string; 
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
  };
  role?: string; // Keep the role in our interface since we use it
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check URL for auth action, handle email confirmation redirects
    const handleEmailConfirmation = async () => {
      const url = window.location.href;
      if (url.includes('#access_token=')) {
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (accessToken && type === 'recovery') {
          // Handle password recovery if needed
          console.log("Password recovery flow detected");
        } else if (accessToken && refreshToken) {
          try {
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) throw error;
            
            if (data.session) {
              toast.success("Email verified successfully");
              
              // If this is after a driver signup, redirect to driver login
              if (window.location.pathname.includes('driver')) {
                setTimeout(() => {
                  window.location.href = '/driver-login?verified=true';
                }, 1000);
              }
            }
          } catch (error) {
            console.error("Error setting session:", error);
            toast.error("Failed to verify email. Please try again.");
          }
        }
      }
    };
    
    handleEmailConfirmation();
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        
        if (!session) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Use setTimeout to prevent Supabase auth deadlock issues
        setTimeout(async () => {
          try {
            // First check if this is a driver
            const { data: driverData, error: driverError } = await supabase
              .from('drivers')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
              
            if (driverData) {
              // This is a driver
              const userProfile: User = {
                id: session.user.id,
                name: driverData.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: driverData.email || session.user.email || '',
                role: 'driver' // Set role as driver
              };
              setUser(userProfile);
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }

            // If not a driver, check regular profile
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error && error.code !== 'PGRST116') {
              throw error;
            }

            // Create user profile from data
            const userProfile: User = {
              id: session.user.id,
              name: data?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: data?.email || session.user.email || '',
              address: data ? {
                street: data.street || '',
                city: data.city || ''
              } : undefined,
              // Since profiles table doesn't have a role field, set a default role
              role: 'user'
            };

            setUser(userProfile);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // If profile fetch fails, still set basic user info
            const userProfile: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'user' // Default role
            };
            setUser(userProfile);
            setIsAuthenticated(true);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Session handling is done by the onAuthStateChange handler
        if (!data.session) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Signed in successfully');
      // Don't return data, as our type expects void
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Error signing in', {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated, 
      isLoading,
      login, 
      logout 
    }}>
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
