import { z } from "zod";

// Supabase is optional: without it the site renders the fallbacks in
// data/content.js. If one of the pair is set, both must be valid.
const envSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.url().default("https://andre-pesquerra.vercel.app"),
  })
  .refine(
    (env) =>
      Boolean(env.NEXT_PUBLIC_SUPABASE_URL) ===
      Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    {
      message:
        "Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or neither.",
    }
  );

// NEXT_PUBLIC_* values are inlined at build time, so each one must be read
// with a literal property name to reach the browser bundle.
const result = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
}

export const env = result.data;
