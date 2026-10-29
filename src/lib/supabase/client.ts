import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient | undefined;

/** Browser client for Client Components. Returns null when unconfigured. */
export function createClient(): SupabaseClient | null {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  browserClient = createBrowserClient(config.url, config.key);

  return browserClient;
}
