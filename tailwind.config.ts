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
        // GIRLY MAP WORLD DESIGN SYSTEM (HERPATH)
        // Clean white, pale lavender, rich purple, hot pink & dark plum
        // =====================================================================
        canvas: {
          DEFAULT: "#FCFAFF",
          2: "#F6F0FF",
          subtle: "#F1EAFF",
        },
        paper: {
          DEFAULT: "#FCFAFF",
          2: "#F6F0FF",
        },
        card: {
          DEFAULT: "#FFFFFF",
        },
        raised: {
          DEFAULT: "#FFFFFF",
          hover: "#F8F4FF",
        },
        lavender: {
          DEFAULT: "#F1EAFF",
          pale: "#F8F4FF",
          light: "#F1EAFF",
          dark: "#DCCBFF",
        },
        lilac: {
          DEFAULT: "#DCCBFF",
          wash: "#F1EAFF",
          light: "#F5EFFF",
          dark: "#C5AFFF",
        },
        bubblegum: {
          DEFAULT: "#FF91C8",
          light: "#FFAED6",
          dark: "#E86DA9",
          tint: "#FFF2F8",
        },
        hotpink: {
          DEFAULT: "#F65BA8",
          hover: "#DE3F90",
          tint: "#FFF0F6",
        },
        strawberry: {
          DEFAULT: "#FF91C8",
          hover: "#F65BA8",
          tint: "#FFF0F6",
        },
        grape: {
          DEFAULT: "#7047EB",
          hover: "#5C32D9",
          active: "#4A258C",
          tint: "#F1EAFF",
        },
        primary: {
          DEFAULT: "#7047EB",
          hover: "#5C32D9",
          active: "#4A258C",
          tint: "#F1EAFF",
        },
        purple: {
          deep: "#4A258C",
          rich: "#7047EB",
          glow: "#B99AFF",
        },
        periwinkle: {
          DEFAULT: "#B99AFF",
          hover: "#9F7AFA",
          tint: "#F5F0FF",
        },
        butter: {
          DEFAULT: "#FFD966",
          hover: "#F5CE54",
          tint: "#FFF9E6",
        },
        ink: {
          DEFAULT: "#191421",
          2: "#2A2038",
          hover: "#0E0A14",
          active: "#08050C",
        },
        "soft-ink": {
          DEFAULT: "#665B76",
        },
        champagne: {
          DEFAULT: "#FFD966",
          hover: "#F5CE54",
          dark: "#8A5A00",
          text: "#8A5A00",
          tint: "#FFF9E6",
        },
        text: {
          DEFAULT: "#191421",
          primary: "#191421",
          secondary: "#665B76",
          muted: "#8A7D9D",
          gold: "#8A5A00",
          disabled: "#B3A7C5",
        },
        border: {
          DEFAULT: "#EBDDFF",
          control: "#8F7D9E",
          gold: "#FFD966",
          subtle: "#F5EDFF",
        },
        "route-alt": {
          DEFAULT: "#DCCBFF",
        },
        "route-casing": {
          DEFAULT: "#FFFFFF",
        },
        // Strict Functional Semantic Tokens
        verified: {
          DEFAULT: "#1F7A5C",
          tint: "#E8F5F0",
        },
        caution: {
          DEFAULT: "#8A5A00",
          text: "#8A5A00",
          tint: "#FFF3CC",
        },
        danger: {
          DEFAULT: "#A4003F",
          tint: "#FFE4EC",
        },
        emergency: {
          DEFAULT: "#C1121F",
          hover: "#A30E1A",
          tint: "#FFEBEB",
        },
        error: {
          DEFAULT: "#C1121F",
          tint: "#FFEBEB",
        },
        info: {
          DEFAULT: "#7047EB",
          tint: "#F1EAFF",
        },
        unknown: {
          DEFAULT: "#8A7D9D",
        },
        sos: {
          DEFAULT: "#C1121F",
          bg: "#1E1233",
        },
        facility: {
          transit: "#7047EB",
          women: "#F65BA8",
          medical: "#1F7A5C",
          police: "#191421",
          streetlight: "#FFD966",
          cafe: "#FF91C8",
        },
      },
      boxShadow: {
        e1: "0 2px 8px rgba(25, 20, 33, 0.05)",
        e2: "0 8px 24px rgba(112, 71, 235, 0.08)",
        e3: "0 20px 48px -10px rgba(112, 71, 235, 0.16)",
        sticker: "0 4px 14px rgba(112, 71, 235, 0.12), 0 0 0 3px #FFFFFF",
        "sticker-lg": "0 8px 24px rgba(112, 71, 235, 0.18), 0 0 0 4px #FFFFFF",
        grape: "0 4px 18px rgba(112, 71, 235, 0.32)",
        pink: "0 4px 18px rgba(246, 91, 168, 0.35)",
        glow: "0 0 16px rgba(185, 154, 255, 0.6)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        card: "20px",
        sticker: "20px",
        sheet: "28px",
        modal: "28px",
        pill: "9999px",
      },
      fontFamily: {
        heading: ["'Bricolage Grotesque'", "system-ui", "-apple-system", "sans-serif"],
        editorial: ["'Bricolage Grotesque'", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Bricolage Grotesque'", "system-ui", "-apple-system", "sans-serif"],
        sans: ["'Inter'", "'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
        handwriting: ["'Caveat'", "cursive"],
      },
      transitionDuration: {
        micro: "150ms",
        card: "220ms",
        scene: "400ms",
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
