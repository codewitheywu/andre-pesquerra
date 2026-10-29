import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let publicClient: SupabaseClient | undefined;

/**
 * Anonymous client for reading public portfolio content.
 * It never reads or writes cookies, so pages using it can be statically
 * rendered and revalidated instead of rendering on every request.
 */
export function createPublicClient(): SupabaseClient | null {
  if (publicClient) {
    return publicClient;
  }

  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  publicClient = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });

  return publicClient;
}
