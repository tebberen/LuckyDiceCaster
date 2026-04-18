import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FBCC5C",
        foreground: "#FFFFFF",
        gold: {
          DEFAULT: "#FBCC5C",
          dark: "#D4A83E",
          light: "#FDE096",
        },
      },
    },
  },
  plugins: [],
};
export default config;
