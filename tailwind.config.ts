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
        // =====================================================================
        // NIGHTBLOOM DESIGN SYSTEM
        // Aubergine ink, electric violet route, champagne detail.
        // Nocturnal luxury that stays legible at noon.
        // =====================================================================
        ink: {
          DEFAULT: "#1E0F28",
          2: "#3A1C4A",
          hover: "#140A1C",
          active: "#0D0612",
        },
        canvas: {
          DEFAULT: "#F7F3EE",
          2: "#EEE8E1",
          subtle: "#EEE8E1",
        },
        card: {
          DEFAULT: "#FFFFFF",
        },
        raised: {
          DEFAULT: "#FBF8F4",
          hover: "#F3EDE4",
        },
        primary: {
          DEFAULT: "#5A2FC2",
          hover: "#46229C",
          active: "#381980",
          tint: "#EDE5FA",
        },
        champagne: {
          DEFAULT: "#C9A25E",
          hover: "#B58F4A",
          dark: "#7A5A1E",
          text: "#7A5A1E",
          tint: "#FDF8EE",
        },
        text: {
          DEFAULT: "#1E0F28",
          primary: "#1E0F28",
          secondary: "#5E5068",
          muted: "#6F6179",
          gold: "#7A5A1E",
          disabled: "#8E8296",
        },
        border: {
          DEFAULT: "#E4DCD3",
          control: "#867B72",
          gold: "#C9A25E",
          subtle: "#EDE6DD",
        },
        "route-alt": {
          DEFAULT: "#6E6090",
        },
        "route-casing": {
          DEFAULT: "#FFFFFF",
        },
        // Semantic safety tokens
        emergency: {
          DEFAULT: "#C21428",
          hover: "#A30F20",
          tint: "#FDECEE",
        },
        error: {
          DEFAULT: "#9E1B24",
          tint: "#FCEAEB",
        },
        caution: {
          DEFAULT: "#A8560A",
          text: "#8A4A08",
          tint: "#FDF2E3",
        },
        verified: {
          DEFAULT: "#1F6B4D",
          tint: "#E6F3EC",
        },
        info: {
          DEFAULT: "#1F5FA8",
          tint: "#EEF4FC",
        },
        unknown: {
          DEFAULT: "#6F6179",
        },
        // Facility marker categories
        facility: {
          transit: "#1F5FA8",
          women: "#8E2F7E",
          medical: "#0F766E",
          police: "#2B3A67",
          streetlight: "#8A6A10",
        },
        // Backward-compatible aliases so existing code never breaks
        bordeaux: {
          DEFAULT: "#1E0F28",
          hover: "#140A1C",
          dark: "#0D0612",
          tint: "#EDE5FA",
        },
        velvet: {
          DEFAULT: "#3A1C4A",
          hover: "#2A1236",
        },
        "rose-gold": {
          DEFAULT: "#5A2FC2",
          hover: "#46229C",
          tint: "#EDE5FA",
        },
        peacock: {
          DEFAULT: "#5A2FC2",
          dark: "#46229C",
          tint: "#EDE5FA",
          hover: "#46229C",
        },
        clay: {
          DEFAULT: "#C9A25E",
          tint: "#FDF8EE",
        },
        paper: {
          DEFAULT: "#F7F3EE",
        },
        danger: {
          DEFAULT: "#9E1B24",
          tint: "#FCEAEB",
        },
      },
      boxShadow: {
        e1: "0 2px 8px rgba(30, 15, 40, 0.05)",
        e2: "0 8px 24px rgba(30, 15, 40, 0.08)",
        e3: "0 20px 48px -10px rgba(30, 15, 40, 0.14)",
        atelier: "0 20px 50px -10px rgba(30, 15, 40, 0.12), 0 0 0 1px rgba(228, 220, 211, 0.6)",
        violet: "0 4px 16px rgba(90, 47, 194, 0.25)",
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
        serif: ["var(--font-serif-display)", "Fraunces", "Georgia", "serif"],
        editorial: ["var(--font-serif-display)", "Fraunces", "Georgia", "serif"],
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
