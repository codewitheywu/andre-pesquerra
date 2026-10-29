-- =========================================================
-- Close direct anonymous writes to contact_messages.
--
-- 001 let anyone holding the (public) publishable key insert rows through
-- the REST API with no rate limiting or bot protection, while the site has
-- no contact form that needs it. Re-open writes only through a Server
-- Action that validates with zod, rate-limits, and verifies a CAPTCHA,
-- inserting via a server-only path (e.g. a SECURITY DEFINER function
-- callable only by service_role).
-- =========================================================

drop policy if exists "Visitors can submit contact messages"
  on public.contact_messages;

revoke insert on public.contact_messages from anon, authenticated;

-- Admins keep full access through "Admins manage contact messages", which
-- still needs table-level privileges for the authenticated role.
grant insert on public.contact_messages to authenticated;
