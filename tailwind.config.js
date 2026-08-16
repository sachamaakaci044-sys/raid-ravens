/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0c",
        panel: "#141417",
        panel2: "#19191d",
        border: "#2a2a30",
        accent: "#a13bff",
        accentdim: "#3a2166",
        accent2: "#e8b34d",
        accent2dim: "#5c451c",
        explored: "#3ddc84",
        pos: "#f2a541",
        danger: "#e2574c",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SF Mono", "monospace"],
        sans: ["Inter", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Anton", "Rajdhani", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
