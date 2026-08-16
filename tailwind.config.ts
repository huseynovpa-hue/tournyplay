import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0A0E13",
          surface: "#131922",
          raised: "#1B2330",
          border: "#26303F",
        },
        pitch: {
          DEFAULT: "#39D97C",
          dim: "#1F8A50",
        },
        volt: {
          DEFAULT: "#4C8DFF",
          dim: "#2E5FC7",
        },
        warn: {
          DEFAULT: "#F5A623",
        },
        danger: {
          DEFAULT: "#F5504A",
        },
        ink: {
          DEFAULT: "#EAF0F6",
          dim: "#9AA8B8",
          faint: "#5E6B7C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "pitch-lines":
          "linear-gradient(180deg, rgba(57,217,124,0.08) 0%, rgba(57,217,124,0) 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
