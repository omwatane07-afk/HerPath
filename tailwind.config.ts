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
        ink: {
          DEFAULT: "#14213D",
          hover: "#0D1629",
          active: "#080E1A",
        },
        peacock: {
          DEFAULT: "#0E7C86",
          dark: "#0B6169",
          tint: "#DCEFF0",
          hover: "#09626A",
        },
        clay: {
          DEFAULT: "#D8A58E",
          tint: "#F7ECE6",
        },
        paper: {
          DEFAULT: "#F8F4EC",
        },
        raised: {
          DEFAULT: "#F1EBDD",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          paper: "#F8F4EC",
          raised: "#F1EBDD",
        },
        border: {
          DEFAULT: "#E3DCCD",
          strong: "#B9AF99",
        },
        text: {
          DEFAULT: "#14213D",
          secondary: "#55607A",
          muted: "#6D6A63",
          disabled: "#6D6A63",
        },
        emergency: {
          DEFAULT: "#C41230",
          hover: "#A80D27",
        },
        danger: {
          DEFAULT: "#A4161A",
          tint: "#FBE9EA",
        },
        caution: {
          DEFAULT: "#B25E00",
          dark: "#8A4800",
          tint: "#FDF1E0",
        },
        verified: {
          DEFAULT: "#1B6B4A",
          tint: "#E4F2EB",
        },
        info: {
          DEFAULT: "#1D5FA8",
          tint: "#EBF3FC",
        },
      },
      boxShadow: {
        e1: "0 1px 2px rgba(20, 33, 61, 0.08)",
        e2: "0 4px 12px rgba(20, 33, 61, 0.10)",
        e3: "0 10px 24px rgba(20, 33, 61, 0.14)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        card: "16px",
        sheet: "20px",
        modal: "20px",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
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
