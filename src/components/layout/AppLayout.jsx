import { Suspense, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "../Footer/Footer";
import Navbar from "../NavigationBars/Navbar/Navbar";
import Sidebar from "../NavigationBars/Sidebar/Sidebar";
import RouteLoader from "../routing/RouteLoader";
import "react-toastify/dist/ReactToastify.css";

function AppLayout({
    isSmallScreen,
    isSidebarCollapsed,
    isLoggedIn,
    role,
    onToggleSidebar,
}) {
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
                <Navbar isLoggedIn={isLoggedIn} role={role} />
            ) : (
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isLoggedIn={isLoggedIn}
                    role={role}
                    onToggleCollapse={onToggleSidebar}
                />
            )}
            <div className={pagesClasses}>
                <Suspense fallback={<RouteLoader />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={2500} />
        </div>
    );
}

export default AppLayout;
