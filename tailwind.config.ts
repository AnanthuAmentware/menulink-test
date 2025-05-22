
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: 'var(--heading-font, "Playfair Display"), serif',
				sans: 'var(--body-font, "Lato"), sans-serif',
				'playfair': ['Playfair Display', 'serif'],
				'lato': ['Lato', 'sans-serif'],
				'montserrat': ['Montserrat', 'sans-serif'],
				'merriweather': ['Merriweather', 'serif'],
				'roboto': ['Roboto', 'sans-serif'],
				'roboto-slab': ['Roboto Slab', 'serif'],
				'open-sans': ['Open Sans', 'sans-serif'],
				'source-sans': ['Source Sans Pro', 'sans-serif'],
				'nunito': ['Nunito', 'sans-serif'],
				'oswald': ['Oswald', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				restaurant: {
					burgundy: 'var(--restaurant-burgundy, #8B2635)',
					cream: 'var(--restaurant-cream, #F5F5DC)',
					gold: 'var(--restaurant-gold, #D4AF37)',
					dark: 'var(--restaurant-dark, #2D2D2D)',
					light: 'var(--restaurant-light, #FFFFFF)',
				},
				theme: {
					primary: 'var(--restaurant-burgundy, #8B2635)',
					secondary: 'var(--restaurant-cream, #F5F5DC)',
					accent: 'var(--restaurant-gold, #D4AF37)',
					background: 'var(--restaurant-light, #FFFFFF)',
					text: 'var(--restaurant-dark, #2D2D2D)',
				},
				glass: {
					'light': 'rgba(255, 255, 255, 0.2)',
					'medium': 'rgba(255, 255, 255, 0.4)',
					'dark': 'rgba(0, 0, 0, 0.2)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				theme: 'var(--border-radius, 0.5rem)'
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px',
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'glass-inset': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
			},
			backgroundImage: {
				'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
