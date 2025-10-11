/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "z-[9999]", // ダイアログ・モーダル用 z-index 保護
  ],
  theme: {
  	extend: {
  		keyframes: {
  			glow: {
  				'0%, 100%': {
  					boxShadow: '0 0 8px rgba(255, 223, 0, 0.6)'
  				},
  				'50%': {
  					boxShadow: '0 0 25px rgba(255, 223, 0, 1)'
  				}
  			},
  			glowA: {
  				'0%, 100%': {
  					boxShadow: '0 0 6px rgba(255, 128, 0, 0.4)'
  				},
  				'50%': {
  					boxShadow: '0 0 15px rgba(255, 64, 0, 0.6)'
  				}
  			},
  			glowB: {
  				'0%, 100%': {
  					boxShadow: '0 0 4px rgba(144, 238, 144, 0.2)'
  				},
  				'50%': {
  					boxShadow: '0 0 8px rgba(144, 238, 144, 0.3)'
  				}
  			},
  			fadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(8px) scale(0.98)'
  				},
  				'10%': {
  					opacity: '1',
  					transform: 'translateY(0) scale(1)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'translateY(-16px) scale(1.02)'
  				}
  			}
  		},
  		animation: {
  			glow: 'glow 1.5s ease-in-out infinite',
  			glowA: 'glowA 1.5s ease-in-out infinite',
  			glowB: 'glowB 1.5s ease-in-out infinite',
  			fadeUp: 'fadeUp 0.8s ease-out both'
  		},
  		boxShadow: {
  			glow: '0 0 8px rgba(255, 223, 0, 0.6), 0 0 25px rgba(255, 223, 0, 1)',
  			glowA: '0 0 6px rgba(255, 128, 0, 0.4), 0 0 15px rgba(255, 64, 0, 0.6)',
  			glowB: '0 0 4px rgba(144, 238, 144, 0.2), 0 0 8px rgba(144, 238, 144, 0.3)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
