// Example backend webhook handler for Stripe payments
// This would be implemented in your backend (Node.js, Python, etc.)

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.raw({ type: 'application/json' }));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook event received:', event.type);

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
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful checkout completion
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  // Get customer and subscription details
  const customer = await stripe.customers.retrieve(session.customer);
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update user's subscription in Supabase
  await updateUserSubscription(customer.email, subscription);
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Update user's subscription in Supabase
  await updateUserSubscription(customer.email, subscription);
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Update user's subscription in Supabase
  await updateUserSubscription(customer.email, subscription);
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Cancel user's subscription in Supabase
  await cancelUserSubscription(customer.email);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer);
  
  // Refresh user's page allowance
  await refreshUserPageAllowance(customer.email);
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(invoice.customer);
  
  // Handle failed payment (e.g., send email, update status)
  await handleFailedPayment(customer.email);
}

// Update user subscription in Supabase
async function updateUserSubscription(email, subscription) {
  try {
    // Get subscription tier based on price ID
    const tier = getTierFromPriceId(subscription.items.data[0].price.id);
    
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    // Update or create subscription record
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        tier_id: tier.id,
        stripe_sub_id: subscription.id,
        status: subscription.status,
        pages_remaining: tier.monthly_pages,
        pages_used: 0
      });
    
    if (subError) {
      console.error('Error updating subscription:', subError);
    } else {
      console.log('Subscription updated successfully for user:', user.id);
    }
  } catch (error) {
    console.error('Error in updateUserSubscription:', error);
  }
}

// Cancel user subscription in Supabase
async function cancelUserSubscription(email) {
  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    // Update subscription status
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', user.id);
    
    if (subError) {
      console.error('Error canceling subscription:', subError);
    } else {
      console.log('Subscription canceled successfully for user:', user.id);
    }
  } catch (error) {
    console.error('Error in cancelUserSubscription:', error);
  }
}

// Refresh user's page allowance
async function refreshUserPageAllowance(email) {
  try {
    // Get user and subscription from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('tier_id, pages_used')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (subError) {
      console.error('Error finding subscription:', subError);
      return;
    }
    
    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('monthly_pages')
      .eq('id', subscription.tier_id)
      .single();
    
    if (tierError) {
      console.error('Error finding tier:', tierError);
      return;
    }
    
    // Reset pages for new month
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        pages_remaining: tier.monthly_pages,
        pages_used: 0
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error refreshing page allowance:', updateError);
    } else {
      console.log('Page allowance refreshed for user:', user.id);
    }
  } catch (error) {
    console.error('Error in refreshUserPageAllowance:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(email) {
  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    // Update subscription status
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', user.id);
    
    if (subError) {
      console.error('Error updating subscription status:', subError);
    } else {
      console.log('Subscription status updated to past_due for user:', user.id);
    }
    
    // TODO: Send email notification to user about failed payment
  } catch (error) {
    console.error('Error in handleFailedPayment:', error);
  }
}

// Helper function to get tier from Stripe price ID
function getTierFromPriceId(priceId) {
  // This should match your Stripe price IDs
  const tierMap = {
    'price_starter_monthly': { id: 1, name: 'Starter' },
    'price_pro_monthly': { id: 2, name: 'Pro' },
    'price_business_monthly': { id: 3, name: 'Business' }
  };
  
  return tierMap[priceId] || { id: 1, name: 'Starter' };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});

module.exports = app;

