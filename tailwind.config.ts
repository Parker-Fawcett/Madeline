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
        teal: {
          DEFAULT: "#0d9488",
          50: "#edfcf6",
          100: "#d1f8e8",
          200: "#a7f0d5",
          300: "#6ee3bd",
          400: "#33ce9e",
          500: "#0fb386",
          600: "#0d9488",
          700: "#0d756b",
          800: "#0f5d56",
          900: "#114d47",
          950: "#032b2a",
        },
        red: {
          DEFAULT: "#dc2626",
        },
        purple: {
          DEFAULT: "#7c3aed",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
