# Loophole

**Loophole** is a developer tool that eliminates "link fatigue" by transforming ephemeral localhost URLs into a persistent, real-time dashboard.

## 🌟 Features
- **Instant Tunnels**: Expose localhost ports to the internet in seconds.
- **Hub & Spoke Dashboard**: View all your running tunnels in one place.
- **Teams**: Collaborate with teammates and share persistent development environments.
- **Real-time Status**: Live heartbeats and status indicators.

## 🚀 Getting Started

This repository contains the full source code for Loophole.

- **`/cli`**: The Node.js Command Line Interface.
- **`/web`**: The Next.js Web Dashboard.
- **`/supabase`**: Database migrations and configuration.

### Prerequisites
- Node.js 18+
- Supabase Project (for DB & Realtime)

### Running Locally

1. **Setup Database**: Run migrations in `/supabase/migrations`.
2. **Setup CLI**:
   ```bash
   cd cli
   npm install
   # Configure .env
   npm link # Optional, to run 'loophole' globally
   ```
3. **Setup Web**:
   ```bash
   cd web
   npm install
   # Configure .env.local
   npm run dev
   ```

## 📄 License
MIT
