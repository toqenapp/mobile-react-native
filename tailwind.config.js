const appColors = require("./src/theme/colors.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,tsx}", "./src/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: appColors,
      fontSize: {
        xxs: "11px",
        md: "15px",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        full: "999px",
      },
    },
  },
};
