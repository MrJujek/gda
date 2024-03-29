import { useState, useContext } from "react";
import { AccessContext } from "../providers/AccessProvider";

function AccessToggle() {
	const [isChecked, setIsChecked] = useState(false);

	const { toggleAccess } = useContext(AccessContext);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
		toggleAccess();
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
						className={`flex h-9 w-9 items-center justify-center rounded-full duration-100 transition shadow-2px shadow-white dark:shadow-gray-800`}
					>
						{isChecked ? (
							<span className="text-white text-xl dark:text-gray-800 select-none">A</span>
						) : (
							<span className="text-white text-xl dark:text-gray-800 select-none">a</span>
						)}
					</span>
				</div>
			</label>
		</div>
	);
}

export default AccessToggle;