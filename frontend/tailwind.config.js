/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      colors: {
        // ── Core monochromatic palette ──────────────────────────────
        brand: {
          50:  "#F5F5F5",
          100: "#EBEBEB",
          200: "#D6D6D6",
          500: "#404040",
          600: "#1A1A1A",
          700: "#0A0A0A",
        },
        // ── Surface tokens ─────────────────────────────────────────
        surface: "#FFFFFF",
        "surface-muted":  "#F9F9F9",
        "surface-border": "#E8E8E8",
        "surface-hover":  "#F3F3F3",
        // ── Sidebar / dark zone tokens ──────────────────────────────
        dark: {
          bg:     "#0A0A0A",
          card:   "#141414",
          border: "#252525",
          hover:  "#1E1E1E",
          muted:  "#2A2A2A",
          text:   "#A3A3A3",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft:  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        card:  "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
        crisp: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        glow:  "0 0 0 3px rgba(0,0,0,0.10)",
        "glow-white": "0 0 0 3px rgba(255,255,255,0.15)",
      },
      animation: {
        "fade-up":  "fadeUp 0.35s ease forwards",
        "fade-in":  "fadeIn 0.25s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:  { "0%": { opacity: 0 },                               "100%": { opacity: 1 } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(12px)" },"100%": { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
