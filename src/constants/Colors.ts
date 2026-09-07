/**
 * Central design tokens (single source of truth for the palette).
 *
 * These values are mapped to semantic Tailwind / NativeWind color utilities in
 * `tailwind.config.js` (e.g. `bg-background`, `text-foreground`, `bg-primary`,
 * `text-muted`, `border-border`). Re-theme the whole app by editing this file.
 *
 * The defaults are tuned for a clean LIGHT theme so the starter screens render
 * well out of the box. To add light/dark/system switching, follow the spec in
 * `.ai/features/themes-system`.
 */
export const Colors = {
  // Brand & actions
  primary: "#FF5A4F",
  primaryLight: "#FF8278",
  primaryDark: "#E5473D",
  primarySoft: "#FFF0ED",

  // Surfaces
  background: "#FFF8F4",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF1EC",
  border: "#EDE1DC",

  // Text & icons
  foreground: "#18202A",
  muted: "#6F7782",
  icon: "#8A929C",

  // Status
  success: "#39A96B",
  error: "#D94C4C",
  warning: "#F1A71C",
  info: "#667EB8",
  rating: "#F4A51C",
  overlay: "rgba(20,24,30,0.38)",

  // Absolutes
  white: "#ffffff",
  black: "#000000",
} as const;

export type ColorName = keyof typeof Colors;
