import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { theme } from "./theme";

/** Animated aurora background: drifting color orbs under a heavy blur. */
export function Aurora() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.canvas }]}>
      <Orb color={theme.aurora.violet} size={width * 1.1} x={-width * 0.35} y={-height * 0.12} dx={width * 0.3} dy={height * 0.1} duration={14000} />
      <Orb color={theme.aurora.iris} size={width * 0.95} x={width * 0.35} y={height * 0.25} dx={-width * 0.35} dy={-height * 0.08} duration={17000} />
      <Orb color={theme.aurora.teal} size={width * 0.8} x={-width * 0.05} y={height * 0.7} dx={width * 0.2} dy={-height * 0.15} duration={20000} />
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["transparent", `${theme.canvas}CC`, theme.canvas]}
        locations={[0.3, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function Orb({ color, size, x, y, dx, dy, duration }: { color: string; size: number; x: number; y: number; dx: number; dy: number; duration: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [t, duration]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x + dx * t.value }, { translateY: y + dy * t.value }, { scale: 1 + 0.15 * t.value }],
  }));
  return (
    <Animated.View
      style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.45 }, style]}
    />
  );
}
