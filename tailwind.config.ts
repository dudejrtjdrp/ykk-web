import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070b10",
          900: "#0f151d",
          800: "#192231",
          700: "#273244",
        },
        sand: {
          50: "#faf7f2",
          100: "#efe7da",
          200: "#dccab0",
        },
        lime: {
          300: "#c8f28d",
          400: "#b8ea5f",
        },
        coral: {
          300: "#f5a78e",
          400: "#ee8468",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;