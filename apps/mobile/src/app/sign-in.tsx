import * as Haptics from "expo-haptics";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithProvider, type OAuthProvider } from "@/lib/oauth";
import { Aurora } from "@/ui/aurora";
import { Glass } from "@/ui/glass";
import { theme } from "@/ui/theme";

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
  { id: "github", label: "Continue with GitHub" },
  { id: "google", label: "Continue with Google" },
];

export default function SignIn() {
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPress(provider: OAuthProvider) {
    Haptics.selectionAsync();
    setPending(provider);
    setError(null);
    const { error } = await signInWithProvider(provider);
    if (error) setError(error);
    setPending(null);
  }

  return (
    <View style={{ flex: 1 }}>
      <Aurora />
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.eyebrow}>LEARNYOU</Text>
          <Text style={styles.title}>Everything you&apos;ve learned,</Text>
          <Text style={[styles.title, styles.titleItalic]}>finally in one place.</Text>
          <Text style={styles.body}>
            Docs, PDFs, links, playlists and channels, organized by folder and date. Synced across all your devices.
          </Text>
        </View>

        <Glass strong style={styles.card}>
          {PROVIDERS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onPress(p.id)}
              disabled={pending !== null}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.985 }], opacity: 0.85 }]}
            >
              {pending === p.id ? <ActivityIndicator color={theme.fg} /> : <Text style={styles.buttonText}>{p.label}</Text>}
            </Pressable>
          ))}
          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
        </Glass>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
  eyebrow: { fontFamily: theme.font.mono, color: theme.fgMuted, fontSize: 12, letterSpacing: 3.6, marginBottom: 20 },
  title: { fontFamily: theme.font.display, color: theme.fg, fontSize: 48, lineHeight: 50, letterSpacing: -0.8 },
  titleItalic: { fontFamily: theme.font.displayItalic, color: theme.aurora.iris },
  body: { fontFamily: theme.font.sans, color: theme.fgMuted, fontSize: 15, lineHeight: 23, marginTop: 18, maxWidth: 340 },
  card: { padding: 8, gap: 6 },
  button: {
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  buttonText: { fontFamily: theme.font.sansMedium, color: theme.fg, fontSize: 15 },
  error: { fontFamily: theme.font.sans, color: theme.danger, fontSize: 13, padding: 10 },
});
