
-- =========================================================
-- Andre Pequerra Portfolio
-- Initial PostgreSQL schema for Supabase
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1. Profile
-- ---------------------------------------------------------

create table public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Andre Pequerra',
  headline text,
  bio text,
  location text,
  avatar_url text,
  resume_url text,
  public_email text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 2. Projects
-- ---------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  role text,
  year integer,
  cover_image_url text,
  live_url text,
  repository_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_year_check
    check (year is null or year between 2000 and 2100)
);

-- ---------------------------------------------------------
-- 3. Technologies
-- ---------------------------------------------------------

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon_url text,
  category text,
  sort_order integer not null default 0
);

create table public.project_technologies (
  project_id uuid not null
    references public.projects(id) on delete cascade,
  technology_id uuid not null
    references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

-- ---------------------------------------------------------
-- 4. Skills
-- ---------------------------------------------------------

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  proficiency_label text,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------
-- 5. Experience
-- ---------------------------------------------------------

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  position text not null,
  description text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  sort_order integer not null default 0,
  constraint experience_dates_check
    check (
      end_date is null
      or start_date is null
      or end_date >= start_date
    )
);

-- ---------------------------------------------------------
-- 6. Education
-- ---------------------------------------------------------

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  qualification text,
  field_of_study text,
  start_date date,
  end_date date,
  details text,
  sort_order integer not null default 0,
  constraint education_dates_check
    check (
      end_date is null
      or start_date is null
      or end_date >= start_date
    )
);

-- ---------------------------------------------------------
-- 7. Testimonials
-- ---------------------------------------------------------

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  person_role text,
  organization text,
  quote text not null,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 8. Social links
-- ---------------------------------------------------------

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text,
  url text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------
-- 9. Contact messages (private)
-- ---------------------------------------------------------

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null
    check (char_length(trim(sender_name)) between 1 and 120),
  sender_email text not null
    check (
      char_length(trim(sender_email)) between 3 and 254
      and position('@' in sender_email) > 1
    ),
  subject text
    check (subject is null or char_length(subject) <= 200),
  message text not null
    check (char_length(trim(message)) between 1 and 10000),
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 10. Enable Row Level Security on every table
-- ---------------------------------------------------------

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.testimonials enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------
-- 11. Public read policies
-- Visitors can read portfolio content, not private messages.
-- ---------------------------------------------------------

create policy "Public can read profile"
on public.profile for select to anon, authenticated
using (true);

create policy "Public can read published projects"
on public.projects for select to anon, authenticated
using (published = true);

create policy "Public can read technologies"
on public.technologies for select to anon, authenticated
using (true);

create policy "Public can read technologies of published projects"
on public.project_technologies for select to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.published = true
  )
);

create policy "Public can read skills"
on public.skills for select to anon, authenticated
using (true);

create policy "Public can read experience"
on public.experience for select to anon, authenticated
using (true);

create policy "Public can read education"
on public.education for select to anon, authenticated
using (true);

create policy "Public can read published testimonials"
on public.testimonials for select to anon, authenticated
using (published = true);

create policy "Public can read social links"
on public.social_links for select to anon, authenticated
using (true);

-- ---------------------------------------------------------
-- 12. Administrator policies
-- Only users with an administrator role in app_metadata
-- can manage portfolio content.
-- Assign this role securely after authentication is configured.
-- ---------------------------------------------------------

create policy "Admins manage profile"
on public.profile for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage projects"
on public.projects for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage technologies"
on public.technologies for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage project technologies"
on public.project_technologies for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage skills"
on public.skills for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage experience"
on public.experience for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage education"
on public.education for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage testimonials"
on public.testimonials for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage social links"
on public.social_links for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage contact messages"
on public.contact_messages for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------
-- 13. Database privileges
-- RLS still applies to all granted operations.
-- ---------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.profile,
  public.projects,
  public.technologies,
  public.project_technologies,
  public.skills,
  public.experience,
  public.education,
  public.testimonials,
  public.social_links
to anon, authenticated;

grant insert, update, delete on
  public.profile,
  public.projects,
  public.technologies,
  public.project_technologies,
  public.skills,
  public.experience,
  public.education,
  public.testimonials,
  public.social_links
to authenticated;

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

create policy "Visitors can submit contact messages"
on public.contact_messages for insert to anon, authenticated
with check (
  char_length(trim(sender_name)) between 1 and 120
  and char_length(trim(sender_email)) between 3 and 254
  and position('@' in sender_email) > 1
  and char_length(trim(message)) between 1 and 10000
);
