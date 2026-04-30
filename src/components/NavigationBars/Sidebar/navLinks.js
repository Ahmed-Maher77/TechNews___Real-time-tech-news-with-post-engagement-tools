const navLinks = [
    {
        adminRoutes: [
            {
                name: "Overview",
                target: "/",
                icon: "fa-regular fa-house",
                top: true,
            },
        ],
        userRoutes: [
            { name: "Home Feed", target: "/", icon: "fa-regular fa-house" },
            {
                name: "Explore",
                target: "/explore",
                icon: "fa-regular fa-compass",
            },
            {
                name: "My Posts",
                target: "/my-posts",
                icon: "fa-regular fa-file-lines",
            },
            {
                name: "Create Post",
                target: "/create-post",
                icon: "fa-solid fa-plus",
            },
        ],
    },
];

export default navLinks;