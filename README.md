# Andre V. Pesquerra — Portfolio

Personal portfolio built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and Supabase.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Supabase is optional: without it the site renders
the fallback content in `src/data/content.ts`. Environment variables are validated at startup
(`src/lib/env.ts`); a half-configured Supabase pair fails fast.

## Project structure

```
src/
  app/
    (site)/            Public routes: shell (sidebar, mobile bar, palette), homepage, /stack, error boundary
    layout.tsx         Root layout: fonts, metadata, smooth scroll
    not-found.tsx      Styled 404
    robots.ts, sitemap.ts, icon.svg
  assets/              Statically imported images (blur placeholders)
  components/
    layout/            Sidebar, mobile bar, footer, command palette (⌘K), theme and sound toggles
    sections/          Hero, Projects, Experience (+ tools logo row), GitHubActivity, Certifications, Contact
    ui/                Primitives: Section, TextLink, LinkList, Kbd, CopyButton, Reveal, Marquee, icons
  data/content.ts      Static content (incl. certifications) and database fallbacks
  data/stack.ts        Every tool on /stack, by category; those with logos feed the logo row
  hooks/               useHydrated, useTheme / useSoundEnabled
  lib/
    env.ts             Zod-validated environment
    queries.ts         Server-side data access
    mappers.ts         Row validation and mapping (unit tested)
    motion.ts          Shared animation timing
    theme.ts, sound.ts Visitor preferences (iced/hot coffee theme, optional sound effects)
    github.ts          Public contribution calendar (cached 1h; falls back to a link)
    supabase/          The only place Supabase clients are created
  styles/globals.css   Light-coffee tokens and the Tailwind v4 design system
  types/               UI types; database.ts is generated (see below)
supabase/
  migrations/          Every schema change, applied in order
  seed.sql             Local development data
tests/
  unit/                Vitest
  e2e/                 Playwright (+ axe accessibility scans)
```

## Database types

`src/types/database.ts` must be generated, never hand-written:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:types
```

Until then, every row is validated at runtime by the zod schemas in `src/lib/mappers.ts`.

## Scripts

| Command             | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the dev server                               |
| `npm run build`     | Production build                                   |
| `npm run start`     | Serve the production build                         |
| `npm run lint`      | ESLint (Next + TypeScript rules)                   |
| `npm run typecheck` | Generate route types and run `tsc --noEmit`        |
| `npm test`          | Unit tests (Vitest)                                |
| `npm run test:e2e`  | E2E tests against the production build (Playwright, local Chrome); run `npm run build` first |
| `npm run db:types`  | Generate `src/types/database.ts` from the linked Supabase project |
