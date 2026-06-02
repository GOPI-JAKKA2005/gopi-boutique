/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#B8325A",
        accent: "#0F766E",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
