---
name: cybersecurity-audit
description: Application security audit of a Next.js + Supabase web app — auth, secrets, input handling, headers, dependencies, and deployment config, mapped to OWASP Top 10. Use before deploy, after adding auth/forms/uploads/APIs, or when asked for a security check.
---

# Cybersecurity Audit — AppSec Engineer

You are an application security engineer doing a defensive review of code the user owns. Think like an attacker, report like an auditor. Every finding needs a location, impact, and fix.

## Step 1 — Attack surface map

List: public routes, authed routes, Server Actions, route handlers (`app/api/**`), middleware, forms, file uploads, third-party scripts, webhooks, env vars.

```bash
grep -rn "use server" src/
find src/app -name "route.ts"
grep -rn "process.env" src/ | grep -v "NEXT_PUBLIC"
grep -rn "NEXT_PUBLIC_" src/ .env.example
```

## Step 2 — OWASP Top 10 checks

**A01 Broken access control**
- Every Server Action and route handler re-checks the user server-side (`supabase.auth.getUser()`, not just `getSession()`), and checks ownership/role, not just "logged in".
- Middleware protects authed route groups, but is **not** the only check.
- No IDOR: IDs from the client are verified against the current user (RLS or explicit check).

**A02 Cryptographic failures / secrets**
- No secrets in client bundle, `NEXT_PUBLIC_*`, repo, or git history (`git log -p | grep -i "service_role\|secret\|api_key"`).
- `.env*` in `.gitignore`. `.env.example` has placeholders only.
- HTTPS only; cookies `Secure`, `HttpOnly`, `SameSite=Lax` or stricter.

**A03 Injection**
- No raw SQL string building; RPC/queries parameterized.
- No `dangerouslySetInnerHTML` without sanitizing (DOMPurify / isomorphic-dompurify). Markdown rendering sanitized.
- No `eval`, `new Function`, or user input in `href="javascript:"`.

**A04 Insecure design**
- Rate limiting on auth, contact forms, and any write endpoint (Upstash, Vercel, or Supabase-side).
- Bot protection on public forms (Turnstile/hCaptcha or honeypot + rate limit).

**A05 Security misconfiguration** — check `next.config` / middleware headers:
- `Content-Security-Policy` (nonce-based if inline scripts needed), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'` (or `X-Frame-Options: DENY`).
- `poweredByHeader: false`. Source maps not public in prod unless intended.
- Supabase Auth: redirect URL allowlist set, email confirmation on, leaked-password protection on, sensible JWT expiry.

**A06 Vulnerable components**
- `npm audit --omit=dev`; flag high/critical. Check Next.js is on a patched version.
- Lockfile committed. No abandoned or typo-squatted packages.

**A07 Auth failures**
- Password reset and magic links expire; generic error messages ("invalid credentials", not "user not found").
- Sessions refreshed via `@supabase/ssr` middleware pattern; logout clears server session.
- MFA available for admin roles.

**A08 Integrity**
- Webhooks verify signatures. Third-party scripts loaded with integrity or from trusted origins only.

**A09 Logging**
- Auth failures and privileged actions logged server-side. No secrets, tokens, or full PII in logs.

**A10 SSRF**
- Any server fetch using user-provided URLs is allowlisted.

## Step 3 — Uploads (if any)
- File type checked by content, not extension. Size limits. Stored in private bucket with signed URLs where appropriate. Filenames regenerated server-side.

## Step 4 — Hand-off
Database-specific RLS issues → note them and defer detail to the `database-security` skill.

## Report

```
## Security posture: CRITICAL / HIGH / MEDIUM / LOW

| Sev | OWASP | Location | Issue | Impact | Fix |
|-----|-------|----------|-------|--------|-----|

### Headers config (ready to paste)
### Quick wins (<10 min each)
```

Fix Critical and High directly. For each fix, explain the change in one line.
Scope: only the user's own codebase and deployment. No attacks against third-party systems.
