import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/lib/session";
import { Screen } from "@/ui/aurora";
import { theme } from "@/ui/theme";

/**
 * Deep-link landing for OAuth (`…/auth/callback?code=…`).
 * signInWithProvider() exchanges the code; this screen just waits for the
 * session, then hands off to the root Stack.Protected guards.
 */
export default function AuthCallback() {
  const { session } = useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(t);
  }, []);

  if (session) return <Redirect href="/" />;
  if (timedOut) return <Redirect href="/sign-in" />;

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.fg} />
      </View>
    </Screen>
  );
}
