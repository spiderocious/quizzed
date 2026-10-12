import type { Config } from 'tailwindcss';

/**
 * Family Time — "living-room party".
 *
 * Built on Gbedity's bright-room game-night system (cobalt stage, mint canvas,
 * white cards, forest ink, green for go, orange for celebration) and pushed
 * further toward play: every object wears a thick ink outline and a hard
 * drop-edge it presses INTO, type is chunkier, and things bounce.
 *
 * Every value reads a CSS variable from `src/index.css`. Nothing is hardcoded
 * here, so the palette can be re-pointed without touching a component.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Stage architecture: frame > room > card */
        stage: { DEFAULT: 'var(--stage)', deep: 'var(--stage-deep)', tint: 'var(--stage-tint)' },
        canvas: { DEFAULT: 'var(--canvas)', tint: 'var(--canvas-tint)', deep: 'var(--canvas-deep)' },
        surface: { DEFAULT: 'var(--surface)', soft: 'var(--surface-soft)' },

        /* Ink — forest, never black */
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
          5: 'var(--ink-5)',
          inv: 'var(--ink-inv)',
        },

        /* Action — forward motion */
        action: { DEFAULT: 'var(--action)', deep: 'var(--action-deep)', soft: 'var(--action-soft)' },
        /* Accent — celebration only */
        accent: { DEFAULT: 'var(--accent)', deep: 'var(--accent-deep)', soft: 'var(--accent-soft)' },

        danger: { DEFAULT: 'var(--danger)', deep: 'var(--danger-deep)', soft: 'var(--danger-soft)' },
        sun: { DEFAULT: 'var(--sun)', deep: 'var(--sun-deep)', soft: 'var(--sun-soft)' },
        berry: { DEFAULT: 'var(--berry)', soft: 'var(--berry-soft)' },
        bubble: { DEFAULT: 'var(--bubble)', soft: 'var(--bubble-soft)' },
        sky: { DEFAULT: 'var(--sky)', soft: 'var(--sky-soft)' },

        /* The four answers. Fixed order, each paired with a shape, so colour is
           never the only way to tell them apart. */
        answer: {
          a: 'var(--answer-a)',
          b: 'var(--answer-b)',
          c: 'var(--answer-c)',
          d: 'var(--answer-d)',
        },
      },
      fontFamily: {
        display: ['"Baloo 2 Variable"', '"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        chip: '14px',
        btn: '20px',
        card: '28px',
        stage: '40px',
      },
      borderWidth: {
        3: '3px',
        5: '5px',
      },
      /* Depth is a SOLID drop-edge the control presses into. Blur is reserved
         for the modal/overlay layer. */
      boxShadow: {
        'pop-sm': '0 4px 0 0 var(--ink)',
        pop: '0 6px 0 0 var(--ink)',
        'pop-lg': '0 10px 0 0 var(--ink)',
        'pop-stage': '0 10px 0 0 var(--stage-deep)',
        float: '0 24px 60px -20px rgb(22 59 46 / 0.45)',
        none: 'none',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.4) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(1.12) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'drop-in': {
          '0%': { transform: 'translateY(-120%) rotate(-6deg)', opacity: '0' },
          '65%': { transform: 'translateY(6%) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        jelly: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '30%': { transform: 'scale(1.18, 0.84)' },
          '50%': { transform: 'scale(0.9, 1.12)' },
          '70%': { transform: 'scale(1.06, 0.96)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-10px) rotate(-2deg)' },
          '40%, 80%': { transform: 'translateX(10px) rotate(2deg)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(24px, -36px) rotate(18deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.14)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { opacity: '1', transform: 'translateY(-8vh) scale(1.2)' },
          '100%': { transform: 'translateY(-70vh) scale(1)', opacity: '0' },
        },
        'grow-bar': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'count-pop': {
          '0%': { transform: 'scale(2.4)', opacity: '0' },
          '30%': { transform: 'scale(0.92)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'pop-in': 'pop-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'drop-in': 'drop-in 620ms cubic-bezier(0.34, 1.3, 0.64, 1) both',
        wiggle: 'wiggle 900ms ease-in-out infinite',
        jelly: 'jelly 700ms ease-in-out both',
        shake: 'shake 480ms ease-in-out both',
        bob: 'bob 2.6s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        heartbeat: 'heartbeat 620ms ease-in-out infinite',
        'float-up': 'float-up 2.6s ease-out forwards',
        'grow-bar': 'grow-bar 700ms cubic-bezier(0.34, 1.3, 0.64, 1) both',
        'count-pop': 'count-pop 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
