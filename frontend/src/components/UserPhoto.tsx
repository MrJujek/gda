import { useState, useEffect } from "react";

function UserPhoto({ userID }: { userID: number }) {
	const [photo, setPhoto] = useState<string>("/user.png");

	useEffect(() => {
		(async () => {
			const response = await fetch(`/api/users/photo?user-id=${userID}`);
			console.log("response", response);

			if (response.ok) {
				setPhoto(`/api/users/photo?user-id=${userID}`);
			}
		})();
	}, []);

	return (
		<div>
			<img src={photo} alt="photo" className="h-10 w-10 mr-2 rounded"/>
		</div>
	);
}

export default UserPhoto;