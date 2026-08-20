import { headers } from "next/headers";

/**
 * Middleware already resolves the Supabase session on every request and
 * (for protected paths) redirects unauthenticated users before the page
 * ever renders. It forwards the result via the `x-user-id` request header,
 * so pages can read it synchronously instead of calling
 * `supabase.auth.getUser()` again, which is a real network round-trip to
 * Supabase's auth server.
 *
 * Use this in Server Components / route handlers that sit behind
 * middleware's matcher (i.e. almost everything except static assets).
 * For routes that don't gate on auth in middleware, this returns null
 * when the visitor isn't logged in — treat that the same as "no user".
 */
export function getUserId(): string | null {
  return headers().get("x-user-id");
}

export function getUserEmail(): string | null {
  return headers().get("x-user-email");
}
