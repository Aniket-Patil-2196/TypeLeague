/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    boxShadow: {
      none: 'none',
      DEFAULT: 'none',
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--ink-muted)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          press: 'var(--accent-press)',
        },
        panel: {
          DEFAULT: 'var(--panel)',
          line: 'var(--panel-line)',
        },
        error: 'var(--error)',
        ok: 'var(--ok)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Tektur', 'Michroma', '"Bruno Ace SC"', 'sans-serif'],
      },
      spacing: {
        '72px': '72px',
        '56px': '56px',
        '28px': '28px',
      },
    },
  },
  plugins: [],
}
