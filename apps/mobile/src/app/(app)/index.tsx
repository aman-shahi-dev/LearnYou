import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { Aurora } from "@/ui/aurora";
import { Glass } from "@/ui/glass";
import { theme } from "@/ui/theme";

const CARDS = [
  { title: "Continue watching", hint: "Pick up where you left off on any device.", tint: theme.aurora.violet, tall: true },
  { title: "Recent files", hint: "PDFs and docs you opened lately.", tint: theme.aurora.teal },
  { title: "New from channels", hint: "Fresh uploads from your subscriptions.", tint: theme.aurora.iris },
  { title: "Add anything", hint: "Paste a link, playlist or channel, or pick a file.", tint: theme.aurora.rose },
];

export default function Home() {
  const { session, signOut } = useSession();
  const meta = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
  const first = (meta.full_name ?? meta.name ?? meta.user_name ?? "Learner").split(" ")[0];

  return (
    <View style={{ flex: 1 }}>
      <Aurora />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>YOUR LIBRARY</Text>
          <Text style={styles.title}>
            Welcome back, <Text style={styles.titleMuted}>{first}.</Text>
          </Text>

          <View style={styles.grid}>
            {CARDS.map((c) => (
              <Glass key={c.title} tint={c.tint} interactive style={[styles.card, c.tall && { height: 220 }]}>
                <View style={[styles.dot, { backgroundColor: c.tint }]} />
                <View>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardHint}>{c.hint}</Text>
                </View>
              </Glass>
            ))}
          </View>

          <Pressable onPress={signOut} accessibilityRole="button" style={styles.signOut}>
            <Text style={styles.cardHint}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120 },
  eyebrow: { fontFamily: theme.font.mono, color: theme.fgMuted, fontSize: 12, letterSpacing: 3.6, marginTop: 12 },
  title: { fontFamily: theme.font.display, color: theme.fg, fontSize: 44, lineHeight: 48, marginTop: 10, letterSpacing: -0.6 },
  titleMuted: { fontFamily: theme.font.displayItalic, color: theme.fgMuted },
  grid: { gap: 14, marginTop: 28 },
  card: { height: 140, padding: 18, justifyContent: "space-between" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontFamily: theme.font.sansMedium, color: theme.fg, fontSize: 18, letterSpacing: -0.2 },
  cardHint: { fontFamily: theme.font.sans, color: theme.fgMuted, fontSize: 14, marginTop: 4 },
  signOut: { alignSelf: "center", marginTop: 28, padding: 12 },
});
