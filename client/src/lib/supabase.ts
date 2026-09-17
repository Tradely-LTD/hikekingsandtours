import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Auth client.
 *
 * Only the project URL and the anon (publishable) key belong here — both are
 * public by design. Never put the service-role key in a VITE_ variable.
 *
 * The client persists its session in localStorage and refreshes the access
 * token automatically; `lib/trpc` reads that token for the Authorization header.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Auth] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. " +
      "The site renders, but sign-in is disabled."
  );
}

/**
 * Null when the project is not configured, so the public site still renders on a
 * fresh deploy instead of throwing at import time. Call sites guard on it.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Current access token, refreshed if needed. Null when signed out. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
