# Loophole Web Setup

## Environment Key Setup

To execute the payment flow correctly, you need to set up the following environment variables in `.env.local` (create this file):

```env
# Supabase (Get these from your Supabase Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Get these from Stripe Dashboard -> Developers -> API Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (From Webhooks section)

# Stripe Products (Create Products in Stripe Dashboard and copy Price IDs)
# Create a "Creator" product ($9) and copy the Price ID (starts with price_)
STRIPE_PRICE_ID_CREATOR=price_...
# Create a "Startup" product ($29) and copy the Price ID
STRIPE_PRICE_ID_STARTUP=price_...

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

## Mock Mode
If you do not provide a valid `STRIPE_SECRET_KEY` (starting with `sk_`), the payment flow will automatically simulate a successful transaction for testing purposes.
