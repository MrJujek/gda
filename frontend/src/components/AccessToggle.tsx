import { useState } from "react";

function AccessToggle({ setBetterAccess }: { setBetterAccess: (betterAccess: boolean) => void }) {
	const [isChecked, setIsChecked] = useState(false);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
		setBetterAccess(!isChecked);
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
							<span className="text-white text-xl">A</span>
						) : (
							<span className="text-white text-sm">a</span>
						)}
					</span>
				</div>
			</label>
		</div>
	);
}

export default AccessToggle;
