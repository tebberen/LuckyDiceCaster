import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "celo-yellow": "#FBCC5C",
        "deep-black": "#101010",
        "gold-premium": "#E2B33C",
        "gold-dark": "#D4A83E",
      },
    },
  },
  plugins: [],
};
export default config;
