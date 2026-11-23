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
  primary: "#F45430",
  primaryLight: "#FF805D",
  primaryFill: "#CF4225",
  primaryDark: "#BA371B",
  primarySoft: "#FCE8DB",

  // Surfaces
  background: "#FBEEE2",
  surface: "#FFFAF4",
  surfaceAlt: "#F6E5D6",
  border: "#EAD6C6",

  // Text & icons
  foreground: "#25160E",
  muted: "#715D50",
  icon: "#796457",

  // Category labels
  leaf: "#3E5E27",
  leafSoft: "#EBECD7",
  amber: "#744512",
  amberSoft: "#FBE7CB",

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
