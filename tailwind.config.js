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
        navy: {
          950: '#051329',
          900: '#071A3D',
          850: '#09204A',
          800: '#0B2559', // Primary Sidebar/Headers
          700: '#10377e',
          600: '#16489b',
        },
        royalblue: {
          DEFAULT: '#15529E', // Primary Actions
          hover: '#114280',
          light: '#eaf1fb',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#15529E',
          600: '#114280',
          700: '#0e3466',
        },
        teal: {
          DEFAULT: '#008B9E', // Accents
          hover: '#007485',
          light: '#e0f6f9',
          50: '#f0fdfa',
          500: '#008B9E',
          600: '#007485',
          700: '#0e5f6d',
        },
        slate: {
          appbg: '#F6F9FC', // Light background
          border: '#E2E8F0', // 1px borders
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(11, 37, 89, 0.05), 0 1px 2px 0 rgba(11, 37, 89, 0.03)',
        'card-hover': '0 4px 12px 0 rgba(11, 37, 89, 0.08), 0 2px 4px 0 rgba(11, 37, 89, 0.04)',
        'elevated': '0 10px 25px -5px rgba(11, 37, 89, 0.1), 0 8px 10px -6px rgba(11, 37, 89, 0.05)',
      }
    },
  },
  plugins: [],
}
