import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client using the service role key — bypasses RLS.
// ONLY import this from server-only code that never ships to the client:
// the Stripe webhook handler, and nowhere else. Never import this from a
// page, a client component, or a route that renders user-triggered UI.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
