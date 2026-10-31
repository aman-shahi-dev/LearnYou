import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "github" | "google";

/**
 * Where the provider sends the user back to.
 * - Expo Go: Android/iOS only route the `exp://` scheme to Expo Go, so use
 *   exp://<metro-host>/--/auth/callback (allowed by the `exp://**` Supabase redirect entry).
 *   Supabase rejects redirect URLs whose host is an IP address, so Expo Go must run with
 *   `npx expo start --tunnel ngrok` (hostname like xxxx.exp.direct), not the LAN IP.
 * - Dev/production builds: the app's own scheme, learnyou://auth/callback.
 */
async function getRedirectUrl(): Promise<string> {
  if (!isRunningInExpoGo()) return Linking.createURL("auth/callback");

  const initialUrl = await Linking.getInitialURL();
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.linkingUri?.startsWith("exp") ? Constants.linkingUri : undefined,
    initialUrl?.startsWith("exp") ? initialUrl : undefined,
  ];
  for (const c of candidates) {
    // Normalize "exp://host:port/--/x" or "host:port" to "host:port"
    const host = c?.replace(/^exps?:\/\//, "").replace(/\/--.*$/, "").replace(/\/$/, "");
    if (host) return `exp://${host}/--/auth/callback`;
  }
  return Linking.createURL("auth/callback");
}

export async function signInWithProvider(provider: OAuthProvider): Promise<{ error?: string }> {
  const redirectTo = await getRedirectUrl();
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
