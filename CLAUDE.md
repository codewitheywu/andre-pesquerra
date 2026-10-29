@AGENT.md

# Project Instructions — Anti-Slop Build Rules

You are building a production web app with **Next.js (App Router) + TypeScript + Tailwind CSS v4 + Supabase**.
The bar is "a senior engineer's personal site that people screenshot," not "a template someone generated."
Every decision below exists to prevent generic AI output. Follow them over your own defaults.

---

## 1. Design direction

**Reference:** bryllim.com — study its *structure and restraint*, not its content. Never copy its text, images, logos, avatars, or exact layout. Take these ideas only:

- Single, narrow reading column (max ~680px for text, ~960px for media rows). Lots of air.
- Numbered, lowercase section headings: `01 — projects`, `02 — experience`. Small, quiet, with a right-aligned `all projects →` link.
- Information density through *lists and rows*, not cards. Experience = year on the left, role + company on the right, one line each.
- A short stats row (3 items max) with big numbers and tiny labels.
- External links marked with `↗`. Internal "see more" links with `→`.
- Keyboard-first touches: `⌘K` command palette, visible `<kbd>` hints.
- Personality through small interactive details (presence indicator, typing test, easter egg), not through decoration.

**Palette — "light coffee"** (warm, low-contrast paper feel; never pure white or pure black):

```css
:root {
  --bg:        #F6EFE6; /* oat milk */
  --surface:   #FBF7F1; /* steamed milk */
  --surface-2: #EFE5D8; /* latte foam */
  --border:    #E2D4C2; /* paper edge */
  --ink:       #2A1E16; /* espresso */
  --ink-2:     #5C4A3C; /* americano */
  --muted:     #76614F; /* mocha dust — darkened from #8C7764 (3.7:1) to pass 4.5:1 on every light surface */
  --accent:    #A8693A; /* caramel */
  --accent-2:  #C99A6B; /* honey crema */
  --ring:      #A8693A40;
}
@media (prefers-color-scheme: dark) { /* optional dark roast */
  :root {
    --bg: #17110D; --surface: #1F1712; --surface-2: #2A2019; --border: #3A2D23;
    --ink: #F2E8DC; --ink-2: #CDBBA8; --muted: #9A8572; --accent: #D29A63; --accent-2: #E6BB8C;
  }
}
```

- Accent is used **sparingly**: links on hover, one highlight per section, focus rings. Never for large backgrounds.
- Max 1 accent color. No second "brand" color.

**Typography**
- `Poppins` (400/500/600) for UI, body and headings; `Geist Mono` for metadata (years, counts, kbd, tags). Load via `next/font`.
- No serif: one sans family keeps the font budget small (web fonts were the main mobile LCP cost).
- Scale: 13 / 15 / 17 / 22 / 32 / 48. Body 15–17px, line-height 1.6. Headings tight (1.1–1.2), `letter-spacing: -0.02em`.
- Section labels lowercase, mono, `--muted`, 13px.

**Spacing & shape**
- 4px grid. Section gap 96–128px desktop, 64px mobile.
- Radius: 6–10px. Not everything rounded-2xl.
- Borders (1px `--border`) over shadows. If a shadow is needed, one soft one: `0 1px 2px #2A1E160D`.

---

## 2. Motion & "high fidelity"

- **Smooth scroll:** `lenis` (via `lenis/react`), `lerp: 0.1`, disabled when `prefers-reduced-motion`.
- **Animation:** `motion` (Framer Motion). Reveal on scroll = fade + 8–12px translate, 400–600ms, `ease: [0.22, 1, 0.36, 1]`, stagger 40–60ms. Animate once.
- **Micro-interactions:** link underline that draws in from left; `→` nudges 2px on hover; buttons scale 0.98 on press; copy button swaps to "copied ✓" for 1.5s.
- **Page transitions:** subtle crossfade (≤250ms). No sliding full-page wipes.
- **Images:** `next/image`, real dimensions, `placeholder="blur"`, AVIF/WebP.
- Respect `prefers-reduced-motion` everywhere — kill transforms, keep opacity.
- Target: Lighthouse ≥95 on all four, CLS < 0.05, LCP < 2.0s, no layout shift from fonts.

---

## 3. Banned AI-slop patterns (do not produce these)

**Visual**
- Purple/blue/pink gradients, gradient text, glowing blobs, mesh backgrounds.
- Glassmorphism as a default style. Backdrop-blur only on a sticky nav, if at all.
- The "three feature cards with icons in colored circles" section.
- Centered hero with a badge pill → giant headline → two buttons → screenshot. 
- Emoji as icons. Random Lucide icons next to every heading.
- Fake logo walls ("Trusted by"), fake testimonials, fake stats, stock 3D illustrations.
- Every element in a card. Shadows on everything. `rounded-2xl` on everything.
- Dark mode as the only mode "because it looks techy."

**Copy**
- "Elevate", "unlock", "seamless", "cutting-edge", "revolutionize", "empower", "in today's fast-paced world", "take X to the next level", "Look no further."
- Headlines that could fit any company. If the sentence still works after swapping the product name, rewrite it.
- Triplets of adjectives. Rhetorical questions as headings. Excessive em dashes.
- Lorem ipsum or placeholder text in anything shipped. If content is missing, use a clearly marked `TODO:` and tell me.

**Code**
- `any`, unused imports, commented-out dead code, `console.log` left in.
- 400-line components. God files. Copy-pasted blocks that should be a component.
- `useEffect` for data fetching that belongs in a Server Component.
- Happy-path-only logic: every fetch has loading, empty, and error states.
- Over-abstraction: no factories/HOCs/contexts "for future flexibility." Build what's needed.
- Invented APIs or packages. If unsure a package/API exists, say so instead of guessing.

---

## 4. Architecture

```
src/
  app/
    (site)/            # public routes
    (dashboard)/       # authed routes
    api/               # route handlers (only when Server Actions don't fit)
    layout.tsx
  components/
    ui/                # primitives: Button, Kbd, Link, Section
    sections/          # page sections: Hero, Projects, Experience
  lib/
    supabase/
      server.ts        # createServerClient (@supabase/ssr)
      client.ts        # createBrowserClient
      middleware.ts
    utils.ts
  hooks/
  types/
    database.ts        # generated: supabase gen types typescript
  styles/globals.css
middleware.ts
supabase/
  migrations/          # every schema change is a migration
  seed.sql
```

- Server Components by default. `"use client"` only for interactivity, pushed as low in the tree as possible.
- Mutations via Server Actions with **zod** validation on the server.
- Supabase via `@supabase/ssr` only. Never the service-role key in client code or in any `NEXT_PUBLIC_` var.
- **RLS enabled on every table**, with explicit policies. No table ships without them.
- Types generated from the DB, never hand-written to match.
- Env vars validated at startup (zod) in `src/lib/env.ts`.
- Next.js version here may differ from training data. Before writing routing, middleware/proxy, caching, or config code, check `node_modules/next/dist/docs/`. Docs win over CLAUDE.md if they conflict.

---

## 5. Accessibility (non-negotiable)

- Semantic landmarks, one `h1` per page, logical heading order.
- All interactive elements reachable by keyboard with a visible focus ring (`--ring`).
- Contrast ≥ 4.5:1 for body text (check `--muted` on `--bg` before using it for anything long).
- `alt` text that describes, not "image of".
- Command palette: focus trap, `Esc` closes, arrow navigation, `aria-activedescendant`.

---

## 6. How to work with me

- Before building a page, give a **one-paragraph plan**: sections, what's server vs client, what data it needs. Then build.
- Deliver complete files, not snippets with "...rest stays the same."
- When you finish a feature, run the relevant review skill(s) — `senior-web-dev`, `ui-ux-review`, `database-security`, `cybersecurity-audit`, `senior-qa` — and fix what they flag before calling it done.
- If something in my request conflicts with these rules, say so in one line and propose the better option.
- Be direct. No filler, no recap of what I asked.
