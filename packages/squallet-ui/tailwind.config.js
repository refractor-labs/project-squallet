const plugin = require('tailwindcss/plugin');
const { transparentize } = require('polished');

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        '../../packages/squallet-ui/pages/**/*.{ts,tsx}',
        '../../packages/squallet-ui/components/**/*.{ts,tsx}',
    ],
    theme: {
        colors: {
            BrandOrange200: '#FFD6BE',
            BrandOrange300: '#FFB57E',
            BrandOrange600: '#995D16',
            BrandRed200: '#FFD4D4',
            BrandRed300: '#FFB8B8',
            BrandRed600: '#A55252',
            BrandViolet200: '#E0DAFF',
            BrandViolet300: '#CDC2FF',
            BrandViolet600: '#6F61A3',
            BrandPink200: '#FFD0F5',
            BrandPink300: '#FFB1EF',
            BrandPink600: '#995577',

            BrandOrange: '#FFB57E',
            BrandOrangeLight: '#FFD6BE',
            BrandOrangeDark: '#995D16',
            BrandRed: '#FFB8B8',
            BrandRedLight: '#FFD4D4',
            BrandRedDark: '#A55252',
            BrandViolet: '#CDC2FF',
            BrandVioletLight: '#E0DAFF',
            BrandVioletDark: '#6F61A3',
            BrandPink: '#FFB1EF',
            BrandPinkLight: '#FFD0F5',
            BrandPinkDark: '#995577',
            lore: '#FFB57E',
            loreMuted: '#666666',
            loreBgMuted: '#202020',
            tweetBorder: '#4d1e02',
            White: '#ffffff',
            Black: '#040303',
            Gray050: '#FBF9F8',
            Gray100: '#F6F3F2',
            Gray200: '#DFDDDB',
            Gray300: '#D0CBC9',
            Gray400: '#AFA8A5',
            Gray500: '#8C8684',
            Gray600: '#6F6A68',
            Gray700: '#4F4C4A',
            Gray800: '#363433',
            Gray900: '#191817',
            Gray950: '#100E0C',
            Red100: '#fdf0ef',
            Red200: '#fad6d3',
            Red300: '#f8bbb5',
            Red400: '#f58d80',
            Red500: '#ea5633',
            Red600: '#bb4227',
            Red700: '#892f19',
            Red800: '#671900',
            Red900: '#350900',
            Orange100: '#fdf0eb',
            Orange200: '#fad7c6',
            Orange300: '#f7be9d',
            Orange400: '#ec964b',
            Orange500: '#c27528',
            Orange600: '#965d2e',
            Orange700: '#6d431f',
            Orange800: '#4d2d13',
            Orange900: '#271406',
            Yellow100: '#f9f3d1',
            Yellow200: '#ece08c',
            Yellow300: '#d9cc6f',
            Yellow400: '#b8ac4b',
            Yellow500: '#93893a',
            Yellow600: '#746c2c',
            Yellow700: '#544e1f',
            Yellow800: '#3a3513',
            Yellow900: '#1b1906',
            Green100: '#ebf5ee',
            Green200: '#c7e6d0',
            Green300: '#97d9ac',
            Green400: '#55bd7e',
            Green500: '#3b985f',
            Green600: '#1d7a45',
            Green700: '#125831',
            Green800: '#0a3e21',
            Green900: '#031e0d',
            Blue100: '#edf3fe',
            Blue200: '#cce0fc',
            Blue300: '#abcdfa',
            Blue400: '#6faef0',
            Blue500: '#318cd5',
            Blue600: '#256fab',
            Blue700: '#184f7a',
            Blue800: '#0e3858',
            Blue900: '#041a2c',
            Indigo100: '#f2f2fc',
            Indigo200: '#dbdcf8',
            Indigo300: '#c5c7f2',
            Indigo400: '#a0a3ee',
            Indigo500: '#787de7',
            Indigo600: '#545bde',
            Indigo700: '#343cb5',
            Indigo800: '#232982',
            Indigo900: '#0e1145',
            DeepPurple100: '#f3f1fd',
            DeepPurple200: '#e0dbf9',
            DeepPurple300: '#ccc5f5',
            DeepPurple400: '#ae9fef',
            DeepPurple500: '#8e75e7',
            DeepPurple600: '#764edd',
            DeepPurple700: '#582eb6',
            DeepPurple800: '#3e1e84',
            DeepPurple900: '#1d0b45',
            Purple100: '#f7f0ff',
            Purple200: '#e9d8f9',
            Purple300: '#ddbef5',
            Purple400: '#c994ee',
            Purple500: '#b861e6',
            Purple600: '#9d3bcc',
            Purple700: '#722996',
            Purple800: '#511b6c',
            Purple900: '#290a38',
            Pink100: '#fcf0f5',
            Pink200: '#f6d6e3',
            Pink300: '#f0bcd3',
            Pink400: '#e88eb8',
            Pink500: '#e1519e',
            Pink600: '#b33e7e',
            Pink700: '#842b5a',
            Pink800: '#5e1c40',
            Pink900: '#300a1e',
        },
        extend: {
            typography: ({ theme }) => ({
                pink: {
                    css: {
                        '--tw-prose-body': 'var(--text-default) !important',
                        '--tw-prose-headings': theme('colors.Pink900'),
                        '--tw-prose-lead': theme('colors.pink[700]'),
                        '--tw-prose-links': theme('colors.pink[900]'),
                        '--tw-prose-bold': theme('colors.pink[900]'),
                        '--tw-prose-counters': theme('colors.pink[600]'),
                        '--tw-prose-bullets': theme('colors.pink[400]'),
                        '--tw-prose-hr': theme('colors.pink[300]'),
                        '--tw-prose-quotes': theme('colors.pink[900]'),
                        '--tw-prose-quote-borders': theme('colors.pink[300]'),
                        '--tw-prose-captions': theme('colors.pink[700]'),
                        '--tw-prose-code': theme('colors.pink[900]'),
                        '--tw-prose-pre-code': theme('colors.pink[100]'),
                        '--tw-prose-pre-bg': theme('colors.pink[900]'),
                        '--tw-prose-th-borders': theme('colors.pink[300]'),
                        '--tw-prose-td-borders': theme('colors.pink[200]'),
                        '--tw-prose-invert-body': theme('colors.pink[200]'),
                        '--tw-prose-invert-headings': theme('colors.white'),
                        '--tw-prose-invert-lead': theme('colors.pink[300]'),
                        '--tw-prose-invert-links': theme('colors.white'),
                        '--tw-prose-invert-bold': theme('colors.white'),
                        '--tw-prose-invert-counters': theme('colors.pink[400]'),
                        '--tw-prose-invert-bullets': theme('colors.pink[600]'),
                        '--tw-prose-invert-hr': theme('colors.pink[700]'),
                        '--tw-prose-invert-quotes': theme('colors.pink[100]'),
                        '--tw-prose-invert-quote-borders': theme('colors.pink[700]'),
                        '--tw-prose-invert-captions': theme('colors.pink[400]'),
                        '--tw-prose-invert-code': theme('colors.white'),
                        '--tw-prose-invert-pre-code': theme('colors.pink[300]'),
                        '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
                        '--tw-prose-invert-th-borders': theme('colors.pink[600]'),
                        '--tw-prose-invert-td-borders': theme('colors.pink[700]'),
                    },
                },
            }),
            scale: {
                '-1': '-1',
            },
            spacing: {
                sp1: '0.0625rem', // 1px
                sp2: '0.1250rem', // 2px
                sp3: '0.1875rem', // 3px
                sp4: '0.25rem', // 4px
                sp8: '0.5rem', // 8px
                sp12: '0.75rem', // 12px
                sp16: '1rem', // 16px
                sp20: '1.25rem', // 20px
                sp24: '1.5rem', // 24px
                sp32: '2rem', // 32px
                sp40: '2.5rem', // 40px
                sp48: '3rem', // 48px
                sp56: '3.5rem', // 56px
                sp64: '4rem', // 64px
                sp72: '4.5rem', // 72px
                sp80: '5rem', // 80px
                sp88: '5.5rem', // 88px
                sp96: '6rem', // 96px
                sp104: '6.5rem', // 104px
                sp112: '7rem', // 112px
                sp120: '7.5rem', // 120px
                sp128: '8rem', // 128px
            },
            fontFamily: {
                display: ['var(--font-ginto-nord)', 'system-ui', 'sans-serif'],
                default: ['var(--font-abc-favorit)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-abc-favorit-mono)', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'body-xs': '0.75rem',
                'body-sm': '0.875rem',
                'body-md': '1rem',
                'body-lg': '1.125rem',
                'body-xl': '1.25rem',
                'header-sm-caps': '0.75rem',
                'header-xs': '1.25rem',
                'header-sm': '1.375rem',
                'header-md': '1.5625rem',
                'header-lg': '1.75rem',
                'header-xl': '2rem',
                displayXs: [
                    '2rem',
                    {
                        lineHeight: '1',
                        letterSpacing: '-0.06rem',
                        textTransform: 'uppercase',
                    },
                ],
                displaySm: [
                    '2.5rem',
                    {
                        lineHeight: '1',
                        letterSpacing: '-0.075rem',
                        textTransform: 'uppercase',
                    },
                ],
                displayMd: [
                    '3.25rem',
                    {
                        lineHeight: '1',
                        letterSpacing: '-0.12375rem',
                        textTransform: 'uppercase',
                    },
                ],
                displayLg: [
                    '4.125rem',
                    {
                        lineHeight: '1',
                        letterSpacing: '-0.15375rem',
                        textTransform: 'uppercase',
                    },
                ],
                displayXl: [
                    '5.125rem',
                    {
                        lineHeight: '1',
                        letterSpacing: '-0.15375rem',
                        textTransform: 'uppercase',
                    },
                ],
            },
            fontWeight: {
                regular: '400',
                bold: '500',
                black: '700',
            },
            lineHeight: {
                body: '1.5',
                header: '1.25',
            },
            height: {
                sm: '0.0625rem', // 1px
                md: '0.125rem', // 2px
                lg: '0.1875rem', // 3px
                xl: '0.25rem', // 4px "sm":
            },
            width: {
                sm: '0.0625rem', // 1px
                md: '0.125rem', // 2px
                lg: '0.1875rem', // 3px
                xl: '0.25rem', // 4px "sm":
            },
            borderRadius: {
                sm: '0.25rem', // 4px
                md: '0.5rem', // 8px
                lg: '1rem', // 16px
                xl: '1.5rem', // 24px
                round: '999rem',
            },
            borderWidth: {
                sm: '0.0625rem', // 1px
                md: '0.125rem', // 2px
                lg: '0.1875rem', // 3px
                xl: '0.25rem', // 4px
            },
            colors: {
                // Background colors
                'background-brand-orange': 'var(--background-brand-orange)',
                'background-brand-orange-focus': 'var(--background-brand-orange-focus)',
                'background-brand-violet': 'var(--background-brand-violet)',
                'background-brand-violet-focus': 'var(--background-brand-violet-focus)',
                'background-brand-pink': 'var(--background-brand-pink)',
                'background-brand-pink-focus': 'var(--background-brand-pink-focus)',
                'background-brand-red': 'var(--background-brand-red)',
                'background-brand-red-focus': 'var(--background-brand-red-focus)',

                'background-default-primary': 'var(--background-default-primary)',
                'background-default-secondary': 'var(--background-default-secondary)',
                'background-default-focus': 'var(--background-default-focus)',
                'background-default-muted': 'var(--background-default-muted)',
                'background-default-inverted-primary': 'var(--background-default-inverted-primary)',
                'background-default-inverted-focus': 'var(--background-default-inverted-focus)',
                'background-default-inverted-muted': 'var(--background-default-inverted-muted)',
                'background-red': 'var(--background-red)',
                'background-red-focus': 'var(--background-red-focus)',
                'background-orange': 'var(--background-orange)',
                'background-orange-focus': 'var(--background-orange-focus)',
                'background-yellow': 'var(--background-yellow)',
                'background-yellow-focus': 'var(--background-yellow-focus)',
                'background-green': 'var(--background-green)',
                'background-green-focus': 'var(--background-green-focus)',
                'background-blue': 'var(--background-blue)',
                'background-blue-focus': 'var(--background-blue-focus)',
                'background-indigo': 'var(--background-indigo)',
                'background-indigo-focus': 'var(--background-indigo-focus)',
                'background-deep-purple': 'var(--background-deep-purple)',
                'background-deep-purple-focus': 'var(--background-deep-purple-focus)',
                'background-purple': 'var(--background-purple)',
                'background-purple-focus': 'var(--background-purple-focus)',
                'background-pink': 'var(--background-pink)',
                'background-pink-focus': 'var(--background-pink-focus)',

                // Text colors
                'brand-orange': 'var(--text-brand-orange)',
                'brand-orange-focus': 'var(--text-brand-orange-focus)',
                'brand-violet': 'var(--text-brand-violet)',
                'brand-violet-focus': 'var(--text-brand-violet-focus)',
                'brand-pink': 'var(--text-brand-pink)',
                'brand-pink-focus': 'var(--text-brand-pink-focus)',
                'brand-red': 'var(--text-brand-red)',
                'brand-red-focus': 'var(--text-brand-red-focus)',

                default: 'var(--text-default)',
                'default-focus': 'var(--text-default-focus)',
                'default-muted': 'var(--text-default-muted)',
                'default-inverted': 'var(--text-default-inverted)',
                red: 'var(--text-red)',
                'red-focus': 'var(--text-red-focus)',
                yellow: 'var(--text-yellow)',
                'yellow-focus': 'var(--text-yellow-focus)',
                orange: 'var(--text-orange)',
                'orange-focus': 'var(--text-orange-focus)',
                green: 'var(--text-green)',
                'green-focus': 'var(--text-green-focus)',
                blue: 'var(--text-blue)',
                'blue-focus': 'var(--text-blue-focus)',
                indigo: 'var(--text-indigo)',
                'indigo-focus': 'var(--text-indigo-focus)',
                'deep-purple': 'var(--text-deep-purple)',
                'deep-purple-focus': 'var(--text-deep-purple-focus)',
                purple: 'var(--text-purple)',
                'purple-focus': 'var(--text-purple-focus)',
                pink: 'var(--text-pink)',
                'pink-focus': 'var(--text-pink-focus)',

                // Checkbox colors
                'checkbox-icon-empty-background': 'var(--checkbox-icon-empty-background)',
                'checkbox-icon-empty-line': 'var(--checkbox-icon-empty-line)',
                'checkbox-icon-empty-line-hover': 'var(--checkbox-icon-empty-line-hover)',
                'checkbox-icon-selected-background': 'var(--checkbox-icon-selected-background)',
                'checkbox-icon-selected-background-hover':
                    'var(--checkbox-icon-selected-background-hover)',
                'checkbox-icon-selected-icon': 'var(--checkbox-icon-selected-icon)',
                'checkbox-icon-selected-line': 'var(--checkbox-icon-selected-line)',
                'checkbox-icon-selected-line-hover': 'var(--checkbox-icon-selected-line-hover)',
                'checkbox-icon-background-disabled': 'var(--checkbox-icon-background-disabled)',
                'checkbox-icon-icon-disabled': 'var(--checkbox-icon-icon-disabled)',
                'checkbox-icon-line-disabled': 'var(--checkbox-icon-line-disabled)',

                // Icon colors
                'icon-brand-orange': 'var(--icon-brand-orange)',
                'icon-brand-orange-focus': 'var(--icon-brand-orange-focus)',
                'icon-brand-violet': 'var(--icon-brand-violet)',
                'icon-brand-violet-focus': 'var(--icon-brand-violet-focus)',
                'icon-brand-pink': 'var(--icon-brand-pink)',
                'icon-brand-pink-focus': 'var(--icon-brand-pink-focus)',
                'icon-brand-red': 'var(--icon-brand-red)',
                'icon-brand-red-focus': 'var(--icon-brand-red-focus)',

                'icon-default': 'var(--icon-default)',
                'icon-default-focus': 'var(--icon-default-focus)',
                'icon-default-muted': 'var(--icon-default-muted)',
                'icon-default-inverted': 'var(--icon-default-inverted)',
                'icon-red': 'var(--icon-red)',
                'icon-red-focus': 'var(--icon-red-focus)',
                'icon-orange': 'var(--icon-orange)',
                'icon-orange-focus': 'var(--icon-orange-focus)',
                'icon-yellow': 'var(--icon-yellow)',
                'icon-yellow-focus': 'var(--icon-yellow-focus)',
                'icon-green': 'var(--icon-green)',
                'icon-green-focus': 'var(--icon-green-focus)',
                'icon-blue': 'var(--icon-blue)',
                'icon-blue-focus': 'var(--icon-blue-focus)',
                'icon-indigo': 'var(--icon-indigo)',
                'icon-indigo-focus': 'var(--icon-indigo-focus)',
                'icon-deep-purple': 'var(--icon-deep-purple)',
                'icon-deep-purple-focus': 'var(--icon-deep-purple-focus)',
                'icon-purple': 'var(--icon-purple)',
                'icon-purple-focus': 'var(--icon-purple-focus)',
                'icon-pink': 'var(--icon-pink)',
                'icon-pink-focus': 'var(--icon-pink-focus)',

                // Line colors
                'line-brand-orange': 'var(--line-brand-orange)',
                'line-brand-orange-focus': 'var(--line-brand-orange-focus)',
                'line-brand-violet': 'var(--line-brand-violet)',
                'line-brand-violet-focus': 'var(--line-brand-violet-focus)',
                'line-brand-pink': 'var(--line-brand-pink)',
                'line-brand-pink-focus': 'var(--line-brand-pink-focus)',
                'line-brand-red': 'var(--line-brand-red)',
                'line-brand-red-focus': 'var(--line-brand-red-focus)',

                'line-default-primary': 'var(--line-default-primary)',
                'line-default-secondary': 'var(--line-default-secondary)',
                'line-default-focus': 'var(--line-default-focus)',
                'line-default-focus-amplified': 'var(--line-default-focus-amplified)',
                'line-default-alert': 'var(--line-default-alert)',
                'line-default-alert-focus': 'var(--line-default-alert-focus)',
                'line-default-inverted': 'var(--line-default-inverted)',
                'line-red': 'var(--line-red)',
                'line-red-focus': 'var(--line-red-focus)',
                'line-orange': 'var(--line-orange)',
                'line-orange-focus': 'var(--line-orange-focus)',
                'line-yellow': 'var(--line-yellow)',
                'line-yellow-focus': 'var(--line-yellow-focus)',
                'line-green': 'var(--line-green)',
                'line-green-focus': 'var(--line-green-focus)',
                'line-blue': 'var(--line-blue)',
                'line-blue-focus': 'var(--line-blue-focus)',
                'line-indigo': 'var(--line-indigo)',
                'line-indigo-focus': 'var(--line-indigo-focus)',
                'line-deep-purple': 'var(--line-deep-purple)',
                'line-deep-purple-focus': 'var(--line-deep-purple-focus)',
                'line-purple': 'var(--line-purple)',
                'line-purple-focus': 'var(--line-purple-focus)',
                'line-pink': 'var(--line-pink)',
                'line-pink-focus': 'var(--line-pink-focus)',

                // Switches
                'switch-track-background-on': 'var(--switch-track-background-on)',
                'switch-track-background-on-disabled': 'var(--switch-track-background-on-disabled)',
                'switch-track-background-off': 'var(--switch-track-background-off)',
                'switch-track-background-off-disabled':
                    'var(--switch-track-background-off-disabled)',
                'switch-track-outline': 'var(--switch-track-outline)',
                'switch-track-focus': 'var(--switch-track-focus)',
                'switch-toggle-background': 'var(--switch-toggle-background)',
                'switch-toggle-background-disabled': 'var(--switch-toggle-background-disabled)',
            },
            zIndex: {
                zDeepdive: '-99999',
                zDefault: '1',
                zDropdown: '7000',
                zOverlay: '8000', // Overlay under modal
                zReminder: '8500', // Notifications
                zModal: '9000',
                zToast: '10000',
            },
            animation: {
                // Tooltip
                'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down-fade': 'slide-down-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                // Tooltip
                'slide-up-fade': {
                    '0%': { opacity: 0, transform: 'translateY(6px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'slide-down-fade': {
                    '0%': { opacity: 0, transform: 'translateY(-6px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class', // only generate classes
        }),
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
        require('tailwindcss-cmdk'),
        plugin(({ addBase, addVariant, addUtilities, e, config, theme }) => {
            const purple900 = theme('colors.Purple900');
            const ShadowPre = transparentize(0.98, purple900);
            const Shadow1 = transparentize(0.92, purple900);
            const Shadow2 = transparentize(0.87, purple900);
            const Shadow3 = transparentize(0.81, purple900);

            addVariant('radix-side-top', '&[data-side="top"]');
            addVariant('radix-side-bottom', '&[data-side="bottom"]');

            addUtilities({
                '.shadow-xs': {
                    boxShadow: `0rem 0.0625rem 0.625rem ${ShadowPre}, 0rem 0.0625rem 0.3125rem ${Shadow1}`,
                },
                '.shadow-sm': {
                    boxShadow: `0rem 0.0625rem 0.625rem ${ShadowPre}, 0rem 0.1875rem 0.3125rem ${Shadow1}`,
                },
                '.shadow-md': {
                    boxShadow: `0rem 0.0625rem 0.625rem ${ShadowPre}, 0rem 0.0625rem 0.3125rem ${Shadow2}`,
                },
                '.shadow-lg': {
                    boxShadow: `0rem 0.0625rem 0.625rem ${ShadowPre}, 0rem 0.5rem 2rem ${Shadow2}`,
                },
                '.shadow-xl': {
                    boxShadow: `0rem 0.0625rem 0.625rem ${ShadowPre}, 0rem 1rem 2.5rem ${Shadow3}`,
                },

                '.xs-regular': {
                    fontWeight: '400',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                },

                '.header-xs': {
                    fontWeight: '500',
                    fontSize: '1.2rem',
                    lineHeight: '1.25',
                },

                '.header-sm': {
                    fontWeight: '500',
                    fontSize: '1.375rem',
                    lineHeight: '1.25',
                },

                '.header-md': {
                    fontWeight: '500',
                    fontSize: '1.5625rem',
                    lineHeight: '1.25',
                },

                '.header-lg': {
                    fontWeight: '500',
                    fontSize: '1.75rem',
                    lineHeight: '1.25',
                },

                '.header-xl': {
                    fontWeight: '500',
                    fontSize: '2rem',
                    lineHeight: '1.25',
                },

                '.display-xs': {
                    fontSize: '2rem',
                    lineHeight: '1',
                    letterSpacing: '-0.06rem',
                    textTransform: 'uppercase',
                },

                '.display-sm': {
                    fontSize: '2.5rem',
                    lineHeight: '1',
                    letterSpacing: '-0.075rem',
                    textTransform: 'uppercase',
                },

                '.display-md': {
                    fontSize: '3.25rem',
                    lineHeight: '1',
                    letterSpacing: '-0.12375rem',
                    textTransform: 'uppercase',
                },

                '.display-lg': {
                    fontSize: '4.125rem',
                    lineHeight: '1',
                    letterSpacing: '-0.15375rem',
                    textTransform: 'uppercase',
                },

                '.display-xl': {
                    fontSize: '5.125rem',
                    lineHeight: '1',
                    letterSpacing: '-0.15375rem',
                    textTransform: 'uppercase',
                },

                '.header-sm-caps': {
                    fontSize: '12px',
                    fonteight: '700',
                    lineHeight: '18px',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                },
            });
        }),
    ],
};
