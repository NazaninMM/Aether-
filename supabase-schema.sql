-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

create table if not exists daily_goals (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text not null default '',
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  completed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  time_label text,
  location text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists time_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time_label text not null,
  title text not null,
  subtitle text,
  is_event boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists daily_notes (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  content text default '',
  mood int default 1 check (mood between 1 and 3),
  energy int default 3 check (energy between 1 and 5),
  updated_at timestamptz default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  days int[],  -- null = every day; array of weekday numbers (0=Sun,1=Mon,...6=Sat)
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  date date not null,
  completed boolean default false,
  unique(routine_id, date),
  created_at timestamptz default now()
);

create table if not exists weekly_goals (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  title text not null default '',
  next_week_focus text default '',
  reflection text default '',
  updated_at timestamptz default now()
);

create table if not exists weekly_wins (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  content text not null,
  day_label text,
  sort_order int default 0,
  created_at timestamptz default now()
);
