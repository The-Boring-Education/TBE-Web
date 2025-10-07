import type { Config } from "tailwindcss"
const { fontFamily } = require('tailwindcss/defaultTheme');

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "../../packages/components/src/**/*.{js,ts,jsx,tsx}"
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                sm: '480px',
                md: '768px',
                lg: '976px',
                xl: '1280px',
                "2xl": "1280px"
            }
        },
        extend: {
            fontFamily: {
                primary: ['Inter', ...fontFamily.sans],
            },
            fontSize: {
                'header-1': '4rem',
                'header-2': '2.75rem',
                'header-3': '2rem',
                'header-4': '1.5rem',
                'header-5': '1.25rem',
                subtitle: '1.25rem',
                paragraph: '1rem',
                'strong-text': '1rem',
                'pre-title': '0.875rem',
                'button-text': '0.875rem',
                label: '0.875rem',
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#FF5757",
                    foreground: "#FFFFFF"
                },
                secondary: {
                    DEFAULT: "#E0B034",
                    foreground: "#FFFFFF"
                },
                dark: '#040505',
                success: '#31ad6b',
                contentLight: '#19191B',
                contentDark: '#FDFDFD',
                grey: '#B0B0B0',
                greyLight: '#e3e3e3',
                greyDark: '#848484',
                accent: {
                    DEFAULT: "#ECF1F4",
                    foreground: "#19191B"
                },
                lightBG: '#F8F8F8',
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))"
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))"
                }
            },
            spacing: {
                1: '8px',
                2: '16px',
                3: '24px',
                4: '32px',
                5: '40px',
                6: '48px',
                7: '56px',
                8: '64px',
            },
            padding: {
                1: '10px',
                2: '16px',
                4: '32px',
                6: '48px',
                8: '64px',
                10: '80px',
                12: '96px',
                14: '112px',
                16: '128px',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                1: '5px',
                2: '10px',
            },
            borderColor: {
                borderColor1: '#F6FFBE',
                borderColor2: '#2555FF',
                borderColor3: '#FFE259',
                borderColor4: '#FF76E1',
                borderColor5: '#923CFF',
                borderColor6: '#F0F3FF',
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0"
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)"
                    }
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)"
                    },
                    to: {
                        height: "0"
                    }
                },
                "fade-in": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(20px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)"
                    }
                },
                "slide-in-left": {
                    "0%": {
                        opacity: "0",
                        transform: "translateX(-50px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateX(0)"
                    }
                },
                "slide-in-right": {
                    "0%": {
                        opacity: "0",
                        transform: "translateX(50px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateX(0)"
                    }
                },
                "scale-in": {
                    "0%": {
                        opacity: "0",
                        transform: "scale(0.9)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "scale(1)"
                    }
                },
                float: {
                    "0%, 100%": {
                        transform: "translateY(0px)"
                    },
                    "50%": {
                        transform: "translateY(-10px)"
                    }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.6s ease-out",
                "slide-in-left": "slide-in-left 0.6s ease-out",
                "slide-in-right": "slide-in-right 0.6s ease-out",
                "scale-in": "scale-in 0.5s ease-out",
                float: "float 3s ease-in-out infinite"
            },
            backdropBlur: {
                xs: "2px"
            }
        }
    },
    plugins: [require("tailwindcss-animate")]
} satisfies Config
