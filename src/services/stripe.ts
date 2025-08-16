import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Payment links for different tiers - Direct links to Stripe checkout
export const STRIPE_PAYMENT_LINKS = {
  STARTER: 'https://buy.stripe.com/test_dRmdRbcurfW97JAdhBgUM00',    // Starter: $29/month
  PRO: 'https://buy.stripe.com/test_28EaEZ7a7fW9aVM0uPgUM01',        // Pro: $69/month
  BUSINESS: 'https://buy.stripe.com/test_eVq8wR66325j3tk4L5gUM02'    // Business: $149/month
} as const;

export type StripeTier = keyof typeof STRIPE_PAYMENT_LINKS;

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Direct redirect to payment link (simplified approach)
export const redirectToPaymentLink = (tier: StripeTier) => {
  const paymentLink = STRIPE_PAYMENT_LINKS[tier];
  
  if (!paymentLink) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  // Open payment link in new tab
  window.open(paymentLink, '_blank');
};

// Legacy functions for backward compatibility (if needed)
export const redirectToCheckout = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: successUrl || `${window.location.origin}/settings?success=true`,
      cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`,
      billingAddressCollection: 'required',
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

// Simplified checkout for different tiers (now uses payment links)
export const checkoutTier = async (tier: StripeTier) => {
  redirectToPaymentLink(tier);
};

// Handle successful payment webhook (this would be called by your backend)
export const handleSuccessfulPayment = async (subscriptionId: string, userId: string, tier: StripeTier) => {
  try {
    // This function would typically be called by your backend webhook handler
    // For now, we'll just log the success
    console.log('Payment successful:', { subscriptionId, userId, tier });
    
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Update the user's subscription in your database
    // 3. Send confirmation emails
    // 4. Update user credits/pages
    
    return { success: true };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
};

// Get customer portal URL (for managing subscriptions)
export const getCustomerPortalUrl = async (customerId: string, returnUrl?: string) => {
  try {
    // This would typically call your backend to create a portal session
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: returnUrl || `${window.location.origin}/settings`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error getting customer portal URL:', error);
    throw error;
  }
};
