import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#0A0A0C',
        surface: '#151519',
        surface2: '#1B1B20',
        line: 'rgba(255,255,255,0.08)',
        muted: 'rgba(255,255,255,0.6)',
        volt: '#C8FF2E',
        ember: '#FF5A36',
        danger: '#FF3B30'
      },
      boxShadow: {
        glow: '0 0 24px rgba(200,255,46,0.15)',
        ember: '0 0 24px rgba(255,90,54,0.16)'
      },
      borderRadius: {
        app: '18px'
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseVolt: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(200,255,46,0.12)' },
          '50%': { boxShadow: '0 0 32px rgba(200,255,46,0.32)' }
        },
        checkPop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '55%': { transform: 'scale(1.18)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        'slide-up': 'slide-up 220ms ease-out both',
        'pulse-volt': 'pulseVolt 950ms ease-in-out infinite',
        'check-pop': 'checkPop 360ms cubic-bezier(.2,.9,.2,1.25)'
      }
    }
  },
  plugins: []
};

export default config;
