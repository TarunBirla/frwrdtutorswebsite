// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['"Roboto"', "sans-serif"],
        robotoCondensed: ['"Roboto Condensed"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
