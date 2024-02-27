interface StatusIconProps {
	active: boolean;
}

function StatusIcon({ active }: StatusIconProps) {
	return (
		<div>
			{active ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-circle-fill text-green-500"
					viewBox="0 0 16 16"
				>
					<circle cx="8" cy="8" r="8" />
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-circle text-gray-300"
					viewBox="0 0 16 16"
				>
					<circle cx="8" cy="8" r="8" />
				</svg>
			)}
		</div>
	);
}

export default StatusIcon;
