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
    // Get customer and subscription details
    const customer = await stripe.customers.retrieve(session.customer);
    const subscription = session.subscription ? 
      await stripe.subscriptions.retrieve(session.subscription) : null;
    
    console.log('👤 Customer:', customer.email);
    console.log('📅 Subscription:', subscription?.id || 'No subscription');
    
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
    
    await refreshUserPageAllowance(customer.email);
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
    
    // Update or create subscription record
    const subscriptionData = {
      user_id: user.id,
      tier_id: tier.id,
      stripe_sub_id: subscription?.id || null,
      stripe_customer_id: subscription?.customer || session?.customer,
      status: subscription?.status || 'active',
      pages_remaining: tier.monthly_pages,
      pages_used: 0,
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

// Refresh user's page allowance
async function refreshUserPageAllowance(email) {
  try {
    console.log('🔄 Refreshing page allowance for:', email);
    
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
      .select('tier_id, pages_used')
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
    
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        pages_remaining: tier.monthly_pages,
        pages_used: 0
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('❌ Error refreshing page allowance:', updateError);
    } else {
      console.log('✅ Page allowance refreshed for user:', user.id);
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
  // This should match your Stripe price IDs
  const tierMap = {
    'price_starter_monthly': { id: 1, name: 'Starter', monthly_pages: 10 },
    'price_pro_monthly': { id: 2, name: 'Pro', monthly_pages: 50 },
    'price_business_monthly': { id: 3, name: 'Business', monthly_pages: 200 }
  };
  
  const tier = tierMap[priceId];
  if (!tier) {
    console.warn(`⚠️ Unknown price ID: ${priceId}, defaulting to Starter`);
    return tierMap['price_starter_monthly'];
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
