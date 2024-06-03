/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'selector',
	content: [
	"./index.html",
	"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			transitionDuration: {
				DEFAULT: '300ms'
			},
			borderRadius: {
				DEFAULT: '10px'
			},
			padding: {
				'box': '1.2rem 1.5rem',
			},
			colors: {
				firstRankColor: '#FFAA00',
				secondRankColor: '#008FC6',
				thirdRankColor: '#00D95F',
			}
		},
	},
	plugins: [],
}

