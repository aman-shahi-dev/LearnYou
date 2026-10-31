import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Per-request server client. Reads cookies(), so with Cache Components any
 * component calling this must render inside a <Suspense> boundary.
 * `connection()` keeps it out of runtime prefetches: supabase-js checks token
 * expiry with Date.now(), which Next.js rejects during prerendering.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  await connection();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
