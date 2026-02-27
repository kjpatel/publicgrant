-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Organizations
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null, -- nonprofit, school_district, municipality, public_health, other
  mission text,
  location text, -- state/region
  annual_budget numeric,
  focus_areas text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Grant opportunities
create table grants (
  id uuid primary key default uuid_generate_v4(),
  source text not null, -- grants_gov, state, foundation
  source_id text,
  title text not null,
  agency text,
  description text,
  eligibility_raw text,
  eligibility_parsed jsonb default '{}',
  amount_min numeric,
  amount_max numeric,
  deadline timestamptz,
  posted_date timestamptz,
  category text[] default '{}',
  status text default 'open', -- open, closed, upcoming
  source_url text,
  ai_summary text,
  created_at timestamptz default now()
);

-- Match scores between org and grant
create table grant_matches (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  grant_id uuid not null references grants(id) on delete cascade,
  fit_score numeric not null default 0, -- 0-100
  match_reasons jsonb default '[]',
  disqualifiers jsonb default '[]',
  created_at timestamptz default now(),
  unique(org_id, grant_id)
);

-- Proposal drafts
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  grant_id uuid not null references grants(id) on delete cascade,
  title text not null,
  status text default 'draft', -- draft, review, submitted
  sections jsonb default '{}',
  ai_suggestions jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table organizations enable row level security;
alter table grant_matches enable row level security;
alter table proposals enable row level security;
alter table grants enable row level security;

-- Policies: users can only access their own org data
create policy "Users can view own organizations"
  on organizations for select
  using (auth.uid() = user_id);

create policy "Users can insert own organizations"
  on organizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own organizations"
  on organizations for update
  using (auth.uid() = user_id);

-- Grants are readable by all authenticated users
create policy "Authenticated users can view grants"
  on grants for select
  to authenticated
  using (true);

-- Grant matches: users can only see matches for their orgs
create policy "Users can view own grant matches"
  on grant_matches for select
  using (org_id in (select id from organizations where user_id = auth.uid()));

create policy "Users can insert own grant matches"
  on grant_matches for insert
  with check (org_id in (select id from organizations where user_id = auth.uid()));

-- Proposals: users can only access proposals for their orgs
create policy "Users can view own proposals"
  on proposals for select
  using (org_id in (select id from organizations where user_id = auth.uid()));

create policy "Users can insert own proposals"
  on proposals for insert
  with check (org_id in (select id from organizations where user_id = auth.uid()));

create policy "Users can update own proposals"
  on proposals for update
  using (org_id in (select id from organizations where user_id = auth.uid()));

-- Indexes for common queries
create index idx_organizations_user_id on organizations(user_id);
create index idx_grants_status on grants(status);
create index idx_grants_deadline on grants(deadline);
create index idx_grants_category on grants using gin(category);
create index idx_grant_matches_org_id on grant_matches(org_id);
create index idx_grant_matches_fit_score on grant_matches(fit_score desc);
create index idx_proposals_org_id on proposals(org_id);
create index idx_proposals_status on proposals(status);
