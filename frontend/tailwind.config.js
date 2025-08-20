/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",   // very important
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {},
    },
    plugins: [],
}
