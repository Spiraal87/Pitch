import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          green:        '#2D5016',
          'green-mid':  '#3B6B1E',
          'green-light':'#EBF2E3',
          'green-accent':'#5A8A28',
          cream:        '#FAFAF7',
          ink:          '#1A1A18',
          'ink-mid':    '#4A4A46',
          'ink-light':  '#8A8A85',
          rule:         '#E2E2DC',
          white:        '#FFFFFF',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
