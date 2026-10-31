import "server-only";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "./supabase/server";

export type CurrentUser = { id: string; name: string; avatarUrl: string | null; email: string | null };

/** Data Access Layer: the only place the app reads the signed-in user on the server. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");

  const meta = (claims.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    id: claims.sub,
    name: meta.full_name ?? meta.name ?? meta.user_name ?? "Learner",
    avatarUrl: meta.avatar_url ?? null,
    email: (claims.email as string | undefined) ?? null,
  };
}
