import { useEffect, useState, createContext } from "react";

export const ThemeContext = createContext<{
	isDarkTheme: boolean;
	toggleTheme: () => void;
}>({
	isDarkTheme: false,
	toggleTheme: () => {},
});

const ThemeProvider = (props: { children: any }) => {
	const [isDarkTheme, setIsDarkTheme] = useState(false);

	useEffect(() => {
		(async () => {
			const theme = await localStorage.getItem("isDarkTheme");
			if (theme) {
				setIsDarkTheme(theme === "true");
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			await localStorage.removeItem("isDarkTheme");
			await localStorage.setItem("isDarkTheme", isDarkTheme.toString());
		})();
	}, [isDarkTheme]);

	const toggleTheme = () => {
		setIsDarkTheme(!isDarkTheme);
	};

	return (
		<ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
			<div className={`${isDarkTheme ? "dark" : ""} h-full`}>{props.children}</div>
		</ThemeContext.Provider>
	);
};
export default ThemeProvider;
