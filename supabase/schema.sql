-- HERPATH Database Schema
-- Run this in your Supabase SQL Editor if connecting a Supabase project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Community Disturbance & Infrastructure Reports
create table if not exists public.community_reports (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in (
    'harassment',
    'disruptive_group',
    'suspected_intoxication',
    'streetlight_issue',
    'broken_footpath',
    'blocked_road',
    'transport_disruption',
    'facility_unavailable',
    'other_concern'
  )),
  latitude double precision not null,
  longitude double precision not null,
  location_name text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'resolved', 'outdated')),
  source text not null default 'community' check (source in ('community', 'official', 'demo', 'sensor')),
  upvotes integer not null default 0,
  flag_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz default (now() + interval '48 hours'),
  resolved_at timestamptz
);

create index if not exists idx_community_reports_coords on public.community_reports(latitude, longitude);
create index if not exists idx_community_reports_status on public.community_reports(status);
create index if not exists idx_community_reports_created on public.community_reports(created_at desc);

-- 2. Streetlight Infrastructure Conditions
create table if not exists public.streetlight_reports (
  id uuid primary key default uuid_generate_v4(),
  segment_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text not null check (status in ('working', 'malfunctioning', 'partial_outage', 'unverified', 'unknown', 'resolved')),
  reported_source text not null default 'community' check (reported_source in ('community', 'official', 'demo', 'sensor')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'community_corroborated', 'official_confirmed')),
  last_reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text
);

create index if not exists idx_streetlight_coords on public.streetlight_reports(latitude, longitude);

-- 3. Essential Facilities & Women's Support Points
create table if not exists public.facilities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in (
    'womens_restroom',
    'public_toilet',
    'pharmacy',
    'hospital',
    'police_station',
    'help_point',
    'accessible_facility'
  )),
  latitude double precision not null,
  longitude double precision not null,
  address text,
  phone text,
  opening_hours text,
  is_accessible boolean default false,
  has_female_staff boolean default false,
  verification_status text not null default 'community_reported' check (verification_status in ('official_verified', 'community_reported', 'unverified', 'reported_closed')),
  last_verified_at timestamptz default now()
);

create index if not exists idx_facilities_category on public.facilities(category);
create index if not exists idx_facilities_coords on public.facilities(latitude, longitude);

-- 4. Public Transport Stops
create table if not exists public.transport_stops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('bus_stop', 'metro_station', 'railway_station', 'terminal')),
  latitude double precision not null,
  longitude double precision not null,
  has_womens_coach boolean default false,
  is_well_lit boolean default false,
  has_cctv boolean default false,
  lines text[] default '{}',
  accessibility_info text
);

create index if not exists idx_transport_stops_coords on public.transport_stops(latitude, longitude);

-- 5. Family Journey Companion Sessions
create table if not exists public.journey_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_identifier text not null,
  origin_name text not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  destination_name text not null,
  dest_lat double precision not null,
  dest_lng double precision not null,
  estimated_arrival timestamptz not null,
  check_in_interval_minutes integer not null default 15,
  status text not null default 'in_progress' check (status in ('planned', 'in_progress', 'check_in_due', 'arrived', 'completed', 'cancelled')),
  trusted_contact_name text,
  trusted_contact_phone text,
  share_token text unique default md5(random()::text || clock_timestamp()::text),
  current_lat double precision,
  current_lng double precision,
  last_check_in_at timestamptz,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists idx_journeys_share_token on public.journey_sessions(share_token);
create index if not exists idx_journeys_user on public.journey_sessions(user_identifier);

-- 6. Journey Check-in Log
create table if not exists public.journey_checkins (
  id uuid primary key default uuid_generate_v4(),
  journey_id uuid references public.journey_sessions(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  status text not null check (status in ('ok', 'delayed', 'help_needed', 'arrived')),
  note text,
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS) setup
alter table public.community_reports enable row level security;
alter table public.streetlight_reports enable row level security;
alter table public.facilities enable row level security;
alter table public.transport_stops enable row level security;
alter table public.journey_sessions enable row level security;
alter table public.journey_checkins enable row level security;

-- Public read access for maps & facilities
create policy "Allow public read on reports" on public.community_reports for select using (true);
create policy "Allow insert on reports" on public.community_reports for insert with check (true);
create policy "Allow update on reports" on public.community_reports for update using (true);

create policy "Allow public read on streetlights" on public.streetlight_reports for select using (true);
create policy "Allow insert on streetlights" on public.streetlight_reports for insert with check (true);

create policy "Allow public read on facilities" on public.facilities for select using (true);
create policy "Allow public read on transport" on public.transport_stops for select using (true);

-- Journey security: access by share_token or creator
create policy "Allow read journey by share token" on public.journey_sessions
  for select using (true);
create policy "Allow insert journey" on public.journey_sessions
  for insert with check (true);
create policy "Allow update journey" on public.journey_sessions
  for update using (true);

create policy "Allow checkins read" on public.journey_checkins for select using (true);
create policy "Allow checkins insert" on public.journey_checkins for insert with check (true);
