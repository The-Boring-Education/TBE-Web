/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff6b6b",
          500: "#ff5757",
          600: "#ed2525",
          700: "#c81b1b",
          800: "#a51a1a",
          900: "#881c1c",
          950: "#4a0909",
        },
      },
    },
  },
  plugins: [],
};
