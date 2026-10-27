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
          bg: "#FAF9F6", // Warm porcelain foundation
          pearl: "#F5F7FB", // Soft pearl
          mist: "#EEF3FA", // Mist blue
          ivory: "#FFFDF8", // Light ivory
          "bg-secondary": "#F3F5FA",
          surface: "#FFFFFF",
          text: "#20283A", // Primary luxury slate
          "text-secondary": "#667085", // Secondary slate
          "text-muted": "#8992A4", // Muted metadata
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
          25: "#F1FAF6", // Mist mint
          50: "#E6F7F2", // Pale mint
          100: "#C9EFE4",
          200: "#9FE1D1",
          300: "#6ECEBB",
          400: "#3EBAA6",
          500: "#159F91", // Primary Royal Teal
          600: "#117D75", // Deep Teal
          700: "#0E645E",
          800: "#0B4C47",
          900: "#07322F",
        },
        powder: {
          50: "#F4F8FF",
          100: "#E9F1FF", // Powder blue surface
          200: "#D4E4FF",
          500: "#3B82F6",
        },
        lavender: {
          50: "#FAF9FF",
          100: "#F0EDFF", // Lavender mist
          200: "#DFD8FF",
          500: "#8B5CF6",
        },
        blush: {
          50: "#FFF7F8",
          100: "#FFF0F1", // Soft blush
          500: "#F43F5E",
        },
        sage: {
          50: "#F4F9F4",
          100: "#E8F2E8", // Muted sage
          500: "#10B981",
        },
        mint: {
          50: "#F1FAF6",
          100: "#E6F7F2",
          500: "#159F91",
          600: "#117D75",
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
