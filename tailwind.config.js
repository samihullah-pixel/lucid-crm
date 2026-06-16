/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        black: "#080808",
        grey: "#999999",
        light: "#f7f6f4",
        gold: {
          DEFAULT: "#c9a96e",
          light: "#e8d5a3",
          dark: "#9a7a45",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Jost", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
