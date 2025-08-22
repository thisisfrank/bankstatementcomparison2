# Database Schema Documentation

This directory contains the database migration files that define the current working schema.

## Current Working Schema

The application uses a streamlined, efficient database design that stores all necessary data in focused tables.

### **Tables in Use:**

1. **`profiles`** - User profiles and admin status
   - `id` - Primary key (UUID)
   - `email` - User email address
   - `full_name` - User's full name
   - `is_admin` - Admin privileges flag
   - `created_at`, `updated_at` - Timestamps

2. **`subscription_tiers`** - Available pricing plans
   - `id` - Primary key (Serial)
   - `name` - Tier name (Free, Pro, Business)
   - `monthly_price` - Price in cents
   - `monthly_pages` - Pages included per month

3. **`user_subscriptions`** - User subscription management
   - `id` - Primary key (UUID)
   - `user_id` - References auth.users
   - `tier_id` - References subscription_tiers
   - `stripe_sub_id` - Stripe subscription ID
   - `status` - Subscription status
   - `pages_used`, `pages_remaining` - Page tracking

4. **`usage_logs`** - Comparison history and analytics
   - `id` - Primary key (UUID)
   - `user_id` - References auth.users
   - `statement1_name`, `statement2_name` - File names
   - `file1_pages`, `file2_pages` - Page counts
   - `pages_consumed` - Total pages used
   - `status` - Processing status
   - `comparison_summary` - JSONB comparison data
   - `created_at` - Timestamp

### **Key Features:**

- **Row Level Security (RLS)** enabled on all tables
- **Admin access** - Admins can view all user data
- **User privacy** - Users only see their own data
- **Efficient storage** - All comparison data in one table
- **Proper indexing** - Optimized for common queries

### **Security Policies:**

- Users can only access their own data
- Admins can view all data across all users
- Subscription tiers are read-only for authenticated users
- All operations require proper authentication

### **Performance Optimizations:**

- Indexes on frequently queried columns
- JSONB storage for flexible comparison data
- Efficient foreign key relationships
- Updated timestamp triggers for data integrity

## Migration Status

- **`20241201000000_initial_schema.sql`** - Current working schema (updated)
- This migration reflects the actual database structure in use

## Notes

- The previous migration file contained unused tables that were removed
- The current schema is optimized for the actual application needs
- All functionality (history, admin, subscriptions) works with this streamlined design
