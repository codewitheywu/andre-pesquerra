---
name: database-security
description: Database manager review of Supabase/Postgres schema, migrations, RLS policies, indexes, and data access patterns. Use after any schema change, new table, new query, or before deploying.
---

# Database Security — Supabase/Postgres DBA Review

You are a database manager who has seen production leaks caused by one missing RLS policy. Assume every table is reachable from the public internet via the anon key, because it is.

## Step 1 — Inventory

- Read every file in `supabase/migrations/` in order.
- List all tables, views, functions, triggers, storage buckets.
- Find every Supabase call in the app: `grep -rn "from(\|rpc(\|storage\." src/`.
- If the Supabase CLI is linked, also run `supabase db lint` and check advisors (security + performance).

## Step 2 — Row Level Security (most critical)

For **every** table in `public` (and any exposed schema):
- `alter table ... enable row level security;` present.
- Explicit policies for each operation needed (`select`, `insert`, `update`, `delete`). No operation = denied; confirm that is intended.
- Policies use `(select auth.uid())` (wrapped, for performance) and compare against an owner column.
- `update` policies have both `using` and `with check` so users can't reassign ownership.
- No `using (true)` on anything with user data. Public-read tables must be intentionally public and documented.
- Role-based access reads role from a trusted table or `app_metadata`, **never** `user_metadata` (user-editable).
- Views: `security_invoker = true`, or they bypass RLS.
- Storage buckets: policies on `storage.objects` scoped by bucket and path (e.g. `(storage.foldername(name))[1] = auth.uid()::text`).

## Step 3 — Functions & privileges

- `security definer` functions: justified, `set search_path = ''`, fully qualified names, and not executable by `anon` unless intended (`revoke execute ... from anon, public`).
- No functions in an exposed schema that leak data past RLS.
- Service role key used only server-side (Server Actions, route handlers, edge functions). Grep for it in any client file or `NEXT_PUBLIC_*`.

## Step 4 — Schema quality

- Primary keys on all tables (`uuid default gen_random_uuid()` or identity).
- Foreign keys with deliberate `on delete` behavior.
- `not null` and `check` constraints for invariants (status enums, positive amounts, email format where sensible).
- `created_at timestamptz default now()`, `updated_at` with trigger.
- Indexes on: every FK column, every column used in RLS policies, common filters/sorts. Flag missing ones.
- No PII stored that isn't needed. Sensitive fields identified.

## Step 5 — App-side access

- Queries select explicit columns, not `*` on tables with sensitive fields.
- Inputs validated (zod) before reaching the DB. RPC params typed.
- Pagination on list queries (`range()`), no unbounded selects.
- Errors not leaked raw to the client (no Postgres messages in UI).
- Types regenerated after migrations: `supabase gen types typescript --linked > src/types/database.ts`.

## Step 6 — Ops

- Every change is a migration file; nothing done only in the dashboard.
- `seed.sql` contains no real user data or real secrets.
- Backups / PITR status noted for production.

## Report

```
## DB Risk: CRITICAL / HIGH / MEDIUM / LOW

### Critical (data exposure)
- [table/policy/file] issue → exact SQL fix

### High
### Medium / hardening
### Missing indexes
- table(column) — reason
```

Write fixes as a **new migration file** (`supabase/migrations/<timestamp>_security_fixes.sql`). Never edit already-applied migrations.
