import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON

console.log('Supabase config check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('Supabase client created successfully');

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionTier {
  id: number
  name: string
  monthly_price: number
  monthly_pages: number
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: number
  stripe_sub_id?: string
  status: string
  pages_used: number
  pages_remaining: number
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  pages_consumed: number
  created_at: string
}
