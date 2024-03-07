/** @type {import('tailwindcss').Config} */

export default {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			boxShadow: {
				'2px': '0 0 0 2px rgba(0, 0, 0)',
			}
		},
	},
	plugins: [],
	darkMode: "class",
};