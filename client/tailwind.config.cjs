/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "back-pattern": "url('./assets/back-pattern.png')",
        "checkered-pattern": "url('./assets/checkered-pattern.png')",
      },
    },
  },
  plugins: [],
};
