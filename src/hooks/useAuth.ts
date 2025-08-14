import { useState, useEffect } from 'react'
import { supabase, Profile, UserSubscription, SubscriptionTier } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [tier, setTier] = useState<SubscriptionTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    console.log('🔐 useAuth: useEffect triggered, starting auth initialization...')
    
    // Get initial session
    console.log('🔐 useAuth: Getting initial session...')
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 useAuth: Initial session result:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error: error?.message 
      })
      
      setUser(session?.user ?? null)
              if (session?.user) {
          console.log('🔐 useAuth: User found, fetching profile and subscription...')
          // Use Promise.allSettled to ensure both fetches complete (or fail) before setting loading to false
          Promise.allSettled([
            fetchProfile(session.user.id),
            fetchSubscription(session.user.id)
          ]).then(() => {
            console.log('🔐 useAuth: All fetches completed, setting loading to false');
            setLoading(false);
          });
        } else {
          console.log('🔐 useAuth: No user session, setting loading to false')
          setLoading(false)
        }
    }).catch(error => {
      console.error('🔐 useAuth: Error getting initial session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    console.log('🔐 useAuth: Setting up auth state change listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 useAuth: Auth state change event:', event, { 
          hasSession: !!session, 
          userId: session?.user?.id 
        })
        
        setUser(session?.user ?? null)
        if (session?.user) {
          console.log('🔐 useAuth: User authenticated, fetching profile and subscription...')
          // Use Promise.allSettled to ensure both fetches complete (or fail) before setting loading to false
          Promise.allSettled([
            fetchProfile(session.user.id),
            fetchSubscription(session.user.id)
          ]).then(() => {
            console.log('🔐 useAuth: All fetches completed after auth state change, setting loading to false');
            setLoading(false);
          });
        } else {
          console.log('🔐 useAuth: User signed out, clearing data...')
          setProfile(null)
          setSubscription(null)
          setTier(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🔐 useAuth: Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    if (isFetching) {
      console.log('👤 useAuth: Profile fetch already in progress, skipping...');
      return;
    }
    
    try {
      setIsFetching(true);
      console.log('👤 useAuth: Starting profile fetch for user:', userId);
      
      const startTime = Date.now();
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000);
      });
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      const fetchTime = Date.now() - startTime;
      console.log('👤 useAuth: Profile fetch completed in', fetchTime, 'ms:', { 
        hasData: !!data, 
        error: error?.message,
        profileData: data 
      });

      if (error) {
        console.error('👤 useAuth: Profile fetch error:', error);
        return;
      }
      
      if (data) {
        console.log('👤 useAuth: Profile fetched successfully:', data);
        setProfile(data);
      } else {
        console.log('👤 useAuth: No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('👤 useAuth: Error fetching profile:', error)
      setProfile(null);
    } finally {
      setIsFetching(false);
    }
  }

  const fetchSubscription = async (userId: string) => {
    if (isFetching) {
      console.log('💳 useAuth: Subscription fetch already in progress, skipping...');
      return;
    }
    
    try {
      setIsFetching(true);
      console.log('💳 useAuth: Starting subscription fetch for user:', userId);
      
      const startTime = Date.now();
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Subscription fetch timeout after 10 seconds')), 10000);
      });
      
      const fetchPromise = supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      const fetchTime = Date.now() - startTime;
      console.log('💳 useAuth: Subscription fetch completed in', fetchTime, 'ms:', { 
        hasData: !!data, 
        error: error?.message,
        subscriptionData: data 
      });

      if (error) {
        console.error('💳 useAuth: Subscription fetch error:', error);
        return;
      }
      
      if (data) {
        console.log('💳 useAuth: Subscription fetched successfully:', data);
        setSubscription(data);
        setTier(data.subscription_tiers);
      } else {
        console.log('💳 useAuth: No active subscription found for user:', userId);
        setSubscription(null);
        setTier(null);
      }
    } catch (error) {
      console.error('💳 useAuth: Error fetching subscription:', error)
      setSubscription(null);
      setTier(null);
    } finally {
      setIsFetching(false);
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Attempting signup with:', { email, password: '***', fullName })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) {
        console.error('Signup error details:', error)
        throw error
      }

      if (data.user) {
        // Wait for the session to be established
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('Session not established after signup')
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName
          })

        if (profileError) throw profileError

        // Create free subscription
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: data.user.id,
            tier_id: 1, // free tier
            pages_remaining: 40
          })

        if (subError) throw subError
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('useAuth signOut called, attempting to sign out from Supabase...');
      console.log('Current user state before signOut:', user);
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      try {
        const { data: testData, error: testError } = await supabase.auth.getSession();
        console.log('Supabase connection test result:', { testData, testError });
      } catch (testErr) {
        console.error('Supabase connection test failed:', testErr);
      }
      
      console.log('Attempting Supabase signOut...');
      const startTime = Date.now();
      
      // Use AbortController for proper timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const { error } = await supabase.auth.signOut();
        
        const endTime = Date.now();
        console.log(`Supabase signOut completed in ${endTime - startTime}ms`);
        
        if (error) {
          console.error('Supabase signOut error:', error);
          throw error;
        }
        
        console.log('Supabase signOut successful');
      } catch (signOutError: any) {
        if (signOutError.name === 'AbortError') {
          console.warn('Supabase signOut timed out, attempting manual session clear...');
          
          // Try to manually clear the session
          try {
            await supabase.auth.refreshSession();
            console.log('Manually refreshed session');
          } catch (sessionError) {
            console.warn('Failed to manually refresh session:', sessionError);
          }
          
          // Try to manually sign out using a different method
          try {
            await supabase.auth.signOut({ scope: 'local' });
            console.log('Local signOut successful');
          } catch (localError) {
            console.warn('Local signOut failed:', localError);
          }
        } else {
          throw signOutError;
        }
      } finally {
        clearTimeout(timeoutId);
      }
      
      console.log('User state after signOut should be null');
      
      // Manually clear local state
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setTier(null);
      
    } catch (error) {
      console.error('Error signing out:', error)
      throw error;
    }
  }

  return {
    user,
    profile,
    subscription,
    tier,
    loading,
    signUp,
    signIn,
    signOut,
    isSignedIn: !!user
  }
}
