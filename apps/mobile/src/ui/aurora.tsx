import { BlurTargetView, BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { createContext, use, useEffect, useRef, type ComponentRef, type PropsWithChildren, type RefObject } from "react";
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

/**
 * Android's blur (SDK 55+) only blurs content inside a BlurTargetView, passed to
 * each BlurView via `blurTarget`. The aurora is that target; glass surfaces read it from context.
 */
type ViewInstance = ComponentRef<typeof View>;
const BlurTargetContext = createContext<RefObject<ViewInstance | null> | null>(null);
export const useBlurTarget = () => use(BlurTargetContext);

/** Full-screen canvas: animated aurora behind, content (and glass) on top. */
export function Screen({ children }: PropsWithChildren) {
  const targetRef = useRef<ViewInstance | null>(null);
  const { width, height } = useWindowDimensions();

  return (
    <BlurTargetContext value={targetRef}>
      <View style={{ flex: 1, backgroundColor: theme.canvas }}>
        <BlurTargetView ref={targetRef} pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Orb color={theme.aurora.violet} size={width * 1.1} x={-width * 0.35} y={-height * 0.12} dx={width * 0.3} dy={height * 0.1} duration={14000} />
          <Orb color={theme.aurora.iris} size={width * 0.95} x={width * 0.35} y={height * 0.25} dx={-width * 0.35} dy={-height * 0.08} duration={17000} />
          <Orb color={theme.aurora.teal} size={width * 0.8} x={-width * 0.05} y={height * 0.7} dx={width * 0.2} dy={-height * 0.15} duration={20000} />
        </BlurTargetView>
        {/* Softens the orbs into an aurora */}
        <BlurView
          pointerEvents="none"
          blurTarget={targetRef}
          intensity={100}
          tint="dark"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["transparent", `${theme.canvas}CC`, theme.canvas]}
          locations={[0.3, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </BlurTargetContext>
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
