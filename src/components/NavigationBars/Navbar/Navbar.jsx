import { Component } from "react";
import Logo from "../subComponents/Logo";
import Sidebar from "../Sidebar/Sidebar";
import "./Navbar.css";

class Navbar extends Component {
    state = {
        isSidebarOpen: false,
    };

    render() {
        const handleToggleSidebar = () => {
            this.setState((prev) => ({
                ...prev,
                isSidebarOpen: !prev.isSidebarOpen,
            }));
        };
        const handleCloseSidebar = () => {
            this.setState({ isSidebarOpen: false });
        };

        return (
            <nav className="Navbar d-flex align-items-center justify-content-between p-3 gray-bg">
                {/* ======== Logo ======== */}
                <Logo />

                {/* ======== Toggler ======== */}
                <button
                    type="button"
                    className="menu-toggler border-0 bg-transparent fs-4"
                    onClick={handleToggleSidebar}
                    aria-label="Toggle sidebar menu"
                >
                    <i className="fa-solid fa-bars fs-5"></i>
                </button>

                <div
                    className={
                        "mobile-overlay " +
                        (this.state.isSidebarOpen ? "open" : "")
                    }
                    onClick={handleCloseSidebar}
                    aria-hidden={!this.state.isSidebarOpen}
                />

                <div
                    className={
                        "mobile-menu " +
                        (this.state.isSidebarOpen ? "open" : "")
                    }
                >
                    <Sidebar isMobile />
                </div>
            </nav>
        );
    }
}

export default Navbar;
