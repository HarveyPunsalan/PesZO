import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0C0A08",
        surface1: "#141210",
        surface2: "#1C1917",
        surface3: "#242220",
        gold: "#C9A84C",
        textPrimary: "#F5F0E8",
        textSecondary: "#8C8680",
        textMuted: "#4C4844",
        success: "#4ADE80",
        danger: "#F87171",
        warning: "#FBBF24",
        borderSubtle: "#2C2925",
        borderDefault: "#3C3835",
        borderStrong: "#4C4844",
        goldDefault: "#D4B357",
        goldBright: "#E8C876",
        goldGlow: "#C9A84C18",
        info: "#60A5FA",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
