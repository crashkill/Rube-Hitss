/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class‑based dark mode
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            // Add any custom colors, fonts, etc. here if needed
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
