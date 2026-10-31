import { Geist_400Regular, Geist_500Medium, useFonts } from "@expo-google-fonts/geist";
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif";
import { DarkTheme, SplashScreen, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/lib/session";
import { theme } from "@/ui/theme";

SplashScreen.preventAutoHideAsync();

const navTheme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.canvas } };

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });
  return (
    <ThemeProvider value={navTheme}>
      <SessionProvider>
        <StatusBar style="light" />
        <RootNavigator fontsLoaded={fontsLoaded} />
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, isLoading } = useSession();
  if (isLoading || !fontsLoaded) return null;
  SplashScreen.hide();

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
