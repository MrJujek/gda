/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				cyan: colors.cyan,
			},
		},
	},
	plugins: [],
	darkMode: "class",
};
