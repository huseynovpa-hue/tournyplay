import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. This BYPASSES Row Level
// Security, so it must never be imported into a client component and its
// key must never reach the browser.
//
// It exists for one purpose in this app: reading OTHER users' push
// subscriptions from API routes so we can notify them (e.g. notifying a
// room's creator when someone else joins). Everything else in the app
// keeps using the normal cookie-scoped client in src/lib/supabase/server.ts
// so RLS still applies.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment (Supabase Dashboard -> Project Settings -> API -> service_role key). Never expose this key with a NEXT_PUBLIC_ prefix."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
