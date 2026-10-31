/**
 * LearnYou design tokens — "Liquid Glass Minimal".
 * Single source of truth consumed by the web (Tailwind v4 @theme) and
 * mobile (NativeWind preset) apps. Never hardcode colors in components.
 */

export const palette = {
  ink: {
    950: "#07070B", // canvas (dark)
    900: "#0C0C14",
    800: "#14141F",
    700: "#1E1E2D",
    500: "#5B5B76",
    300: "#A5A5BE",
    100: "#E8E8F2",
    50: "#F6F6FB", // canvas (light, "milk glass")
  },
  /** Aurora stops used by the animated mesh-gradient background. */
  aurora: {
    violet: "#7C5CFF",
    iris: "#5B8CFF",
    teal: "#2DE2C4",
    rose: "#FF6FAE",
    amber: "#FFB547",
  },
  semantic: {
    success: "#3DDC97",
    warning: "#FFB547",
    danger: "#FF5C7A",
  },
} as const;

/** Per-folder accent colors; glass panels get tinted by these. */
export const folderAccents = [
  "#7C5CFF",
  "#5B8CFF",
  "#2DE2C4",
  "#3DDC97",
  "#FFB547",
  "#FF8A4C",
  "#FF6FAE",
  "#C77DFF",
] as const;
export type FolderAccent = (typeof folderAccents)[number];

/** Glass surface recipes (alpha fill + blur + hairline border). */
export const glass = {
  dark: {
    subtle: { fill: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", blur: 16 },
    base: { fill: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.10)", blur: 24 },
    strong: { fill: "rgba(255,255,255,0.10)", border: "rgba(255,255,255,0.14)", blur: 40 },
    highlight: "rgba(255,255,255,0.18)", // 1px inner top edge
  },
  light: {
    subtle: { fill: "rgba(255,255,255,0.45)", border: "rgba(12,12,20,0.06)", blur: 16 },
    base: { fill: "rgba(255,255,255,0.60)", border: "rgba(12,12,20,0.08)", blur: 24 },
    strong: { fill: "rgba(255,255,255,0.75)", border: "rgba(12,12,20,0.10)", blur: 40 },
    highlight: "rgba(255,255,255,0.90)",
  },
} as const;

export const radii = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;

export const typography = {
  family: {
    sans: "Geist",
    display: "Instrument Serif", // editorial heading accents
    mono: "Geist Mono",
  },
  size: { xs: 12, sm: 14, base: 15, lg: 18, xl: 22, "2xl": 28, "3xl": 36, "4xl": 48, "5xl": 64 },
  tracking: { tight: -0.02, normal: 0, wide: 0.04 },
} as const;

/** Motion: spring configs shared by Framer Motion (web) and Reanimated (mobile). */
export const motion = {
  spring: {
    snappy: { stiffness: 420, damping: 34, mass: 0.8 },
    soft: { stiffness: 220, damping: 26, mass: 1 },
    float: { stiffness: 120, damping: 18, mass: 1 },
  },
  duration: { fast: 0.15, base: 0.25, slow: 0.45 },
  ease: [0.22, 1, 0.36, 1] as const, // easeOutQuint-ish
} as const;

export const tokens = { palette, folderAccents, glass, radii, spacing, typography, motion } as const;
export type Tokens = typeof tokens;
