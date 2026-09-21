import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase instance. Uses the public anon/publishable key only —
// never put the service role key here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
