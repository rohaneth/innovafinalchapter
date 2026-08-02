# Jira Integration Setup Guide

This document explains how the Jira Webhook integration is set up in this Next.js application, and how to configure it for local development or production.

## 1. Architecture Overview
This application listens for real-time updates from Jira via **Webhooks**. 
When a ticket is created or updated in Jira, Jira sends an HTTP POST request to our `/api/webhooks/jira` endpoint.

The endpoint extracts the ticket description and the Assignee's name, creates an `EvidenceChunk`, and stores it in the Postgres vector database so the AI Agent can use it for performance reviews.

## 2. Local Development Routing (The Tunnel)
Jira runs in the cloud and cannot send POST requests directly to `http://localhost:3000`. To fix this, you must run a "tunnel" that gives your local server a public URL.

We recommend using **Smee.io** because it doesn't have security bypass screens that block webhooks (unlike localtunnel or ngrok free tiers).

**To start the tunnel:**
1. Go to [smee.io](https://smee.io/) and click "Start a new channel".
2. Copy the "Webhook Proxy URL" (e.g., `https://smee.io/YourCustomChannel`).
3. In your terminal, run the Smee client to forward traffic to your local Next.js server:
   ```bash
   npx smee-client --url https://smee.io/YourCustomChannel --target http://localhost:3000/api/webhooks/jira?secret=YOUR_SECRET
   ```
   *(Make sure your local Next.js app is running on port 3000!)*

## 3. Configuring the Webhook in Jira
You must tell Jira where to send the events.

1. Go to your Jira Project or Jira Admin Settings.
2. Search for **WebHooks** (System -> Webhooks).
3. Click **Create a WebHook**.
4. **Name:** `AI Review Sync`
5. **URL:** Paste your Smee proxy URL here (`https://smee.io/YourCustomChannel`).
   *(If deploying to production, paste your real production URL here: `https://your-domain.com/api/webhooks/jira?secret=YOUR_SECRET`)*
6. **Events:** Under "Issue related events", check the boxes for:
   - `created`
   - `updated`
7. Scroll to the bottom and click **Save**.

## 4. How Data is Mapped to Employees
When a webhook hits the system, the app tries to figure out whose performance review the ticket belongs to:

1. It reads `issue.fields.assignee.displayName` from the Jira payload.
2. It queries the local Postgres database (`User` table) for a name that matches.
3. **Fallback Mechanism:** If the Jira account name does not exactly match any seeded employee in the database, the code automatically assigns the ticket to the **very first Employee** it finds in the database (usually *Sarah Chen* or *Alex Vance* depending on the seeder).
4. This ensures that during local testing with dummy data, your tickets never get lost and will always show up in the UI!

## 5. Environment Variables
Make sure your `.env` file has the following secret. This ensures that only requests with the matching secret in the URL query string are accepted by the app.

```env
JIRA_WEBHOOK_SECRET="my-super-secret-123"
```
