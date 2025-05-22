/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'admin-accent': '#1bf07c', 
                'admin-muted': '#a1a1aa', 
                'admin-card': '#2e3440',  
                'admin-active': "#1bf07c"
            }
        },
    },
    plugins: [],
};
