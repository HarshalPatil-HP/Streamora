/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0F172A",
          elevated: "#1E293B",
          border: "#334155",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          muted: "#A78BFA",
          emerald: "#10B981",
          "emerald-hover": "#059669",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.25)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
