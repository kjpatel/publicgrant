# PublicGrant

AI-powered grant intelligence platform for nonprofits, school districts, and public agencies. Discover federal and foundation funding opportunities, analyze your eligibility with AI, and draft proposals — all in one place.

## Features

- **Live Grant Discovery** — Syncs up to 10,000 open grants daily from the [Grants.gov API](https://grants.gov/api), plus curated state and foundation grants
- **AI Grant Analysis** — Claude summarizes RFP language into plain English, extracts eligibility criteria, and scores how well your organization fits each grant (0–100)
- **Organization Profiles** — Define your org type, mission, focus areas, location, and budget so the AI can personalize recommendations
- **AI Proposal Builder** — Generate full proposal drafts section by section (narrative, statement of need, methods, budget justification, and more) using Claude
- **Grant Matching** — Fit scores and match reasons are cached per org so you can quickly triage your pipeline

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login, signup
│   ├── (dashboard)/
│   │   ├── dashboard/           # Home dashboard
│   │   ├── grants/              # Grant list, detail, AI analysis
│   │   ├── proposals/           # Proposal list and editor
│   │   └── org/                 # Organization profile
│   └── api/
│       └── sync-grants/         # Cron endpoint for Grants.gov sync
├── lib/
│   ├── grants-gov/              # Grants.gov API client and sync logic
│   ├── supabase/                # Browser, server, and admin clients
│   └── ai/                      # Anthropic client and prompts
├── types/
│   └── database.ts              # Shared TypeScript types
supabase/
├── migrations/                  # Database schema and indexes
└── seed.sql                     # Sample grant data for local dev
```

## Getting Started

### Prerequisites

Install the following via Homebrew:

```bash
brew install node@22                  # Node.js runtime
brew install supabase/tap/supabase    # Supabase CLI
brew install --cask docker            # Docker Desktop (required by Supabase CLI)
```

You'll also need an [Anthropic API key](https://console.anthropic.com/).

### 1. Clone and install

```bash
git clone https://github.com/kjpatel/publicgrant.git
cd publicgrant
npm install
```

### 2. Start local Supabase

```bash
supabase start
```

This spins up a local PostgreSQL instance, Auth server, and Studio UI at `http://localhost:54323`.

### 3. Apply database migrations

```bash
supabase migration up --include-all
```

### 4. Configure environment variables

Copy the values printed by `supabase start` into `.env.local`:

```env
# Supabase (local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>

# Anthropic
ANTHROPIC_API_KEY=<your key from console.anthropic.com>

# Cron job secret (protects /api/sync-grants)
CRON_SECRET=<any random secret, e.g. openssl rand -hex 32>
```

### 5. (Optional) Seed sample grants

```bash
supabase db reset
```

This runs migrations and loads `supabase/seed.sql` with 14 sample grants.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Grants.gov Sync

Grants are pulled live from the [Grants.gov search2 API](https://grants.gov/api/common/search2) — no API key required.

**Manual sync** — click "Sync from Grants.gov" on the `/grants` page.

**Automated sync** — a Vercel Cron job hits `GET /api/sync-grants` daily at 6 AM UTC. The endpoint requires an `Authorization: Bearer <CRON_SECRET>` header.

You can also trigger it manually:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/sync-grants
```

The sync fetches up to 10,000 open grants in pages of 100, upserts them by `(source, source_id)`, and preserves any cached AI analysis on existing records.

## Database Schema

```
organizations   — user org profiles (type, mission, focus areas, budget)
grants          — funding opportunities (source, agency, deadline, categories)
grant_matches   — AI fit scores between an org and a grant (0–100)
proposals       — draft proposals with AI-generated sections
```

Row-Level Security is enabled on all tables. Users can only access their own organization's data; grants are readable by all authenticated users.

## Deployment

### Vercel

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables from `.env.local` under **Settings → Environment Variables**
3. The `vercel.json` cron config is picked up automatically — verify under **Settings → Cron Jobs**

### Supabase (production)

1. Create a project at [supabase.com](https://supabase.com)
2. Push migrations: `supabase db push`
3. Update `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel with the production values
