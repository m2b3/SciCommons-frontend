import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';
import { PluginAPI } from 'tailwindcss/types/config';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
    // Path to Tremor module
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // light mode
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Custom Colors
        neutral: {
          0: 'rgba(var(--neutral-0))',
          50: 'rgba(var(--neutral-50))',
          100: 'rgba(var(--neutral-100))',
          150: 'rgba(var(--neutral-150))',
          200: 'rgba(var(--neutral-200))',
          300: 'rgba(var(--neutral-300))',
          400: 'rgba(var(--neutral-400))',
          500: 'rgba(var(--neutral-500))',
          600: 'rgba(var(--neutral-600))',
          650: 'rgba(var(--neutral-650))',
          700: 'rgba(var(--neutral-700))',
          750: 'rgba(var(--neutral-750))',
          800: 'rgba(var(--neutral-800))',
          850: 'rgba(var(--neutral-850))',
          900: 'rgba(var(--neutral-900))',
          950: 'rgba(var(--neutral-950))',
        },
        blue: {
          100: 'rgba(var(--blue-100))',
          200: 'rgba(var(--blue-200))',
          300: 'rgba(var(--blue-300))',
          400: 'rgba(var(--blue-400))',
          450: 'rgba(var(--blue-450))',
          500: 'rgba(var(--blue-500))',
          600: 'rgba(var(--blue-600))',
          700: 'rgba(var(--blue-700))',
          800: 'rgba(var(--blue-800))',
        },
        functional: {
          green: 'rgba(var(--Functional-Green-Green))',
          greenLight: 'rgba(var(--Functional-Green-GreenLight))',
          greenContrast: 'rgba(var(--Functional-Green-Greencontrast))',
          blue: 'rgba(var(--Functional-Blue-Blue))',
          blueLight: 'rgba(var(--Functional-Blue-BlueLight))',
          blueContrast: 'rgba(var(--Functional-Blue-Bluecontrast))',
          yellow: 'rgba(var(--Functional-Yellow-Yellow))',
          yellowLight: 'rgba(var(--Functional-Yellow-YellowLight))',
          yellowContrast: 'rgba(var(--Functional-Yellow-Yellowcontrast))',
          red: 'rgba(var(--Functional-Red-Red))',
          redLight: 'rgba(var(--Functional-Red-RedLight))',
          redContrast: 'rgba(var(--Functional-Red-Redcontrast))',
        },
        common: {
          background: 'rgba(var(--Common-Background))',
          cardBackground: 'rgba(var(--Common-CardBackground))',
          minimal: 'rgba(var(--Common-Minimal))',
          contrast: 'rgba(var(--Common-Contrast))',
          heavyContrast: 'rgba(var(--Common-HeavyContrast))',
        },
        accessory: {
          accessory1: 'rgba(var(--Accessory-Accessory1))',
          accessory2: 'rgba(var(--Accessory-Accessory2))',
          accessory3: 'rgba(var(--Accessory-Accessory3))',
          accessory4: 'rgba(var(--Accessory-Accessory4))',
          accessory5: 'rgba(var(--Accessory-Accessory5))',
          accessory6: 'rgba(var(--Accessory-Accessory6))',
          accessory7: 'rgba(var(--Accessory-Accessory7))',
        },
        text: {
          primary: 'rgba(var(--Text-Primary))',
          secondary: 'rgba(var(--Text-Secondary))',
          tertiary: 'rgba(var(--Text-Tertiary))',
        },
        berry: {
          base: 'rgba(var(--Berry-Base))',
          background: 'rgba(var(--Berry-Background))',
          border: 'rgba(var(--Berry-Border))',
          contrast: 'rgba(var(--Berry-Contrast))',
          displayHeading: 'rgba(var(--Berry-DisplayHeading))',
        },
        /* Candy Text */
        'candy-text': {
          berry: '#3d84ff',
          jelly: '#ff70b8',
          kiwi: '#37d277',
          lemon: '#f5be00',
          plum: '#8d70ff',
          mint: '#5bf',
          tango: '#ff932e',
          cherry: '#ff5752',
          lychee: '#ff5c92',
        },
        // Loading
        loading: 'var(--loading)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',

        // Custom Radius
        'common-lg': '10px',
        'common-xl': '20px',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/4': '3 / 4',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        // light
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // dark
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

        // common shadow
        common: '0px 6px 20px 0px rgba(0, 0, 0, 0.03)',
      },
      fontSize: {
        'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-brand': theme('colors.green.500'),
          '--color-brand-dark': theme('colors.green.700'),
        },
      });
    }),
    require('@headlessui/tailwindcss'),
    // require('nightwind'),
    plugin(function ({ addUtilities }: PluginAPI) {
      const newUtilities = {
        '.res-text-xs': {
          '@apply text-xs md:text-sm': {},
        },
        '.res-text-sm': {
          '@apply text-sm md:text-base': {},
        },
        '.res-text-base': {
          '@apply text-base md:text-lg': {},
        },
        '.res-text-lg': {
          '@apply text-lg md:text-xl': {},
        },
        '.res-text-xl': {
          '@apply text-xl md:text-2xl': {},
        },
        '.res-heading-xs': {
          '@apply text-base sm:text-lg md:text-xl': {},
        },
        '.res-heading-sm': {
          '@apply text-lg sm:text-xl md:text-2xl': {},
        },
        '.res-heading-base': {
          '@apply text-xl sm:text-2xl md:text-3xl': {},
        },
        '.res-heading-lg': {
          '@apply text-2xl sm:text-3xl md:text-4xl': {},
        },
        '.res-heading-xl': {
          '@apply text-3xl sm:text-4xl md:text-5xl': {},
        },
        '.res-heading-2xl': {
          '@apply text-4xl sm:text-5xl md:text-6xl': {},
        },
      };

      addUtilities(newUtilities);
    }),
  ],
};
export default config;
