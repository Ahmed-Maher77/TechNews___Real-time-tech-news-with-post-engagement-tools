import { Component } from "react";
import Home from "./pages/Home/Home";
import CreatePost from "./pages/CreatePost/CreatePost";
import Sidebar from "./components/NavigationBars/Sidebar/Sidebar";
import Navbar from "./components/NavigationBars/Navbar/Navbar";
import Posts from "./pages/Posts/Posts";
import Explore from "./pages/Explore/Explore";

class App extends Component {
    state = {
        isSmallScreen: window.innerWidth < 992,
        isSidebarCollapsed: false,
    };

    handleResize = () => {
        const isSmallScreen = window.innerWidth < 992;
        if (isSmallScreen !== this.state.isSmallScreen) {
            this.setState({ isSmallScreen });
        }
    };

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    render() {
        const { isSmallScreen, isSidebarCollapsed } = this.state;
        const pagesClasses = `pages w-100 pb-4 ${isSmallScreen ? "pt-8" : "pt-4"}${
            !isSmallScreen && isSidebarCollapsed ? " sidebar-collapsed" : ""
        }`;

        return (
            <div className="App min-vh-100 d-flex">
                {isSmallScreen ? (
                    <Navbar />
                ) : (
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() =>
                            this.setState((prev) => ({
                                isSidebarCollapsed: !prev.isSidebarCollapsed,
                            }))
                        }
                    />
                )}
                <div className={pagesClasses}>
                    <Home />
                    <CreatePost />
                    <Posts />
                    <Explore />
                </div>
            </div>
        );
    }
}

export default App;
