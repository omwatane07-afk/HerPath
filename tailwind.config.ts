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
        brand: {
          bg: "#FBFAF7", // Warm porcelain foundation
          porcelain: "#FBFAF7",
          pearl: "#FFFFFF", // Pearl white
          mist: "#F4F7FA", // Dreamy mist
          ivory: "#FFFDF8", // Light ivory
          "bg-secondary": "#F3F5FA",
          surface: "#FFFFFF",
          text: "#263044", // Primary luxury slate
          "text-secondary": "#69748A", // Secondary slate
          "text-muted": "#8A94A6", // Muted metadata
          border: "#E7EAF0", // Soft architectural divider
          "border-light": "#F0F2F7",
        },
        champagne: {
          50: "#FBF6EC", // Soft warm highlight
          100: "#F7EEDD",
          200: "#F2E7D1", // Pale champagne
          300: "#E5D2AE",
          400: "#D6BC8C",
          500: "#C6A66B", // Royal champagne gold accent
          600: "#B08E53",
          700: "#8E703D",
        },
        teal: {
          25: "#F4FAF8", // Dreamy mist mint
          50: "#E5F5EF", // Soft mint
          100: "#CDEEE2",
          200: "#A2DEC9",
          300: "#6FC6AE",
          400: "#48AB9E",
          500: "#388F84", // Sea-glass teal
          600: "#246E68", // Deep teal
          700: "#1A5550",
          800: "#123D3A",
          900: "#0B2624",
        },
        powder: {
          50: "#F6F9FE",
          100: "#E8F0FC", // Powder blue surface
          200: "#D2E2FA",
          500: "#3B82F6",
        },
        lavender: {
          50: "#FAF9FE",
          100: "#EEE9F8", // Muted lavender surface
          200: "#DDD4F3",
          500: "#8B5CF6",
        },
        mint: {
          50: "#F4FAF8",
          100: "#E5F5EF", // Soft mint
          200: "#CDEEE2",
          500: "#388F84", // Sea-glass teal
          600: "#246E68", // Deep teal
        },
        warning: {
          50: "#FFF8EB",
          100: "#FEF0D4",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        danger: {
          50: "#FFF1F3",
          100: "#FFE4E8",
          500: "#E11D48",
          600: "#BE123C",
          700: "#9F1239",
        },
        navy: {
          950: "#FAF9F6",
          900: "#FFFFFF",
          850: "#F5F7FB",
          800: "#E7EAF0",
          750: "#D0D6E2",
          700: "#8992A4",
          600: "#667085",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(32, 40, 58, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        "glass-pearl": "0 10px 32px -4px rgba(21, 159, 145, 0.07), 0 4px 12px -2px rgba(32, 40, 58, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)",
        "glass-crystal": "0 6px 20px -2px rgba(32, 40, 58, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
        "glass-floating": "0 20px 48px -8px rgba(32, 40, 58, 0.10), 0 6px 16px -2px rgba(32, 40, 58, 0.04), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)",
        "royal-gold": "0 4px 16px -1px rgba(198, 166, 107, 0.20), 0 2px 6px -1px rgba(198, 166, 107, 0.12)",
        card: "0 4px 20px -2px rgba(32, 40, 58, 0.04), 0 2px 6px -1px rgba(32, 40, 58, 0.02)",
        "card-hover": "0 12px 30px -4px rgba(32, 40, 58, 0.08), 0 4px 12px -2px rgba(32, 40, 58, 0.04)",
        float: "0 14px 38px -4px rgba(32, 40, 58, 0.09), 0 4px 14px -2px rgba(32, 40, 58, 0.03)",
        "float-lg": "0 24px 54px -6px rgba(32, 40, 58, 0.12), 0 8px 24px -3px rgba(32, 40, 58, 0.05)",
        "inner-glass": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
      },
      borderRadius: {
        card: "22px",
        sheet: "32px",
        royal: "26px",
      },
    },
  },
  plugins: [],
};

export default config;
