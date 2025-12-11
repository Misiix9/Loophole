# OAuth Configuration Guide (2025 Edition)

This guide provides the exact steps and links to configure GitHub and Google authentication for **Loophole** (`https://loophole.run`).

## 1. Supabase Setup (Prerequisite)

First, you need to tell Supabase where to redirect users after they log in.

1.  Open your [Supabase Dashboard](https://supabase.com/dashboard/projects).
2.  Click on your **Loophole** project.
3.  On the left sidebar, click **Authentication**.
4.  Look under the **CONFIGURATION** section and click **URL Configuration**.
5.  In the **Site URL** field, enter: `https://loophole.run`
6.  In the **Redirect URLs** section, click **Add URL** and enter: 
    *   `https://loophole.run/auth/callback`
    *   `http://localhost:3000/auth/callback` (Keep this for local testing!)
7.  Click **Save**.

---

## 2. GitHub Authentication

**Direct Link:** [Register a new OAuth application](https://github.com/settings/applications/new)

1.  Go to the link above (or navigate to Settings -> Developer settings -> OAuth Apps -> New OAuth App).
2.  Fill in the form exactly as follows:
    *   **Application name**: `Loophole`
    *   **Homepage URL**: `https://loophole.run`
    *   **Authorization callback URL**: 
        *   *Go back to your Supabase tab.*
        *   *Under **CONFIGURATION**, click **Sign In / Providers**.*
        *   *Click on **GitHub** to expand it.*
        *   *Copy the **Callback URL (for OAuth)** shown there (it looks like `https://abcdefg.supabase.co/auth/v1/callback`).*
        *   *Paste that URL here.*
3.  Click **Register application**.
4.  On the next screen, you will see your **Client ID**. Copy it.
5.  Click **Generate a new client secret**. Copy the **Client Secret**.
6.  Go back to **Supabase** -> **Sign In / Providers** -> **GitHub**.
7.  Paste the **Client ID** and **Client Secret**.
8.  Toggle **Enable GitHub**.
9.  Click **Save**.

---

## 3. Google Authentication

**Direct Link:** [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

1.  Go to the link above.
2.  Make sure you have a project selected (top left). If not, click **Create Project**, name it `Loophole`, and create it.
3.  Click **+ CREATE CREDENTIALS** (top center) -> Select **OAuth client ID**.
    *   *(If it asks you to "Configure Consent Screen" first: Click it -> Select **External** -> Create -> App Name: `Loophole` -> Support Email: Select yours -> Developer Email: Select yours -> Save & Continue until finished -> Go back to step 3)*.
4.  **Application type**: Select **Web application**.
5.  **Name**: `Loophole Web`
6.  **Authorized JavaScript origins**:
    *   Click **ADD URI**.
    *   Enter: `https://loophole.run`
    *   Click **ADD URI** again.
    *   Enter: `http://localhost:3000` (For local testing)
7.  **Authorized redirect URIs**:
    *   Click **ADD URI**.
    *   *Paste the same Supabase Callback URL you used for GitHub.*
    *   *(Find it in Supabase -> **Sign In / Providers** -> **Google**)*.
8.  Click **CREATE**.
9.  A popup will show your **Client ID** and **Client Secret**. Copy them.
10. Go back to **Supabase** -> **Sign In / Providers** -> **Google**.
11. Paste the **Client ID** and **Client Secret**.
12. Toggle **Enable Google**.
13. Click **Save**.

---

## 4. Verification

1.  Restart your local server: `npm run dev`
2.  Go to [http://localhost:3000](http://localhost:3000)
3.  Click **Sign In** -> **GitHub** or **Google**.
4.  It should redirect you to the provider, ask for permission, and send you back to the Dashboard as a logged-in user.
