import { useState } from "react";

function ThemeToggle({ setDarkMode }: { setDarkMode: (darkMode: boolean) => void }) {
	const [isChecked, setIsChecked] = useState(false);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
		setDarkMode(!isChecked);
	};

	return (
		<div className="flex justify-center items-center">
			<label className="cursor-pointer">
				<input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className="sr-only" />
				<div
					className="shadow-card flex h-[46px] w-[46px] items-center justify-center rounded-full"
					style={{ backgroundColor: isChecked ? "#7a7a7a" : "#ECBD18" }}
				>
					<span
						className={`flex h-9 w-9 items-center justify-center rounded-full`}
						style={{
							transition: "all 0.3s ease",
							boxShadow: "0 0 0 2px white",
							opacity: "1",
							backgroundColor: isChecked ? "transparent" : "transparent",
						}}
					>
						{isChecked ? (
							// SVG for moon icon with white fill
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="white"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M8.0547 1.67334C8.18372 1.90227 8.16622 2.18562 8.01003 2.39693C7.44055 3.16737 7.16651 4.11662 7.23776 5.07203C7.30901 6.02744 7.72081 6.92554 8.39826 7.60299C9.07571 8.28044 9.97381 8.69224 10.9292 8.76349C11.8846 8.83473 12.8339 8.5607 13.6043 7.99122C13.8156 7.83502 14.099 7.81753 14.3279 7.94655C14.5568 8.07556 14.6886 8.32702 14.6644 8.58868C14.5479 9.84957 14.0747 11.0512 13.3002 12.053C12.5256 13.0547 11.4818 13.8152 10.2909 14.2454C9.09992 14.6756 7.81108 14.7577 6.57516 14.4821C5.33925 14.2065 4.20738 13.5846 3.312 12.6892C2.41661 11.7939 1.79475 10.662 1.51917 9.42608C1.24359 8.19017 1.32569 6.90133 1.75588 5.71038C2.18606 4.51942 2.94652 3.47561 3.94828 2.70109C4.95005 1.92656 6.15168 1.45335 7.41257 1.33682C7.67423 1.31264 7.92568 1.44442 8.0547 1.67334Z"
								></path>
							</svg>
						) : (
							// Updated SVG for sun icon with white fill and rays
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="8" cy="8" r="4" fill="white" />
								<line
									x1="8"
									y1="0"
									x2="8"
									y2="2"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="8"
									y1="14"
									x2="8"
									y2="16"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="0"
									y1="8"
									x2="2"
									y2="8"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="14"
									y1="8"
									x2="16"
									y2="8"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="11.6569"
									y1="11.6569"
									x2="13.4142"
									y2="13.4142"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="2.58579"
									y1="2.58579"
									x2="4.34315"
									y2="4.34315"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="11.6569"
									y1="4.34315"
									x2="13.4142"
									y2="2.58579"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="2.58579"
									y1="13.4142"
									x2="4.34315"
									y2="11.6569"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</span>
				</div>
			</label>
		</div>
	);
}

export default ThemeToggle;
