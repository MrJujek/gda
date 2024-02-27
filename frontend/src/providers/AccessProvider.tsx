import { useEffect, useState, createContext } from "react";

export const AccessContext = createContext<{
	betterAccess: boolean;
	toggleAccess: () => void;
}>({
	betterAccess: false,
	toggleAccess: () => {},
});

const AccessProvider = (props: { children: any }) => {
	const [betterAccess, setBetterAccess] = useState(false);

	useEffect(() => {
		(async () => {
			const theme = await localStorage.getItem("isBetterAccess");
			if (theme) {
				setBetterAccess(theme === "true");
			}
		})();
	}, []);


	useEffect(() => {
		(async () => {
			await localStorage.removeItem("isBetterAccess");
			await localStorage.setItem("isBetterAccess", betterAccess.toString());
		})();
	}, [betterAccess]);


	const toggleAccess = () => {
		setBetterAccess(!betterAccess);
	};

	return (
		<ThemeContext.Provider value={{ betterAccess, toggleAccess }}>
			{props.children}
		</ThemeContext.Provider>
  );
};
export default AccessProvider;