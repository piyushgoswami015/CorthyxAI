/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                cream: '#F7F4EF',
                charcoal: '#2F2F2F',
                beige: '#C4A484',
                button: '#3C3C3C',
                'dark-bg': '#0f172a',
                'dark-surface': '#1e293b',
                'dark-border': '#334155',
            },
        },
    },
    plugins: [],
}
