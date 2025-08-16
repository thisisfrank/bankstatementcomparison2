# Supabase Edge Functions

This directory contains the Edge Functions that replace your Express backend.

## Functions Created

1. **`stripe-webhook`** - Handles all Stripe webhook events
2. **`create-portal-session`** - Creates Stripe customer portal sessions

## Testing Locally

### Prerequisites
- Install Supabase CLI: `npm install -g supabase`
- Make sure you have Docker running

### Start Local Development
```bash
# Start Supabase locally
supabase start

# This will start:
# - Database on port 54322
# - API on port 54321
# - Studio on port 54323
# - Edge Functions on port 54321
```

### Test Functions
```bash
# Test stripe-webhook function
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test create-portal-session function
curl -X POST http://localhost:54321/functions/v1/create-portal-session \
  -H "Content-Type: application/json" \
  -d '{"customerId": "cus_test123"}'
```

### View Logs
```bash
# View function logs
supabase functions logs stripe-webhook
supabase functions logs create-portal-session
```

## Environment Variables Needed

Add these to your Supabase dashboard (Settings → Edge Functions):

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
```

