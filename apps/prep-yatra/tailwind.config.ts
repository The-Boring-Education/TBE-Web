import type { Config } from "tailwindcss"

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}"
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px"
            }
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#FFCF25",
                    foreground: "#111827"
                },
                secondary: {
                    DEFAULT: "#111827",
                    foreground: "#FFFFFF"
                },
                accent: {
                    DEFAULT: "#FFCF25",
                    foreground: "#111827"
                },
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
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
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
