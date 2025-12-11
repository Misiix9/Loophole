# Master Plan: Loophole

**Loophole** is a SaaS platform that eliminates "link fatigue" for development teams. It transforms ephemeral localhost URLs into a persistent, real-time dashboard, allowing teams to "peek" at each other's local environments instantly.

> **Tagline:** "Stop pasting links. Start collaborating. Your team's localhost, synchronized."

---

## 1. High-Level Architecture

The system follows a "Hub and Spoke" architecture.

* **The Hub (Dashboard):** A Next.js application hosted on Vercel. It acts as the "Mission Control" showing who is online.
* **The Spokes (CLI Tools):** A Node.js CLI (`npx loophole`) running on developer laptops. It creates the tunnel and reports status to the Hub.
* **The Brain (Database):** Supabase (PostgreSQL) stores user state, handles Realtime subscriptions, and tracks subscription status.
* **The Cash Register (Payments):** Stripe handles all billing, invoicing, and subscription state management.

### Core Workflow
1.  Developer runs `npx loophole start 3000`.
2.  CLI checks subscription status via Supabase.
3.  CLI opens a localtunnel connection (Random URL for Free, Reserved Subdomain for Pro).
4.  CLI updates Supabase: *"Alice is online at alice-api.localtunnel.me"*.
5.  Dashboard (subscribed to Supabase) instantly updates Alice's row to Green.

---

## 2. Branding & Identity

* **Name:** Loophole
* **Concept:** A "shortcut" through the firewall. A clever way to connect.
* **Vibe:** Hacker-chic, professional but developer-focused.

### Visual Identity
* **Primary Color:** `#10B981` (Emerald Green - Signals "Online/Go").
* **Secondary Color:** `#6366F1` (Indigo - Signals "Cloud/Sync").
* **Background:** `#0F172A` (Slate 900 - Deep Dark Mode).
* **Font:** Inter (UI) + JetBrains Mono (Code/CLI).
* **Logo:** A stylized keyhole turning into an infinity loop.

### Voice & Tone
* **Concise:** No fluff. Developers don't read paragraphs.
* **Technical:** Use correct terms (Port, TCP, Socket).
* **Playful:** "Digging tunnel...", "Collapsed tunnel.", "Peeking at localhost."

---

## 3. Tech Stack

* **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React (Icons), Shadcn/UI (Components).
* **Backend/DB:** Supabase (Auth, Database, Realtime, Edge Functions).
* **CLI:** Node.js, commander (flags), localtunnel (tunneling), conf (config), axios (API), chalk (colors), boxen (UI).
* **Payments:** Stripe (Checkout, Webhooks, Customer Portal).
* **Email:** Resend.com (Transactional emails).

---

## 4. Database Schema

These tables are required in Supabase.

### `profiles` (Extends Supabase Auth)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | References auth.users.id |
| `username` | String | Unique handle (e.g., @alice) |
| `avatar_url` | String | URL to profile picture |
| `email_notifications` | Boolean | Default: true |
| `stripe_customer_id` | String | Links to Stripe Customer |
| `subscription_tier` | String | 'free', 'pro', 'enterprise' |
| `subscription_status` | String | 'active', 'past_due', 'canceled', 'trialing' |

### `teams`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique Team ID |
| `name` | String | e.g., "Frontend Team" |
| `owner_id` | UUID | References profiles.id |
| `created_at` | Timestamp | Creation date |
| `slug` | String | Unique URL slug (loophole.dev/teams/stripe) |

### `team_members`
| Column | Type | Description |
| :--- | :--- | :--- |
| `team_id` | UUID | References teams.id |
| `user_id` | UUID | References profiles.id |
| `role` | String | 'admin' or 'member' |

### `tunnels` (The Core Table)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique Tunnel ID |
| `user_id` | UUID | Owner of the tunnel |
| `team_id` | UUID (Nullable) | Null if "Personal Workspace" |
| `project_name` | String | e.g., "API Backend" |
| `current_url` | String | The live localtunnel URL |
| `status` | String | 'online', 'offline' |
| `privacy` | String | 'private', 'team', 'public' |
| `last_heartbeat` | Timestamp | Used to detect offline status |
| `reserved_subdomain` | String (Nullable) | Paid Feature: e.g., "my-company-api" |

### `tunnel_shares` (Individual Sharing)
| Column | Type | Description |
| :--- | :--- | :--- |
| `tunnel_id` | UUID | References tunnels.id |
| `shared_with_user_id` | UUID | Who can see it |
| `status` | String | 'pending', 'accepted', 'rejected' |

### `audit_logs` (Security & History)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique Log ID |
| `user_id` | UUID | Who performed the action |
| `action` | String | 'tunnel_start', 'tunnel_stop', 'share', 'team_invite' |
| `metadata` | JSONB | Details (e.g., `{ "tunnel_url": "..." }`) |
| `created_at` | Timestamp | When it happened |

---

## 5. Monetization Strategy

The platform operates on a Freemium model designed to hook individual devs and upsell teams.

### Free Tier ($0/month)
* **Tunnels:** Random URLs (e.g., funny-dog-42.localtunnel.me).
* **Teams:** 1 Team max.
* **Members:** Up to 3 members per team.
* **History:** 24-hour audit log retention.
* **Restrictions:** URLs change every restart.

### Pro Tier ($15/month / user)
* **Tunnels:** Reserved Static Subdomains (e.g., my-startup-api.localtunnel.me).
* **Teams:** Unlimited Teams.
* **Members:** Unlimited members.
* **History:** 30-day audit log retention.
* **Priority:** Heartbeat check runs every 5s instead of 30s (Faster status updates).
* **Badge:** "Pro" badge on dashboard profile.

---

## 6. Payment Implementation (Stripe)

### A. The Setup
* **Product Creation:** Create "Loophole Pro" in Stripe.
* **Webhooks:** Configure Supabase Edge Function to listen for `checkout.session.completed` and `customer.subscription.updated`.

### B. The Upgrade Flow
1.  User clicks "Upgrade" -> `/api/billing/checkout`.
2.  Server creates Stripe Session -> Returns URL.
3.  User pays -> Stripe Webhook updates `profiles` table.
4.  User redirected to Dashboard -> Confetti explosion 🎊.

### C. Downgrade Logic
If `customer.subscription.deleted` fires:
1.  Set `subscription_tier` to 'free'.
2.  Nullify all `reserved_subdomain` values in `tunnels` table (Reverts to random URLs).

---

## 7. The CLI Workflow

### Authentication (Device Flow)
* **Command:** `npx loophole login`
* **CLI:** Requests a "Magic Link" from Supabase Edge Function.
* **CLI Output:**
    ```text
    ┌──────────────────────────────────────────────────┐
    │  🔑 Loophole Auth                                │
    │                                                  │
    │  Press ENTER to open your browser...             │
    │  Code: ABCD-1234                                 │
    └──────────────────────────────────────────────────┘
    ```
* **Browser:** Opens `loophole.dev/auth/cli?code=ABCD-1234`. User clicks "Approve".
* **Result:** CLI receives Session Token -> Saves to `~/.config/loophole/auth.json`.

### Starting a Tunnel
* **Command:** `npx loophole start 3000 --subdomain=my-api`
* **Logic:**
    1.  **Auth Check:** Validates token. Refreshes if expired.
    2.  **Subscription Check:** CLI calls `/api/cli/me`.
    3.  If tier == free AND subdomain is set -> Error: "Static domains are Pro only."
    4.  **Port Check:** Checks if 3000 is open.
    5.  **Tunnel:** Starts localtunnel.
    6.  **DB Update:** Sets status online.
* **UI:** Displays a persistent dashboard in the terminal (using ink or log-update).

    ```text
    🟢 Loophole: Online
    🔗 URL:      [https://my-api.localtunnel.me](https://my-api.localtunnel.me)
    📡 Port:     3000
    👥 Visibility: Team (Frontend)
    ```

---

## 8. Dashboard Specifications

### View Logic (Context Switcher)
**Top-left dropdown:**
* **Personal Workspace:** Shows tunnels owned by User.
* **Team Views:** Shows all tunnels belonging to Team A.

### The Tunnel Card Component
* **Status:** Green Pulse (Online) / Gray Ring (Offline).
* **Header:** Project Name.
* **URL:** Click-to-copy.
* **Metadata:** "Started 2h ago".
* **QR Code:** Hover trigger.
* **Share:** Opens modal to invite via email.

### Notifications
* **In-App:** Bell icon. "Bob shared 'Finance API' with you."
* **Email:** Resend template: "Join Alice's tunnel on Loophole."

---

## 9. Security Rules (Row Level Security)

### SELECT (Read):
* Owner (`auth.uid() == user_id`).
* Team Member (`team_id` matches user's teams).
* Direct Share (`auth.uid()` in `tunnel_shares`).
* Public (`privacy == 'public'`).

### INSERT (Create):
* Authenticated users only.

### UPDATE (Edit):
* Owner only.

### DELETE:
* Owner only.

---

## 10. Project Structure

/loophole-monorepo
├── /web                # Next.js Dashboard
│   ├── /app            # App Router
│   │   ├── /api        # API Routes (Stripe, CLI)
│   │   ├── /dashboard  # Main App UI
│   │   └── /login      # Auth Pages
│   ├── /components     # Shadcn UI
│   ├── /lib            # Supabase/Stripe Clients
│   └── package.json
├── /cli                # Node.js Tool
│   ├── /bin            # Executable entry
│   ├── /src
│   │   ├── commands    # start.js, login.js
│   │   ├── ui          # Terminal UI rendering
│   │   └── utils       # tunnel.js, api.js
│   └── package.json
└── README.md

---

## 11. Implementation Phases

### Phase 1: Hello World (CLI)

        * Create CLI. Implement localtunnel. Print random URL.

### Phase 2: The Foundation (DB & Web)

        * Initialize Supabase.

        * Build Login & Dashboard skeleton.

### Phase 3: The Connection

        * CLI writes to Supabase.

        * Dashboard updates via Realtime.

### Phase 4: Teams & Sharing

        * Build "Create Team" UI.

        * Implement RLS policies.

### Phase 5: Monetization (Stripe)

        * Set up Stripe Products.

        * Build Checkout endpoints.

        * Gate --subdomain feature in CLI.

### Phase 6: Polish & Security

        * Add Resend emails.

        * Add CLI ASCII art using ink.

        * Implement Rate Limiting on API routes.

        * Add "Public Tunnel" security warning in CLI.

### Phase 7: Testing & QA

        * Write Unit tests for CLI commands (using jest).

        * Write E2E tests for Dashboard flows (using playwright).

        * Load test Supabase Realtime with 10+ simulated CLI clients.

### Phase 8: DevOps & Infrastructure

        * Configure GitHub Actions for CI/CD (Auto-publish CLI to npm).

        * Set up Vercel production deployment (Environment Variables).

        * Configure Supabase Database backups (Point-in-Time Recovery).

### Phase 9: Launch Prep

        * Build Marketing Landing Page (separate from App Dashboard).

        * Write Documentation (Installation, Usage, Troubleshooting).

        * Draft Legal Docs (Terms of Service, Privacy Policy).

### Phase 10: Post-Launch

        * Integrate Analytics (PostHog) to track active users/tunnels.

        * Set up Customer Support channel (Discord/Intercom).

        * Collect Feedback for Roadmap planning.