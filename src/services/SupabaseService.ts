import { supabase, TABLES, Database } from '../config/supabase';
import { User, LoyaltyPoints, Transaction } from './UnifiedBackendService';

export interface SupabaseAuthResult {
  success: boolean;
  user?: User;
  message: string;
  session?: any;
}

export interface SupabasePointsResult {
  success: boolean;
  points?: LoyaltyPoints;
  message: string;
}

export interface SupabaseTransactionResult {
  success: boolean;
  transaction?: Transaction;
  message: string;
}

class SupabaseService {
  private static instance: SupabaseService;

  private constructor() {}

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Authentication methods
  async signUp(email: string, password: string, firstName: string, lastName: string, phoneNumber?: string): Promise<SupabaseAuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role: 'USER',
          },
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role: 'USER',
            is_active: true,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail the signup if profile creation fails
        }

        // Initialize loyalty points
        const { error: pointsError } = await supabase
          .from(TABLES.LOYALTY_POINTS)
          .insert({
            user_id: data.user.id,
            points_balance: 0,
            total_earned: 0,
            total_redeemed: 0,
          });

        if (pointsError) {
          console.error('Loyalty points initialization error:', pointsError);
        }

        return {
          success: true,
          user: this.mapSupabaseUserToUser(data.user, firstName, lastName),
          message: 'Account created successfully!',
          session: data.session,
        };
      }

      return {
        success: false,
        message: 'Signup completed but no user data received',
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signup',
      };
    }
  }

  async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      if (data.user) {
        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return {
            success: false,
            message: 'Failed to fetch user profile',
          };
        }

        return {
          success: true,
          user: this.mapSupabaseUserToUser(data.user, profile.first_name, profile.last_name),
          message: 'Login successful!',
          session: data.session,
        };
      }

      return {
        success: false,
        message: 'Login failed - no user data received',
      };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during login',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Signout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) return null;

      return this.mapSupabaseUserToUser(user, profile.first_name, profile.last_name);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Loyalty points methods
  async getLoyaltyPoints(userId: string): Promise<SupabasePointsResult> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_POINTS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      if (data) {
        const points: LoyaltyPoints = {
          id: data.id,
          userId: data.user_id,
          pointsBalance: data.points_balance,
          totalEarned: data.total_earned,
          totalRedeemed: data.total_redeemed,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        return {
          success: true,
          points,
          message: 'Points retrieved successfully',
        };
      }

      return {
        success: false,
        message: 'No loyalty points found for user',
      };
    } catch (error) {
      console.error('Get loyalty points error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while fetching points',
      };
    }
  }

  async addPoints(userId: string, points: number, reason: string, partnerId?: string): Promise<SupabasePointsResult> {
    try {
      // Start a transaction
      const { data: currentPoints, error: fetchError } = await supabase
        .from(TABLES.LOYALTY_POINTS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return {
          success: false,
          message: fetchError.message,
        };
      }

      if (!currentPoints) {
        return {
          success: false,
          message: 'User loyalty points record not found',
        };
      }

      const newBalance = currentPoints.points_balance + points;
      const newTotalEarned = currentPoints.total_earned + points;

      // Update points
      const { error: updateError } = await supabase
        .from(TABLES.LOYALTY_POINTS)
        .update({
          points_balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        return {
          success: false,
          message: updateError.message,
        };
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert({
          user_id: userId,
          type: 'EARN',
          points,
          reason,
          partner_id: partnerId,
        });

      if (transactionError) {
        console.error('Transaction record creation error:', transactionError);
        // Don't fail the operation if transaction record fails
      }

      const updatedPoints: LoyaltyPoints = {
        id: currentPoints.id,
        userId: currentPoints.user_id,
        pointsBalance: newBalance,
        totalEarned: newTotalEarned,
        totalRedeemed: currentPoints.total_redeemed,
        created_at: currentPoints.created_at,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        points: updatedPoints,
        message: `Successfully added ${points} points`,
      };
    } catch (error) {
      console.error('Add points error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while adding points',
      };
    }
  }

  // Helper method to map Supabase user to our User interface
  private mapSupabaseUserToUser(supabaseUser: any, firstName: string, lastName: string): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName,
      lastName,
      role: 'USER', // Default role, can be updated from profile
      isActive: true,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }

  // Get auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default SupabaseService;
