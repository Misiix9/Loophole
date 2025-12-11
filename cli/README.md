# Loophole CLI

The command-line companion for the Loophole platform.

## Installation

```bash
npm install -g loophole-cli
```

## Usage

### Start a Tunnel

Expose your local server (e.g., running on port 3000):

```bash
loophole start 3000
```

This will:
1. Generate a public URL (e.g., `https://random-name.loca.lt`).
2. Register the tunnel in your Loophole Dashboard.
3. Keep the session alive until you exit (`Ctrl+C`).

### Options
- `loophole start 3000 --subdomain my-app` (Request custom subdomain - Pro feature)

## Configuration

The CLI requires Supabase credentials to sync with the dashboard. Create a `.env` file in the installation directory or ensure environment variables are set:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```
