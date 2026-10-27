import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Atelier Palette
        bordeaux: {
          DEFAULT: "#240D1E",
          hover: "#180814",
          dark: "#10050D",
          tint: "#F5EFF2",
        },
        velvet: {
          DEFAULT: "#4A1E35",
          hover: "#391428",
        },
        "rose-gold": {
          DEFAULT: "#C8415F",
          hover: "#B0324E",
          tint: "#FCEEF2",
        },
        champagne: {
          DEFAULT: "#D4A359",
          hover: "#BF8A3D",
          dark: "#9C6E2E",
          tint: "#FDF8EE",
        },
        canvas: {
          DEFAULT: "#FAF6F0",
          subtle: "#F3ECE1",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          raised: "#F8F3EC",
          subtle: "#F3ECE1",
        },
        border: {
          DEFAULT: "#E8DFD7",
          strong: "#C4B5A9",
          gold: "#D4A359",
          rose: "#E5CAD1",
        },
        text: {
          DEFAULT: "#240D1E",
          primary: "#240D1E",
          secondary: "#6B5663",
          muted: "#8A7783",
          gold: "#9C6E2E",
          disabled: "#A0929B",
        },
        // Backward-compatible design token mappings
        ink: {
          DEFAULT: "#240D1E",
          hover: "#180814",
          active: "#10050D",
        },
        peacock: {
          DEFAULT: "#C8415F",
          dark: "#A32D48",
          tint: "#FCEEF2",
          hover: "#B0324E",
        },
        clay: {
          DEFAULT: "#D4A359",
          tint: "#FDF8EE",
        },
        paper: {
          DEFAULT: "#FAF6F0",
        },
        raised: {
          DEFAULT: "#F8F3EC",
        },
        // Semantic safety tokens
        emergency: {
          DEFAULT: "#C21428",
          hover: "#A30F20",
          tint: "#FDECEE",
        },
        danger: {
          DEFAULT: "#9E1B24",
          tint: "#FCEAEB",
        },
        caution: {
          DEFAULT: "#BA6A15",
          dark: "#944F0B",
          tint: "#FDF2E3",
        },
        verified: {
          DEFAULT: "#1C6B48",
          tint: "#E6F3EC",
        },
        info: {
          DEFAULT: "#255EA8",
          tint: "#EEF4FC",
        },
      },
      boxShadow: {
        e1: "0 2px 8px rgba(36, 13, 30, 0.05)",
        e2: "0 8px 24px rgba(36, 13, 30, 0.08)",
        e3: "0 20px 48px -10px rgba(36, 13, 30, 0.14)",
        atelier: "0 24px 60px -12px rgba(36, 13, 30, 0.16), 0 0 0 1px rgba(212, 163, 89, 0.15)",
        "rose-glow": "0 0 20px rgba(200, 65, 95, 0.35)",
        "gold-glow": "0 0 15px rgba(212, 163, 89, 0.30)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        card: "20px",
        atelier: "24px",
        sheet: "28px",
        modal: "28px",
      },
      fontFamily: {
        serif: ["var(--font-serif-display)", "Playfair Display", "Georgia", "serif"],
        editorial: ["var(--font-serif-display)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans-ui)", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      transitionDuration: {
        micro: "150ms",
        card: "240ms",
        scene: "450ms",
        route: "800ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
        emphasis: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
