import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  LOYALTY_POINTS: 'loyalty_points',
  TRANSACTIONS: 'transactions',
  PARTNERS: 'partners',
  QUIZZES: 'quizzes',
  PROMOTIONS: 'promotions',
  REFERRALS: 'referrals',
  QR_CODES: 'qr_codes',
} as const;

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number?: string;
          role: 'ADMIN' | 'USER';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone_number?: string;
          role?: 'ADMIN' | 'USER';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone_number?: string;
          role?: 'ADMIN' | 'USER';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      loyalty_points: {
        Row: {
          id: string;
          user_id: string;
          points_balance: number;
          total_earned: number;
          total_redeemed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points_balance?: number;
          total_earned?: number;
          total_redeemed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points_balance?: number;
          total_earned?: number;
          total_redeemed?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'EARN' | 'REDEEM';
          points: number;
          reason: string;
          partner_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'EARN' | 'REDEEM';
          points: number;
          reason: string;
          partner_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'EARN' | 'REDEEM';
          points?: number;
          reason?: string;
          partner_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
