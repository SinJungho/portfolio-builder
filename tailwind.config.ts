import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        spotify: {
          "near-black": "#121212",
          "dark-surface": "#181818",
          "mid-dark": "#1f1f1f",
          "green": "#1ed760",
          "green-border": "#1db954",
          "silver": "#b3b3b3",
          "near-white": "#cbcbcb",
          "card-dark": "#252525",
          "negative": "#f3727f",
          "warning": "#ffa42b",
          "announcement": "#539df5",
        },
        ink: {
          50: "#1f1f1f",
          100: "#272727",
          200: "#4d4d4d",
          300: "#7c7c7c",
          400: "#b3b3b3",
          500: "#ffffff",
        }
      },
      borderRadius: {
        pill: "9999px",
        "pill-large": "500px",
      },
      boxShadow: {
        spotify: "0 8px 24px rgba(0,0,0,0.5)",
        "spotify-md": "0 8px 8px rgba(0,0,0,0.3)",
      },
      letterSpacing: {
        spotify: "1.4px",
        "spotify-wide": "2px",
      },
    },
  },
  plugins: [],
};
export default config;
