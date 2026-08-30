/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Complete Deep Teal Primary Scale (Brand Primary = 700: #0f766e)
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e', // Main brand primary
          800: '#115e59', // Primary hover / dark
          900: '#134e4a',
          950: '#042f2e',
          DEFAULT: '#0f766e',
          dark: '#115e59',
        },
        // Complete Warm Amber Accent Scale (Brand Accent = 600: #d97706)
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Main AI / action accent
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
        // Semantic Surfaces
        surface: {
          page:     '#fafaf9', // stone-50
          card:     '#ffffff', // white
          muted:    '#f5f5f4', // stone-100
          elevated: '#ffffff',
          dark:     '#1c1917', // stone-900
        },
        // Semantic Content / Text
        content: {
          primary:   '#1c1917', // stone-900
          secondary: '#57534e', // stone-600
          muted:     '#a8a29e', // stone-400
          inverse:   '#ffffff',
        },
        // Semantic Border Lines (border-line, border-line-subtle, border-line-strong)
        line: {
          DEFAULT: '#e7e5e4', // stone-200
          subtle:  '#f5f5f4', // stone-100
          strong:  '#d6d3d1', // stone-300
        },
        // Semantic Feedback States with full scales
        success: {
          50:      '#ecfdf5',
          100:     '#d1fae5',
          200:     '#a7f3d0',
          600:     '#059669',
          700:     '#047857',
          800:     '#065f46',
          DEFAULT: '#059669',
          dark:    '#047857',
        },
        warning: {
          50:      '#fffbeb',
          100:     '#fef3c7',
          200:     '#fde68a',
          600:     '#d97706',
          700:     '#b45309',
          800:     '#92400e',
          DEFAULT: '#d97706',
          dark:    '#b45309',
        },
        error: {
          50:      '#fef2f2',
          100:     '#fee2e2',
          200:     '#fecaca',
          600:     '#dc2626',
          700:     '#b91c1c',
          800:     '#991b1b',
          DEFAULT: '#dc2626',
          dark:    '#b91c1c',
        },
        info: {
          50:      '#f0f9ff',
          100:     '#e0f2fe',
          200:     '#bae6fd',
          600:     '#0284c7',
          700:     '#0369a1',
          800:     '#075985',
          DEFAULT: '#0284c7',
          dark:    '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        control: '0.75rem', // 12px
        card:    '1rem',    // 16px
        panel:   '1.5rem',  // 24px
      },
      boxShadow: {
        card:     '0 4px 20px -4px rgba(15, 118, 110, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        elevated: '0 12px 32px -6px rgba(15, 118, 110, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        glass:    '0 8px 32px 0 rgba(15, 118, 110, 0.12)',
      },
      maxWidth: {
        container: '1280px',
      },
      spacing: {
        sidebar: '256px',
        header:  '64px',
      },
    },
  },
  plugins: [],
};
