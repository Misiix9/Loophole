# Stripe Setup Guide for Loophole

This guide walks you through setting up Stripe payments for the Loophole subscription system.

## 📋 Overview

Loophole uses Stripe for:
- **Subscription billing** (Creator $9/mo, Startup $29/mo)
- **Webhook handling** for payment confirmation
- **Customer management**

---

## 1️⃣ Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete the onboarding (you can skip business verification for testing)
3. Make sure you're in **Test Mode** (toggle in top-right of dashboard)

---

## 2️⃣ Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Copy these keys:

| Key | Description | Example |
|-----|-------------|---------|
| **Publishable key** | Public, used in frontend | `pk_test_xxx...` |
| **Secret key** | Private, used in backend | `sk_test_xxx...` |

---

## 3️⃣ Create Products and Prices

### Go to Stripe Dashboard → Products → Add Product

#### Product 1: Creator Plan
- **Name**: Creator
- **Description**: For serious developers and freelancers
- Click **Add Product**
- Add a **Price**:
  - **Pricing model**: Recurring
  - **Amount**: $9.00 USD
  - **Billing period**: Monthly
- Click **Add Price** and **Save**
- **Copy the Price ID** (starts with `price_xxx`)

#### Product 2: Startup Plan
- **Name**: Startup
- **Description**: For small teams building next-gen apps
- Click **Add Product**
- Add a **Price**:
  - **Pricing model**: Recurring
  - **Amount**: $29.00 USD
  - **Billing period**: Monthly
- Click **Add Price** and **Save**
- **Copy the Price ID** (starts with `price_xxx`)

---

## 4️⃣ Set Up Webhook

Webhooks tell your app when payments succeed or subscriptions change.

### For Local Development (using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # Arch Linux (AUR)
   yay -S stripe-cli
   # or with paru:
   paru -S stripe-cli
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Ubuntu/Debian
   curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
   sudo apt update && sudo apt install stripe
   
   # Windows (with scoop)
   scoop install stripe
   
   # Alternative: Direct download (any Linux)
   curl -L https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz | tar -xz
   sudo mv stripe /usr/local/bin/
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** from the CLI output (starts with `whsec_xxx`)

### For Production

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Select events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. **Copy the Signing secret** from the webhook details page

---

## 5️⃣ Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (from Step 3)
STRIPE_PRICE_ID_CREATOR=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_STARTUP=price_xxxxxxxxxxxxxxxxxxxxx
```

---

## 6️⃣ Test the Integration

### Test Card Numbers

Stripe provides test card numbers for development:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0002` | Declined (generic) |

**Expiry**: Any future date (e.g., `12/34`)
**CVC**: Any 3 digits (e.g., `123`)
**ZIP**: Any 5 digits (e.g., `12345`)

### Test Flow

1. **Start your dev server**: `npm run dev`
2. **Start Stripe webhook forwarding** (if testing locally):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. **Sign up and select a paid plan**
4. **Complete checkout with test card** `4242 4242 4242 4242`
5. **Verify in Stripe Dashboard** → Customers that subscription was created
6. **Verify in Supabase** → profiles table that user has correct `plan_tier`

---

## 7️⃣ Go Live Checklist

When ready for production:

1. ☐ Toggle to **Live Mode** in Stripe Dashboard
2. ☐ Get **Live API Keys** (they start with `sk_live_` and `pk_live_`)
3. ☐ Create **Live Products and Prices** (or copy from test mode)
4. ☐ Create **Live Webhook** endpoint
5. ☐ Update `.env.production` with live keys
6. ☐ Test with a real card (refund after)
7. ☐ Complete Stripe business verification

---

## 🔧 Troubleshooting

### "No such price" error
- Make sure you copied the Price ID correctly
- Check that you're using test keys with test prices (or live with live)

### Webhook not receiving events
- For local dev: Make sure `stripe listen` is running
- For production: Check webhook URL is correct and publicly accessible
- Check the webhook signing secret matches

### Payment succeeds but plan not updated
- Check Supabase admin client is configured correctly
- Check webhook is receiving `checkout.session.completed` event
- Check user ID is in webhook metadata

### Mock Mode (no Stripe key)
If `STRIPE_SECRET_KEY` doesn't start with `sk_`, the app runs in mock mode:
- Selecting a paid plan immediately updates the database
- No actual Stripe checkout occurs
- Good for quick testing without Stripe setup

---

## 📁 Related Files

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe client initialization |
| `lib/plans.ts` | Plan configuration and limits |
| `app/api/checkout/route.ts` | Creates checkout sessions |
| `app/api/webhooks/stripe/route.ts` | Handles Stripe events |
| `components/auth/auth-modal.tsx` | Plan selection UI |

---

## 🆘 Need Help?

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Next.js + Stripe Guide](https://stripe.com/docs/checkout/quickstart?client=next)
