import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current signed-in user if (and only if) their id matches
 * CONTACT_ADMIN_USER_ID, otherwise null. Used to gate /admin/* pages and
 * API routes. CONTACT_ADMIN_USER_ID is a server-only env var (no
 * NEXT_PUBLIC_ prefix), so it's never exposed to the browser.
 */
export async function getAdminUser() {
  const adminUserId = process.env.CONTACT_ADMIN_USER_ID;
  if (!adminUserId) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== adminUserId) return null;
  return user;
}
