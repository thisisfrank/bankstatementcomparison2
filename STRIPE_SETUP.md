# Stripe Integration Setup

This guide explains how to set up Stripe payments for the bank statement comparison tool.

## Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Stripe Product Setup

1. **Create Products in Stripe Dashboard:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
   - Create three products with recurring pricing:

   **Starter Plan:**
   - Name: "Starter"
   - Price: $29/month
   - Billing: Recurring monthly
   - Copy the Price ID (starts with `price_`)

   **Pro Plan:**
   - Name: "Pro"
   - Price: $69/month
   - Billing: Recurring monthly
   - Copy the Price ID

   **Business Plan:**
   - Name: "Business"
   - Price: $149/month
   - Billing: Recurring monthly
   - Copy the Price ID

2. **Update the Stripe Service:**
   - Open `src/services/stripe.ts`
   - Replace the placeholder price IDs with your actual Stripe price IDs:

```typescript
export const STRIPE_PRODUCTS = {
  STARTER: 'price_1234567890abcdef', // Your actual Starter price ID
  PRO: 'price_0987654321fedcba',     // Your actual Pro price ID
  BUSINESS: 'price_abcdef1234567890' // Your actual Business price ID
} as const;
```

## How It Works

### Free Tier (Sign Up)
- User clicks "Sign Up" button
- Auth modal appears for account creation
- User gets 40 free pages per month

### Paid Tiers (Starter, Pro, Business)
- User clicks "Subscribe" button
- If not signed in: Auth modal appears first
- If signed in: Redirects to Stripe checkout
- Stripe handles payment processing
- User returns to success/cancel URL

## Success/Cancel URLs

- **Success URL:** `/settings?success=true`
- **Cancel URL:** `/pricing?canceled=true`

## Webhook Setup (Backend Required)

To automatically update user credits when payments succeed, you'll need:

1. **Backend API endpoint** to handle Stripe webhooks
2. **Webhook handler** to process successful payments
3. **Database update** to increase user's page allowance

### Webhook Events to Handle

- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled

### Example Webhook Handler

```typescript
// Backend webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update user's subscription in database
      await updateUserSubscription(session.customer, session.subscription);
      break;
  }
  
  res.json({ received: true });
});
```

## Testing

1. Use Stripe test keys for development
2. Test with Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Check Stripe dashboard for test transactions

## Production

1. Switch to Stripe live keys
2. Set up proper webhook endpoints
3. Configure success/cancel URLs for your domain
4. Test with real payment methods

## Security Notes

- Never expose Stripe secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper user authentication before checkout

