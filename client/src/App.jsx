import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppLayout from "./components/layout/AppLayout";
import LazyPage from "./components/routing/LazyPage";
import NotFoundPage from "./components/routing/NotFoundPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import RouteLoader from "./components/routing/RouteLoader";
import {
    ADMIN_ROUTES,
    LoginPage,
    PostDetailsPage,
    USER_ROUTES,
} from "./routes/routeConfig.js";
import api from "./utils/api";
import {
    selectAuth,
    selectAuthBootstrapped,
    selectIsLoggedIn,
    selectRole,
    setAuth,
    setBootstrapped,
} from "./store/authSlice";
import { selectTheme, themeStorageKey } from "./store/uiSlice";

function App() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
    const dispatch = useDispatch();
    const auth = useSelector(selectAuth);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const role = useSelector(selectRole);
    const bootstrapped = useSelector(selectAuthBootstrapped);
    const theme = useSelector(selectTheme);
    const { i18n } = useTranslation();
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
        let cancelled = false;
        (async () => {
            try {
                const { data: sessionData } = await api.get("/auth/session");
                if (cancelled) return;

                if (!sessionData?.authenticated) {
                    dispatch(setAuth(null));
                    dispatch(setBootstrapped(true));
                    return;
                }

                dispatch(
                    setAuth({
                        id: sessionData.user?.id || "",
                        role: sessionData.user?.role || "user",
                    }),
                );
                dispatch(setBootstrapped(true));

                try {
                    const { data } = await api.get("/auth/me");
                    if (!cancelled && data?.user) {
                        dispatch(setAuth(data.user));
                    }
                } catch {
                    // Keep token-based session state if profile fetch fails.
                }
            } catch {
                if (!cancelled) {
                    dispatch(setAuth(null));
                    dispatch(setBootstrapped(true));
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    useEffect(() => {
        if (!isLoggedIn || auth?.name) return;

        let cancelled = false;
        const retryDelayMs = 5000;
        let retryTimer;

        const loadProfile = async () => {
            try {
                const { data } = await api.get("/auth/me");
                if (!cancelled && data?.user) {
                    dispatch(setAuth(data.user));
                    return;
                }
            } catch {
                // Retry while token-authenticated but profile is unavailable.
            }
            if (!cancelled) {
                retryTimer = window.setTimeout(loadProfile, retryDelayMs);
            }
        };

        loadProfile();
        return () => {
            cancelled = true;
            if (retryTimer) window.clearTimeout(retryTimer);
        };
    }, [auth?.name, dispatch, isLoggedIn]);

    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        window.localStorage.setItem(themeStorageKey, theme);
    }, [theme]);

    useEffect(() => {
        const isArabic = i18n.language === "ar";
        document.documentElement.lang = isArabic ? "ar" : "en";
        document.documentElement.dir = isArabic ? "rtl" : "ltr";
    }, [i18n.language]);

    if (!bootstrapped) {
        return <RouteLoader />;
    }

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

                <Route
                    path="/posts/:postId"
                    element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <LazyPage Component={PostDetailsPage} />
                        </ProtectedRoute>
                    }
                />

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
