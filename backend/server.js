import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json({ verify: (req, res, buf) => {
  req.rawBody = buf;
}}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Webhook event received: ${event.type}`);
  console.log(`📋 Event ID: ${event.id}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      case 'customer.subscription.trial_ended':
        await handleTrialEnded(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, event_type: event.type });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
});

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  console.log('🛒 Checkout completed:', session.id);
  
  try {
    // Check if session has a customer
    if (!session.customer) {
      console.log('⚠️ No customer associated with this checkout session');
      console.log('📋 Session details:', {
        id: session.id,
        customer_email: session.customer_details?.email,
        mode: session.mode,
        payment_status: session.payment_status
      });
      return;
    }

    // Get customer and subscription details
    let customer;
    try {
      customer = await stripe.customers.retrieve(session.customer);
      console.log('👤 Customer:', customer.email);
    } catch (customerError) {
      console.error('❌ Error retrieving customer:', customerError.message);
      return;
    }

    let subscription = null;
    if (session.subscription) {
      try {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
        console.log('📅 Subscription:', subscription.id);
      } catch (subscriptionError) {
        console.error('❌ Error retrieving subscription:', subscriptionError.message);
      }
    } else {
      console.log('📅 No subscription associated with this checkout');
    }
    
    // Update user's subscription in Supabase
    await updateUserSubscription(customer.email, subscription, session);
  } catch (error) {
    console.error('❌ Error in handleCheckoutCompleted:', error);
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('🆕 Subscription created:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('👤 Customer:', customer.email);
    
    await updateUserSubscription(customer.email, subscription);
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCreated:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('👤 Customer:', customer.email);
    console.log('📊 Status:', subscription.status);
    
    await updateUserSubscription(customer.email, subscription);
  } catch (error) {
    console.error('❌ Error in handleSubscriptionUpdated:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Subscription deleted:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('👤 Customer:', customer.email);
    
    await cancelUserSubscription(customer.email);
  } catch (error) {
    console.error('❌ Error in handleSubscriptionDeleted:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    console.log('👤 Customer:', customer.email);
    
    // Only refresh page allowance if this is a monthly renewal
    // (not on upgrades or other payments)
    if (invoice.billing_reason === 'subscription_cycle') {
      console.log('🔄 Monthly renewal detected, refreshing page allowance');
      await refreshUserPageAllowance(customer.email);
    } else {
      console.log('💳 Payment received but not monthly renewal, skipping page refresh');
    }
  } catch (error) {
    console.error('❌ Error in handlePaymentSucceeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('💸 Payment failed:', invoice.id);
  
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    console.log('👤 Customer:', customer.email);
    
    await handleFailedPayment(customer.email);
  } catch (error) {
    console.error('❌ Error in handlePaymentFailed:', error);
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription) {
  console.log('⏰ Trial ending soon:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('👤 Customer:', customer.email);
    
    // TODO: Send email notification about trial ending
    console.log('📧 Should send trial ending notification to:', customer.email);
  } catch (error) {
    console.error('❌ Error in handleTrialWillEnd:', error);
  }
}

// Handle trial ended
async function handleTrialEnded(subscription) {
  console.log('🔚 Trial ended:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    console.log('👤 Customer:', customer.email);
    
    // TODO: Handle trial end logic
    console.log('📧 Should handle trial end for:', customer.email);
  } catch (error) {
    console.error('❌ Error in handleTrialEnded:', error);
  }
}

// Update user subscription in Supabase
async function updateUserSubscription(email, subscription, session = null) {
  try {
    console.log('🔄 Updating subscription for:', email);
    
    // Get subscription tier based on price ID
    const priceId = subscription?.items?.data[0]?.price?.id || session?.line_items?.data[0]?.price?.id;
    const tier = getTierFromPriceId(priceId);
    
    console.log('🏷️ Price ID:', priceId);
    console.log('📊 Tier:', tier.name);
    
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }
    
    console.log('👤 User found:', user.id);
    
    // Check if user already has a subscription to handle upgrades
    const { data: existingSub, error: existingError } = await supabase
      .from('user_subscriptions')
      .select('pages_remaining, tier_id, pages_used')
      .eq('user_id', user.id)
      .single();
    
    let newPagesRemaining = tier.monthly_pages;
    
    if (existingError && existingError.code === 'PGRST116') {
      console.log('🆕 First-time subscription for user');
    } else if (existingSub) {
      if (existingSub.tier_id !== tier.id) {
        console.log('🔄 User is upgrading from tier', existingSub.tier_id, 'to', tier.id);
        console.log('📊 Current pages remaining:', existingSub.pages_remaining);
        console.log('📊 Current pages used:', existingSub.pages_used);
        console.log('📊 New tier pages:', tier.monthly_pages);
        
        newPagesRemaining = existingSub.pages_remaining + tier.monthly_pages;
        console.log('📊 Total pages after upgrade:', newPagesRemaining);
      } else {
        console.log('🔄 User is on same tier, keeping existing pages:', existingSub.pages_remaining);
        newPagesRemaining = existingSub.pages_remaining;
      }
    }
    
    // Update or create subscription record
    const subscriptionData = {
      user_id: user.id,
      tier_id: tier.id,
      stripe_sub_id: subscription?.id || null,
      stripe_customer_id: subscription?.customer || session?.customer,
      status: subscription?.status || 'active',
      pages_remaining: newPagesRemaining,
      pages_used: existingSub ? existingSub.pages_used : 0,  // Preserve existing usage
      current_period_start: subscription?.current_period_start ? 
        new Date(subscription.current_period_start * 1000) : new Date(),
      current_period_end: subscription?.current_period_end ? 
        new Date(subscription.current_period_end * 1000) : null
    };
    
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      });
    
    if (subError) {
      console.error('❌ Error updating subscription:', subError);
    } else {
      console.log('✅ Subscription updated successfully for user:', user.id);
      console.log('📊 Final pages_remaining:', newPagesRemaining);
    }
  } catch (error) {
    console.error('❌ Error in updateUserSubscription:', error);
  }
}

// Cancel user subscription in Supabase
async function cancelUserSubscription(email) {
  try {
    console.log('🚫 Canceling subscription for:', email);
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }
    
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date()
      })
      .eq('user_id', user.id);
    
    if (subError) {
      console.error('❌ Error canceling subscription:', subError);
    } else {
      console.log('✅ Subscription canceled successfully for user:', user.id);
    }
  } catch (error) {
    console.error('❌ Error in cancelUserSubscription:', error);
  }
}

// Refresh user's page allowance (monthly renewal)
async function refreshUserPageAllowance(email) {
  try {
    console.log('🔄 Refreshing page allowance for monthly renewal:', email);
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }
    
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('tier_id, pages_used, pages_remaining')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (subError) {
      console.error('❌ Error finding subscription:', subError);
      return;
    }
    
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('monthly_pages')
      .eq('id', subscription.tier_id)
      .single();
    
    if (tierError) {
      console.error('❌ Error finding tier:', tierError);
      return;
    }
    
    // Calculate new pages: tier monthly pages + any unused pages from previous month
    const unusedPages = Math.max(0, subscription.pages_remaining - subscription.pages_used);
    const newPagesRemaining = tier.monthly_pages + unusedPages;
    
    console.log('📊 Monthly renewal calculation:');
    console.log('  - Tier monthly pages:', tier.monthly_pages);
    console.log('  - Unused pages from previous month:', unusedPages);
    console.log('  - Total new pages:', newPagesRemaining);
    
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        pages_remaining: newPagesRemaining,
        pages_used: 0  // Reset usage counter for new month
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('❌ Error refreshing page allowance:', updateError);
    } else {
      console.log('✅ Page allowance refreshed for user:', user.id);
      console.log('📊 Final pages_remaining:', newPagesRemaining);
    }
  } catch (error) {
    console.error('❌ Error in refreshUserPageAllowance:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(email) {
  try {
    console.log('💸 Handling failed payment for:', email);
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }
    
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'past_due',
        past_due_at: new Date()
      })
      .eq('user_id', user.id);
    
    if (subError) {
      console.error('❌ Error updating subscription status:', subError);
    } else {
      console.log('✅ Subscription status updated to past_due for user:', user.id);
    }
    
    // TODO: Send email notification to user about failed payment
    console.log('📧 Should send failed payment notification to:', email);
  } catch (error) {
    console.error('❌ Error in handleFailedPayment:', error);
  }
}

// Helper function to get tier from Stripe price ID
function getTierFromPriceId(priceId) {
  // Your actual Stripe price IDs mapped to your database tiers
  const tierMap = {
    'price_1Rrpe8RD0ogceRR4LdVUllat': { id: 2, name: 'starter', monthly_pages: 150 },
    'price_1Rrrw7RD0ogceRR4BEdntV12': { id: 3, name: 'pro', monthly_pages: 400 },
    'price_1RrrwQRD0ogceRR41ZscbkhJ': { id: 4, name: 'business', monthly_pages: 1000 }
  };
  
  const tier = tierMap[priceId];
  if (!tier) {
    console.warn(`⚠️ Unknown price ID: ${priceId}, defaulting to Starter`);
    return { id: 2, name: 'starter', monthly_pages: 150 };
  }
  
  return tier;
}

// Test endpoint to verify webhook setup
app.get('/test-webhook', async (req, res) => {
  try {
    // Test Stripe connection
    const testCustomer = await stripe.customers.list({ limit: 1 });
    const testSubscription = await stripe.subscriptions.list({ limit: 1 });
    
    res.json({
      status: 'ok',
      stripe_connected: true,
      customers_count: testCustomer.data.length,
      subscriptions_count: testSubscription.data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      stripe_connected: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-webhook`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook/stripe`);
});

export default app;
