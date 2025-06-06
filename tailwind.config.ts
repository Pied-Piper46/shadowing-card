import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neumorph-bg': '#e0e5ec', // A common neumorphism background color
        'neumorph-primary-light': '#ffffff',
        'neumorph-primary-dark': '#a3b1c6',
        'neumorph-accent': '#5a99d4', // An accent color for interactive elements
        'neumorph-text': '#374151', // Darker text for readability
      },
      boxShadow: {
        'neumorph-convex': '7px 7px 14px #a3b1c6, -7px -7px 14px #ffffff',
        'neumorph-concave': 'inset 7px 7px 14px #a3b1c6, inset -7px -7px 14px #ffffff',
        'neumorph-pressed': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff', // For pressed state
        'neumorph-icon': '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
        'neumorph-icon-hover': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'neumorph-icon-pressed': 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
