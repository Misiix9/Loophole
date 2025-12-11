# 🟢 Loophole: Maximum Setup Guide

Welcome to **Loophole**, your own self-hosted tunnel hub.
Follow this guide to get the entire platform (CLI, Web Dashboard, Database, Payments) running in 10 minutes.

---

## 1. Prerequisites 🛠️

Before you start, ensure you have:
- [Node.js 18+](https://nodejs.org/) installed.
- A [Supabase](https://supabase.com/) project (Free tier is fine).
- A [Stripe](https://stripe.com/) account (for monetization).

---

## 2. Database Setup (Supabase) 🗄️

You need to apply the database schema.
1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Copy and run the contents of the following files in order:

| Order | File | Purpose |
| :--- | :--- | :--- |
| 1️⃣ | [00_init_teams.sql](file:///c:/Users/Administrator/Documents/Programming/Projects/Loophole/supabase/migrations/00_init_teams.sql) | Creates `teams` table (Required for tunnels). |
| 2️⃣ | [01_init_tunnels.sql](file:///c:/Users/Administrator/Documents/Programming/Projects/Loophole/supabase/migrations/01_init_tunnels.sql) | Creates `tunnels` table. |
| 3️⃣ | [02_add_subscriptions.sql](file:///c:/Users/Administrator/Documents/Programming/Projects/Loophole/supabase/migrations/02_add_subscriptions.sql) | Adds Stripe subscription fields. |

> [!TIP]
> **API Credentials**: Go to **Project Settings** -> **API**.
> Copy your `Project URL`, `anon public` key, and `service_role` key. You will need them next.

---

## 3. Web Dashboard Setup 🖥️

1.  Navigate to the web directory:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Create a file named `.env.local`.
    - Copy the keys below and fill in your values.

    ```env
    # .env.local

    # Supabase (From Step 2)
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

    # Stripe (Get these from Stripe Dashboard -> Developers -> API Keys)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

4.  Start the Dashboard:
    ```bash
    npm run dev
    ```
    > 🌐 Visit [http://localhost:3000](http://localhost:3000)

---

## 4. CLI Setup 💻

1.  Open a new terminal and navigate to the CLI directory:
    ```bash
    cd cli
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Create a file named `.env`.
    - Needs the **Service Role** key to register tunnels.

    ```env
    # .env

    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```
    > [!CAUTION]
    > Never share your `SERVICE_ROLE_KEY` on the client-side (Web). It is only for the CLI/Backend.

4.  Link the CLI globally (Optional but recommended):
    ```bash
    npm link
    ```

---

## 5. Running End-to-End 🚀

Now for the magic moment.

1.  **Start a local server** (e.g., your Web Dashboard is already on 3000).
2.  **Open the Dashboard** at `http://localhost:3000/dashboard`.
3.  **Run the Loophole CLI**:
    ```bash
    # If using npm link
    loophole start 3000

    # Or directly via node
    node bin/index.js start 3000
    ```

### What should happen?
1.  The CLI will print a **Green Box** with your public URL (e.g., `https://funny-cat.loca.lt`).
2.  The CLI will say `(Sync active)`.
3.  **Look at your Web Dashboard**: The new tunnel should appear **instantly** in the list with a pulsing green "Online" status! ✨

---

## 6. Setup Webhooks (Crucial for Payments) 🪝

To actually update your database when a payment happens, you need Webhooks.

### Option A: Local Development (Recommended)
1.  Download the [Stripe CLI](https://docs.stripe.com/stripe-cli).
2.  Login: `stripe login`
3.  Start forwarding events:
    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```
4.  It will print a **Webhook Signing Secret** (starts with `whsec_...`).
5.  Copy this key and paste it into your `web/.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Option B: Production (When deployed)
1.  Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks).
2.  Click **Add Endpoint**.
3.  **Endpoint URL**: `https://your-app-url.vercel.app/api/webhooks/stripe`
4.  **Select Events**:
    - `checkout.session.completed`
    - `invoice.payment_succeeded`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
5.  Click **Add endpoint**.
6.  Reveal the **Signing secret** (top right) and add it to your Production Environment Variables.

---

## 7. Testing Payments (Stripe) 💳

1.  Go to `http://localhost:3000/dashboard`.
2.  Create a **Team** (Sidebar -> Create Team).
3.  Switch to the Team view.
4.  Click the **Upgrade** button (or go to `/pricing`).
5.  Select a plan. You will be redirected to Stripe Checkout.
    > Note: Without real Stripe keys, this will show a "Stripe authentication failed" error, which confirms the integration is trying to connect.

---

## Troubleshooting 🔧

- **CLI says "Offline Mode"?**
  - Check `cli/.env`. The `SUPABASE_SERVICE_ROLE_KEY` might be missing or invalid.
- **Dashboard not updating?**
  - Check browser console. Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct.
  - Verify you ran `00_init_tunnels.sql`.

Enjoy **Loophole**! 🟢
