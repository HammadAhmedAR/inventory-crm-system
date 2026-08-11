/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        surface: "#1e293b",
        "surface-elevated": "#273549",
        border: "#334155",
        muted: "#94a3b8",
        subtle: "#64748b",
        accent: {
          DEFAULT: "#eab308",
          hover: "#ca8a04",
          muted: "#422006",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "#052e16",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "#450a0a",
        },
        info: {
          DEFAULT: "#38bdf8",
          muted: "#0c2240",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(51,65,85,0.8), 0 4px 16px rgba(0,0,0,0.4)",
        "card-hover":
          "0 0 0 1px rgba(234,179,8,0.4), 0 8px 24px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(234,179,8,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
