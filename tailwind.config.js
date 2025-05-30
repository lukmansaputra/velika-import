/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // atau sesuaikan dengan struktur proyekmu
    "./views/**/*.ejs", // kalau kamu pakai EJS
  ],
  darkMode: "class", // ✅ WAJIB
  theme: {
    extend: {},
  },
  plugins: [],
};
