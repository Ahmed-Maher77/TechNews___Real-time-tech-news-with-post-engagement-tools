import React from "react";

function stringToColor(str) {
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
    return (
        <div
            style={{
                backgroundColor: bgColor,
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 20,
                userSelect: "none",
            }}
        >
            {firstChar}
        </div>
    );
}

export default generateProfileImage_Placeholder;
