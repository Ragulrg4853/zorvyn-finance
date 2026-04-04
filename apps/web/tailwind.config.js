/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:            '#0a0f1e',
        surface:       '#111827',
        'surface-2':   '#1a2235',
        border:        '#1e2d45',
        primary:       '#00d4aa',
        'primary-dim': '#00a885',
        gold:          '#d4af37',
        'gold-dim':    '#b8962e',
        't1':          '#f0f4ff',
        't2':          '#8b9dc3',
        't3':          '#4a5568',
        income:        '#22c55e',
        expense:       '#ef4444',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      borderRadius: { card: '12px', input: '8px', btn: '6px' },
      boxShadow: {
        card:       '0 8px 32px rgba(0,212,170,0.08)',
        'card-hover':'0 12px 40px rgba(0,212,170,0.15)',
      },
    },
  },
  plugins: [],
};
