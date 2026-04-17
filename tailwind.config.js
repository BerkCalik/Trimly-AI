/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./entrypoints/**/*.{html,ts,css}", "./src/**/*.{html,ts,css}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8f7f1",
          100: "#ece8d8",
          300: "#cdbf8c",
          500: "#9d8446",
          700: "#634d26",
          900: "#2e2211",
        },
        mist: {
          50: "#f6fbfa",
          100: "#dcefed",
          300: "#8bc5be",
          500: "#2f887f",
          700: "#16554f",
          900: "#0f2b28",
        },
        coral: {
          100: "#ffe6db",
          300: "#f6a686",
          500: "#e16d3d",
          700: "#9b4321",
        },
      },
      boxShadow: {
        soft: "0 20px 50px -30px rgba(24, 39, 75, 0.45)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
