import { Component } from "react";
import Home from "./pages/Home/Home";
import CreatePost from "./pages/CreatePost/CreatePost";
import Sidebar from "./components/NavigationBars/Sidebar/Sidebar";
import Navbar from "./components/NavigationBars/Navbar/Navbar";
import Posts from "./pages/Posts/Posts";
import Explore from "./pages/Explore/Explore";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
    state = {
        isSmallScreen: window.innerWidth < 992,
        isSidebarCollapsed: false,
        isLoggedIn: false,
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
        const { isSmallScreen, isSidebarCollapsed, isLoggedIn } = this.state;
        const pagesClasses = `pages w-100 pb-4 ${isSmallScreen ? "pt-8" : "pt-4"}${
            !isSmallScreen && isSidebarCollapsed ? " sidebar-collapsed" : ""
        }`;

        return (
            <div className="App min-vh-100 d-flex">
                {isSmallScreen ? (
                    <Navbar isLoggedIn={isLoggedIn} />
                ) : (
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        isLoggedIn={isLoggedIn}
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
                    <Footer />
                </div>
                <ToastContainer position="top-right" autoClose={2500} />
            </div>
        );
    }
}

export default App;
