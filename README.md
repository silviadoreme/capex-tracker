# Web app from document

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/silvia-9172s-projects/v0-web-app-from-document)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/OPDPD9bKwNT)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/silvia-9172s-projects/v0-web-app-from-document](https://vercel.com/silvia-9172s-projects/v0-web-app-from-document)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/OPDPD9bKwNT](https://v0.dev/chat/projects/OPDPD9bKwNT)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Development

### Supabase Setup (macOS)

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Start Supabase locally:
```bash
supabase start
```
This will start all necessary Docker containers for Supabase services.

3. Initialize your database:
```bash
supabase db reset
```
This will run all the migration scripts in your project.

### Environment Variables

Copy the `.env.example` file to `.env.local` in the root directory to create your environment variables file.
NEXT_PUBLIC_SUPABASE_ANON_KEY - can be found in `supabase status` output, under `anon key`
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET - check with your collegues or on slack 

```env
# Supabase Configuration
# Local Development (Docker)

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=-- you can find this in subabase status output ---- 

# For Production, replace these with your Supabase project values
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Node Environment
NODE_ENV=development

# # Optional: Next.js Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000/api
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000

# Optional: Deployment URLs (if needed)
# VERCEL_URL=your-project.vercel.app
# NEXT_PUBLIC_VERCEL_URL=your-project.vercel.app

SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=....
```

