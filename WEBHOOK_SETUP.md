# Stripe Webhook Setup Guide

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
# Copy the server-package.json to a new folder
mkdir backend
cd backend
cp ../server-package.json package.json
npm install
```

### 2. Create Environment File
Create `.env` file in your backend folder:
```env
STRIPE_SECRET_KEY=sk_test_...your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret
SUPABASE_URL=https://...your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=...your_service_role_key
PORT=3001
```

### 3. Start the Server
```bash
npm run dev
```

## 🔧 Setting Up Stripe CLI Listener

### 1. Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3001/webhook/stripe
```

### 2. Copy the Webhook Secret
The CLI will output something like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

Copy this to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## 📡 Webhook Events We're Capturing

### Core Subscription Events
- `checkout.session.completed` - When customer completes payment
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled

### Payment Events
- `invoice.payment_succeeded` - Successful recurring payment
- `invoice.payment_failed` - Failed payment

### Trial Events
- `customer.subscription.trial_will_end` - Trial ending soon
- `customer.subscription.trial_ended` - Trial ended

## 🧪 Testing Your Webhook

### 1. Test Server Health
```bash
curl http://localhost:3001/health
```

### 2. Test Stripe Connection
```bash
curl http://localhost:3001/test-webhook
```

### 3. Trigger Test Events
```bash
# In a new terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## 🔍 Monitoring Webhook Events

### Real-time Logs
Your server will show detailed logs for each event:
```
✅ Webhook event received: checkout.session.completed
📋 Event ID: evt_1234567890abcdef
🛒 Checkout completed: cs_1234567890abcdef
👤 Customer: customer@example.com
📅 Subscription: sub_1234567890abcdef
🔄 Updating subscription for: customer@example.com
🏷️ Price ID: price_pro_monthly
📊 Tier: Pro
👤 User found: 123e4567-e89b-12d3-a456-426614174000
✅ Subscription updated successfully for user: 123e4567-e89b-12d3-a456-426614174000
```

### Check Database Updates
After each webhook, verify your Supabase tables are updated:
- `user_subscriptions` - Subscription status and details
- `profiles` - User information

## 🚨 Troubleshooting

### Common Issues

#### 1. "Webhook signature verification failed"
- Check your `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Ensure you're using the raw body middleware

#### 2. "Error finding user"
- Verify user exists in `profiles` table
- Check email matches exactly

#### 3. "Error updating subscription"
- Verify `user_subscriptions` table exists
- Check table schema matches expected fields

#### 4. Stripe connection errors
- Verify `STRIPE_SECRET_KEY` is correct
- Check if key has proper permissions

### Debug Mode
Add more logging by setting:
```env
LOG_LEVEL=debug
```

## 📊 Database Schema Requirements

### Required Tables

#### `profiles`
```sql
id: uuid (primary key)
email: text (unique)
name: text
created_at: timestamp
```

#### `user_subscriptions`
```sql
id: uuid (primary key)
user_id: uuid (references profiles.id)
tier_id: integer
stripe_sub_id: text
stripe_customer_id: text
status: text
pages_remaining: integer
pages_used: integer
current_period_start: timestamp
current_period_end: timestamp
created_at: timestamp
updated_at: timestamp
```

#### `subscription_tiers`
```sql
id: integer (primary key)
name: text
monthly_pages: integer
price: decimal
```

## 🔄 Production Deployment

### 1. Update Webhook URL
In Stripe Dashboard:
- Go to Developers → Webhooks
- Update endpoint URL to your production domain
- Copy the new webhook secret

### 2. Environment Variables
Set production environment variables:
```env
STRIPE_SECRET_KEY=sk_live_...your_live_key
STRIPE_WEBHOOK_SECRET=whsec_...your_production_webhook_secret
SUPABASE_URL=https://...your_production_supabase
SUPABASE_SERVICE_ROLE_KEY=...your_production_service_role_key
NODE_ENV=production
```

### 3. SSL/HTTPS
Ensure your production endpoint uses HTTPS (Stripe requirement).

## 📈 Scaling Considerations

### 1. Webhook Retry Logic
Stripe automatically retries failed webhooks, but consider implementing:
- Idempotency checks
- Dead letter queues for failed events
- Event deduplication

### 2. Database Performance
- Add indexes on frequently queried fields
- Consider read replicas for high-traffic scenarios
- Implement connection pooling

### 3. Monitoring
- Set up alerts for webhook failures
- Monitor response times
- Track event processing success rates

## 🎯 Next Steps

1. **Test with real payments** using Stripe test cards
2. **Implement email notifications** for key events
3. **Add analytics** to track subscription metrics
4. **Set up monitoring** and alerting
5. **Implement webhook retry logic** for production

## 📚 Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)
