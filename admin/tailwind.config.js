/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c4ff',
          300: '#a59eff',
          400: '#8b7dff',
          500: '#6C63FF',
          600: '#5a4fe6',
          700: '#4a3fcc',
          800: '#3a30a3',
          900: '#2a2280',
        },
      },
    },
  },
  plugins: [],
};
