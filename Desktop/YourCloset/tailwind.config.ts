import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        yc: {
          bg: "#FFFFFF",
          surface: "#F5F5F7",
          "surface-elevated": "#FFFFFF",
          text: "#1D1D1F",
          "text-secondary": "#6E6E73",
          "text-tertiary": "#AEAEB2",
          accent: "#0071E3",
          "accent-hover": "#0077ED",
          border: "#D2D2D7",
          success: "#34C759",
          error: "#FF3B30",
          "glass-bg": "rgba(255,255,255,0.72)",
          "glass-border": "rgba(255,255,255,0.3)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        rounded: ["ui-rounded", "-apple-system", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.4" }],
        base: ["15px", { lineHeight: "1.5" }],
        md: ["17px", { lineHeight: "1.5" }],
        lg: ["20px", { lineHeight: "1.4" }],
        xl: ["24px", { lineHeight: "1.3" }],
        "2xl": ["28px", { lineHeight: "1.25" }],
        "3xl": ["34px", { lineHeight: "1.2" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12)",
        modal: "0 8px 32px rgba(0,0,0,0.16)",
        "bottom-sheet": "0 -2px 16px rgba(0,0,0,0.08)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
export default config;
