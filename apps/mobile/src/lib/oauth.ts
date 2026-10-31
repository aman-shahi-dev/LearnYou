import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "github" | "google";

/**
 * PKCE OAuth: open the provider in a system auth session, receive
 * learnyou://auth/callback?code=…, then exchange the code for a session.
 * Add this redirect URL in Supabase → Auth → URL Configuration.
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<{ error?: string }> {
  const redirectTo = Linking.createURL("auth/callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { error: error?.message ?? "Could not start sign-in" };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return {}; // user cancelled

  const { queryParams } = Linking.parse(result.url);
  const code = typeof queryParams?.code === "string" ? queryParams.code : undefined;
  const errDesc = typeof queryParams?.error_description === "string" ? queryParams.error_description : undefined;
  if (!code) return { error: errDesc ?? "Sign-in was not completed" };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  return exchangeError ? { error: exchangeError.message } : {};
}
