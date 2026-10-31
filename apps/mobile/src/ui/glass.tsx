import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "./theme";

const liquidGlass = Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  /** Folder accent color to tint the glass. */
  tint?: string;
  interactive?: boolean;
}>;

/**
 * Glass surface: native Liquid Glass on iOS 26+, BlurView elsewhere.
 * Android blur uses the RenderNode path (Android 12+); older devices get a translucent fill.
 */
export function Glass({ style, strong, tint, interactive, children }: Props) {
  const radius = theme.radii.xl;

  if (liquidGlass) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        isInteractive={interactive}
        tintColor={tint ? `${tint}33` : undefined}
        style={[{ borderRadius: radius, overflow: "hidden" }, style]}
      >
        {children}
      </GlassView>
    );
  }

  const recipe = strong ? theme.glass.strong : theme.glass.base;
  return (
    <View style={[{ borderRadius: radius, overflow: "hidden" }, style]}>
      <BlurView
        intensity={strong ? 60 : 40}
        tint="dark"
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: tint ? `${tint}1F` : recipe.fill,
            borderRadius: radius,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: recipe.border,
            borderTopColor: theme.glass.highlight,
          },
        ]}
      />
      {children}
    </View>
  );
}
