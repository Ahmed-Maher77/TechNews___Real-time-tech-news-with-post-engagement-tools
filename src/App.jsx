import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LazyPage from "./components/routing/LazyPage";
import NotFoundPage from "./components/routing/NotFoundPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { getAuthChangedEventName, getStoredAuth } from "./utils/authStorage";
import { ADMIN_ROUTES, LoginPage, USER_ROUTES } from "./routes/routeConfig.js";
import { selectIsLoggedIn, selectRole, setAuth } from "./store/authSlice";

function App() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const role = useSelector(selectRole);
    const homePath = role === "admin" ? "/admin/dashboard" : "/home";

    const handleResize = useCallback(() => {
        const nextIsSmallScreen = window.innerWidth < 992;
        setIsSmallScreen((prevIsSmallScreen) =>
            prevIsSmallScreen === nextIsSmallScreen
                ? prevIsSmallScreen
                : nextIsSmallScreen,
        );
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    useEffect(() => {
        const authChangedEventName = getAuthChangedEventName();
        const syncAuthFromStorage = () => {
            dispatch(setAuth(getStoredAuth()));
        };

        window.addEventListener("storage", syncAuthFromStorage);
        window.addEventListener("focus", syncAuthFromStorage);
        window.addEventListener(authChangedEventName, syncAuthFromStorage);

        return () => {
            window.removeEventListener("storage", syncAuthFromStorage);
            window.removeEventListener("focus", syncAuthFromStorage);
            window.removeEventListener(authChangedEventName, syncAuthFromStorage);
        };
    }, [dispatch]);

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isLoggedIn ? (
                        <Navigate to={homePath} replace />
                    ) : (
                        <LazyPage Component={LoginPage} />
                    )
                }
            />
            <Route
                path="/register"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <AppLayout isSmallScreen={isSmallScreen} />
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
                                <LazyPage Component={Component} />
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
                                <LazyPage Component={Component} />
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
