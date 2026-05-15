/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["System"],
      },
      colors: {
        brand: {
          DEFAULT: "#3E3AAF",
          light: "#4F46E5",
          dark: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};
