import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../services/UnifiedBackendService';
import SupabaseService from '../services/SupabaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseService = SupabaseService.getInstance();

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await supabaseService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabaseService]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabaseService.signIn(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during sign in',
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => {
    try {
      setLoading(true);
      const result = await supabaseService.signUp(email, password, firstName, lastName, phoneNumber);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during sign up',
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabaseService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
