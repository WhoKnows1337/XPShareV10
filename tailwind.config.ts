import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui base colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Observatory Design System - Deep Space Theme
        'space-deep': '#0f1419',
        'space-mid': '#1a2332',
        'space-light': '#26354a',
        'observatory-gold': '#d4a574',
        'observatory-light': '#e8dcc0',
        'text-primary': '#e8dcc0',
        'text-secondary': 'rgba(232, 220, 192, 0.7)',
        'text-tertiary': 'rgba(232, 220, 192, 0.5)',
        'text-monospace': 'rgba(232, 220, 192, 0.5)',
        'success-soft': '#7fb069',
        'error-soft': '#d4726a',
        'warning-soft': '#d4a574',
        'glass-bg': 'rgba(26, 35, 50, 0.6)',
        'glass-border': 'rgba(232, 220, 192, 0.15)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '28px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'obs-sm': '6px',
        'obs-base': '8px',
        'obs-md': '12px',
        'obs-lg': '16px',
        'obs-xl': '24px',
      },
      backdropBlur: {
        'obs': '20px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Observatory Animations
        "twinkle": {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        "gentle-glow": {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212, 165, 116, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.3)' },
        },
        "tooltip-bounce": {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(-5px)' },
        },
        "rotate-slow": {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        "bounce-in": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        "slide-up": {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // XP Flow V2 - Enhanced Animations
        "pulse-glow": {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(212, 165, 116, 0.2), inset 0 0 10px rgba(212, 165, 116, 0.05)',
            borderColor: 'rgba(212, 165, 116, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(212, 165, 116, 0.4), inset 0 0 15px rgba(212, 165, 116, 0.1)',
            borderColor: 'rgba(212, 165, 116, 0.5)',
          },
        },
        "scale-bounce": {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        "fly-in-right": {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        "fly-in-up": {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        "shake-subtle": {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        "glow-pulse": {
          '0%, 100%': { opacity: '0.5', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Observatory Animations
        "twinkle": "twinkle 3s ease-in-out infinite",
        "gentle-glow": "gentle-glow 2s ease-in-out infinite",
        "tooltip-bounce": "tooltip-bounce 0.5s ease-out",
        "rotate-slow": "rotate-slow 2s linear infinite",
        "bounce-in": "bounce-in 0.6s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        // XP Flow V2 Enhanced
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scale-bounce": "scale-bounce 0.3s ease-out",
        "fly-in-right": "fly-in-right 0.4s ease-out",
        "fly-in-up": "fly-in-up 0.4s ease-out",
        "shake-subtle": "shake-subtle 0.4s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
