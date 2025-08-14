import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserSubscriptionData {
  tierName: string;
  pagesRemaining: number;
  pagesUsed: number;
  monthlyPages: number;
  status: string;
  isActive: boolean;
}

interface UseSubscriptionReturn {
  subscriptionData: UserSubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  console.log('🎯 useSubscription: Hook called, getting auth data...')
  
  const { subscription, tier, loading, user } = useAuth();
  
  console.log('🎯 useSubscription: Auth data received:', {
    hasUser: !!user,
    userId: user?.id,
    hasSubscription: !!subscription,
    hasTier: !!tier,
    isLoading: loading,
    subscriptionData: subscription,
    tierData: tier
  });
  
  const [error, setError] = useState<string | null>(null);

  // Derive subscription data from auth hook
  const subscriptionData: UserSubscriptionData | null = subscription && tier ? {
    tierName: tier.name,
    pagesRemaining: subscription.pages_remaining,
    pagesUsed: subscription.pages_used,
    monthlyPages: tier.monthly_pages,
    status: subscription.status,
    isActive: subscription.status === 'active'
  } : null;

  console.log('🎯 useSubscription: Derived subscription data:', subscriptionData);

  const refreshSubscription = async () => {
    console.log('🎯 useSubscription: Refresh requested (placeholder)');
    // The useAuth hook handles refreshing subscription data
    // This is just a placeholder for the interface
  };

  const result = {
    subscriptionData,
    isLoading: loading,
    error,
    refreshSubscription
  };

  console.log('🎯 useSubscription: Returning result:', result);
  return result;
}
