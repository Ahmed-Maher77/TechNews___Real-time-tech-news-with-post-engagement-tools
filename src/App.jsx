import { useCallback, useEffect, useMemo, useState } from "react";
import Home from "./pages/Home/Home";
import CreatePost from "./pages/CreatePost/CreatePost";
import Sidebar from "./components/NavigationBars/Sidebar/Sidebar";
import Navbar from "./components/NavigationBars/Navbar/Navbar";
import Posts from "./pages/Posts/Posts";
import Explore from "./pages/Explore/Explore";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isLoggedIn] = useState(false);

    const handleResize = useCallback(() => {
        const nextIsSmallScreen = window.innerWidth < 992;
        setIsSmallScreen((prevIsSmallScreen) =>
            prevIsSmallScreen === nextIsSmallScreen ? prevIsSmallScreen : nextIsSmallScreen
        );
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setIsSidebarCollapsed((prev) => !prev);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    const pagesClasses = useMemo(
        () =>
            `pages w-100 pb-4 ${isSmallScreen ? "pt-8" : "pt-4"}${
                !isSmallScreen && isSidebarCollapsed ? " sidebar-collapsed" : ""
            }`,
        [isSmallScreen, isSidebarCollapsed]
    );

    return (
        <div className="App min-vh-100 d-flex">
            {isSmallScreen ? (
                <Navbar isLoggedIn={isLoggedIn} />
            ) : (
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isLoggedIn={isLoggedIn}
                    onToggleCollapse={handleToggleSidebar}
                />
            )}
            <div className={pagesClasses}>
                <Home />
                <CreatePost />
                <Posts />
                <Explore />
                <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={2500} />
        </div>
    );
}

export default App;
