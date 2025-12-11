# Loophole Dashboard

The centralized hub for managing your development tunnels. Built with Next.js, Tailwind CSS, and Shadcn/UI.

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## Features
- **Real-time Sync**: Uses Supabase Realtime to show tunnel status updates instantly.
- **Teams**: Create workspace, invite members (RLS secured).
- **Billing**: Stripe integration for Pro upgrades.
