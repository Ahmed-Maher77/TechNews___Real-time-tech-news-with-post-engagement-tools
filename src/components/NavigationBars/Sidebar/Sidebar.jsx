import { Component } from "react";
import navLinks from "./navLinks";
import "./Sidebar.css";
import Logo from "../subComponents/Logo";
import ListItem from "../subComponents/ListItem";
import BottomRoutes from "../subComponents/BottomRoutes";

class Sidebar extends Component {
    state = {
        isAdmin: false,
        userData: {
            username: "Ahmed Maher",
            userPic: null,
        },
    };

    render() {
        const sidebarClasses = `Sidebar d-flex flex-column p-3 gray-bg${
            this.props.isMobile ? " is-mobile" : " min-h-100 max-h-100"
        }${this.props.isCollapsed ? " is-collapsed" : ""}`;

        return (
            <aside className={sidebarClasses}>
                {!this.props.isMobile && (
                    <div className="sidebar-header d-flex align-items-center justify-content-between">
                        <Logo />
                        <button
                            type="button"
                            className="sidebar-toggle-btn border-0 bg-transparent"
                            onClick={this.props.onToggleCollapse}
                            aria-label={this.props.isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <i
                                className={`fa-solid ${
                                    this.props.isCollapsed ? "fa-angles-right" : "fa-angles-left"
                                }`}
                            ></i>
                        </button>
                    </div>
                )}

                {/* ======== Links ======== */}
                <ul className="list-unstyled d-flex flex-column gap-2 mt-4 mb-0 flex-grow-1 justify-content-between">
                    {/* ======== Top Routes ======== */}
                    <div className="top d-flex flex-column gap-2">
                        {(this.state.isAdmin
                            ? navLinks[0].adminRoutes
                            : navLinks[0].userRoutes
                        ).map((route, index) => (
                            <ListItem
                                key={index}
                                href={route.target}
                                icon={route.icon}
                                label={route.name}
                                isCollapsed={this.props.isCollapsed}
                            />
                        ))}
                    </div>

                    {/* ======== Bottom Routes ======== */}
                    {!this.state.isAdmin && (
                        <BottomRoutes {...this.state.userData} isCollapsed={this.props.isCollapsed} />
                    )}
                </ul>
            </aside>
        );
    }
}

export default Sidebar;
