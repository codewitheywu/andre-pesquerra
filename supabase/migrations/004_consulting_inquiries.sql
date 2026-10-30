-- =========================================================
-- Consulting inquiries, written only through the site's Server Action.
--
-- 003 closed anonymous inserts into contact_messages. This re-opens
-- writes through one path: public.submit_inquiry, executable only by
-- service_role (the server's secret key, never shipped to browsers). The
-- Server Action validates with zod and drops honeypot hits first; the
-- function then rate-limits per visitor and inserts, atomically.
--
-- Visitors are identified by sender_ip_hash, an HMAC of their IP keyed
-- with a server secret: enough to count repeat submissions, not enough to
-- recover the address.
-- =========================================================

alter table public.contact_messages
  add column organization text
    check (organization is null or char_length(organization) <= 120),
  add column service text
    check (service is null or service in
      ('graphic-design', 'web-development', 'thesis', 'iot', 'other')),
  add column budget text
    check (budget is null or budget in
      ('under-5k', '5k-20k', '20k-50k', '50k-plus', 'not-sure')),
  add column timeline text
    check (timeline is null or char_length(timeline) <= 120),
  add column sender_ip_hash text
    check (sender_ip_hash is null or sender_ip_hash ~ '^[0-9a-f]{64}$');

-- The rate limit counts one visitor's recent rows.
create index contact_messages_ip_recent_idx
  on public.contact_messages (sender_ip_hash, created_at desc)
  where sender_ip_hash is not null;

-- Admins list the inbox newest first.
create index contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- 3 inquiries per visitor per rolling hour. Returns one row:
-- ('sent', 0) or ('rate_limited', seconds until the oldest counted
-- inquiry leaves the window).
create function public.submit_inquiry(
  p_name text,
  p_email text,
  p_organization text,
  p_service text,
  p_budget text,
  p_timeline text,
  p_details text,
  p_ip_hash text
)
returns table (status text, retry_after_seconds integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  max_per_window constant integer := 3;
  window_length constant interval := interval '1 hour';
  recent integer;
  oldest timestamptz;
begin
  -- Serialize submissions from one visitor so two parallel requests
  -- cannot both pass the count.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_ip_hash));

  select count(*), min(m.created_at)
    into recent, oldest
    from public.contact_messages as m
   where m.sender_ip_hash = p_ip_hash
     and m.created_at > pg_catalog.now() - window_length;

  if recent >= max_per_window then
    return query select
      'rate_limited'::text,
      greatest(1, ceil(extract(epoch from (oldest + window_length - pg_catalog.now()))))::integer;
    return;
  end if;

  insert into public.contact_messages
    (sender_name, sender_email, organization, service, budget, timeline, message, sender_ip_hash)
  values
    (trim(p_name), trim(p_email), nullif(trim(p_organization), ''), p_service,
     nullif(p_budget, ''), nullif(trim(p_timeline), ''), trim(p_details), p_ip_hash);

  return query select 'sent'::text, 0;
end;
$$;

-- Functions are executable by PUBLIC by default; only the server may call
-- this one.
revoke execute on function public.submit_inquiry(text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_inquiry(text, text, text, text, text, text, text, text)
  to service_role;
