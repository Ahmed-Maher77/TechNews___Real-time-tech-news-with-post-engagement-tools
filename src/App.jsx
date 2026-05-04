import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LazyPage from "./components/routing/LazyPage";
import NotFoundPage from "./components/routing/NotFoundPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import {
    ADMIN_ROUTES,
    LoginPage,
    USER_ROUTES,
} from "./routes/routeConfig.js";

function App() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [role] = useState("user");
    const isLoggedIn = Boolean(role);
    const homePath = role === "admin" ? "/admin/dashboard" : "/home";

    const handleResize = useCallback(() => {
        const nextIsSmallScreen = window.innerWidth < 992;
        setIsSmallScreen((prevIsSmallScreen) =>
            prevIsSmallScreen === nextIsSmallScreen
                ? prevIsSmallScreen
                : nextIsSmallScreen
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

    return (
        <Routes>
            <Route path="/login" element={<LazyPage Component={LoginPage} />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <AppLayout
                            isSmallScreen={isSmallScreen}
                            isSidebarCollapsed={isSidebarCollapsed}
                            isLoggedIn={isLoggedIn}
                            role={role}
                            onToggleSidebar={handleToggleSidebar}
                        />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to={homePath} replace />} />

                {USER_ROUTES.map(({ path, Component }) => (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <ProtectedRoute
                                isLoggedIn={isLoggedIn}
                                role={role}
                                allowedRole="user"
                                redirectTo={homePath}
                            >
                                <Component />
                            </ProtectedRoute>
                        }
                    />
                ))}

                {ADMIN_ROUTES.map(({ path, Component }) => (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <ProtectedRoute
                                isLoggedIn={isLoggedIn}
                                role={role}
                                allowedRole="admin"
                                redirectTo={homePath}
                            >
                                <Component />
                            </ProtectedRoute>
                        }
                    />
                ))}

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
