import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/**
 * Cookie-aware client for Server Components, Server Actions and Route
 * Handlers that need the visitor's session (e.g. an admin area).
 * Calling this opts the route into request-time rendering.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot modify cookies; a Server Action,
          // Route Handler or proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
