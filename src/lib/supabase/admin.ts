import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";
import { getSupabaseConfig } from "./config";

export type AdminAccess = { client: SupabaseClient; secret: string };

let access: AdminAccess | undefined;

/**
 * Secret-key client for Server Actions only (e.g. writing an inquiry
 * through public.submit_inquiry). It bypasses RLS, so every caller must
 * validate input first. Returns null when the secret key is not set.
 */
export function createAdminClient(): AdminAccess | null {
  if (access) return access;

  const config = getSupabaseConfig();
  const secret = serverEnv.SUPABASE_SECRET_KEY;
  if (!config || !secret) return null;

  access = {
    client: createClient(config.url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    secret,
  };
  return access;
}
