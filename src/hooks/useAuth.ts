import { useState, useEffect } from 'react'
import { supabase, Profile, UserSubscription, SubscriptionTier } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [tier, setTier] = useState<SubscriptionTier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchSubscription(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchSubscription(session.user.id)
        } else {
          setProfile(null)
          setSubscription(null)
          setTier(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error) throw error
      setSubscription(data)
      setTier(data.subscription_tiers)
    } catch (error) {
      console.error('Error fetching subscription:', error)
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
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
