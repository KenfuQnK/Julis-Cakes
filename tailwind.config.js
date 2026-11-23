const { Colors } = require("./src/constants/Colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic color tokens backed by src/constants/Colors.ts.
      // Usage: bg-primary, text-foreground, text-muted, bg-surface, border-border…
      colors: {
        primary: Colors.primary,
        "primary-light": Colors.primaryLight,
        "primary-fill": Colors.primaryFill,
        "primary-dark": Colors.primaryDark,
        "primary-soft": Colors.primarySoft,
        background: Colors.background,
        surface: Colors.surface,
        "surface-alt": Colors.surfaceAlt,
        border: Colors.border,
        foreground: Colors.foreground,
        muted: Colors.muted,
        icon: Colors.icon,
        leaf: Colors.leaf,
        "leaf-soft": Colors.leafSoft,
        amber: Colors.amber,
        "amber-soft": Colors.amberSoft,
        success: Colors.success,
        error: Colors.error,
        warning: Colors.warning,
        info: Colors.info,
        rating: Colors.rating,
        overlay: Colors.overlay,
      },
      boxShadow: {
        recipe: "0 6px 18px rgba(113, 62, 33, 0.10)",
      },
    },
  },
  plugins: [],
};
