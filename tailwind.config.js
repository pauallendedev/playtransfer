/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      // ... etc
    ],
    theme: {
      extend: {
        colors: {
          spotify: "#1DB954",
          googleBlue: "#4285F4",
          primaryBlack: "#121212",
          secondaryGray: "#B3B3B3",
          foreground: "#ffffff",
        },
        fontFamily: {
          inter: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  };
  