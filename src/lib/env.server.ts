import "server-only";

import { z } from "zod";

// Server-only secrets. Never prefix these with NEXT_PUBLIC_ and never
// import this module from a Client Component ("server-only" fails the build).
const serverEnvSchema = z.object({
  // Supabase → Project Settings → API Keys → secret key. Optional: without
  // it the inquiry form explains it is offline and points to email.
  SUPABASE_SECRET_KEY: z.string().min(20).optional(),
});

const result = serverEnvSchema.safeParse({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
});

if (!result.success) {
  throw new Error(`Invalid server environment variables:\n${z.prettifyError(result.error)}`);
}

export const serverEnv = result.data;
