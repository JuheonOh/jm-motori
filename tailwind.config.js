/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffc107",
        charcoal: "#212529",
        panel: "#15181b",
      },
      boxShadow: {
        glow: "0 0 26px rgba(255, 193, 7, 0.25)",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};
