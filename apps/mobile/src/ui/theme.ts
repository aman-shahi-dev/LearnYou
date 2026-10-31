import { glass, palette, radii, typography } from "@learnyou/ui-tokens";

/** Mobile theme derived from the shared design tokens (dark-first). */
export const theme = {
  canvas: palette.ink[950],
  fg: palette.ink[100],
  fgMuted: palette.ink[300],
  aurora: palette.aurora,
  glass: glass.dark,
  radii,
  danger: palette.semantic.danger,
  font: {
    sans: "Geist_400Regular",
    sansMedium: "Geist_500Medium",
    display: "InstrumentSerif_400Regular",
    displayItalic: "InstrumentSerif_400Regular_Italic",
    mono: "Geist_400Regular",
  },
  size: typography.size,
} as const;
