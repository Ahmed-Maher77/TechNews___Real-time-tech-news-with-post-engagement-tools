import React from "react";

function stringToColor(str) {
	// Simple hash to color
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const color = `hsl(${hash % 360}, 70%, 60%)`;
	return color;
}

function generateProfileImage_Placeholder(username) {
	if (!username || typeof username !== "string" || username.length === 0) return null;
	const firstChar = username[0].toUpperCase();
	const bgColor = stringToColor(username);
	return React.createElement(
		"div",
		{
			style: {
				backgroundColor: bgColor,
				color: "#fff",
				width: 35,
				height: 35,
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontWeight: 500,
				fontSize: 18,
				userSelect: "none",
			},
		},
		firstChar
	);
}

export default generateProfileImage_Placeholder;