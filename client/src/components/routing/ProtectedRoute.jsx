import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { clearAuth } from "../../store/authSlice";
import api from "../../utils/api";
import RouteLoader from "./RouteLoader";

function ProtectedRoute({
    isLoggedIn,
    role,
    allowedRole,
    redirectTo = "/login",
    children,
}) {
    const dispatch = useDispatch();
    const [isCheckingSession, setIsCheckingSession] = useState(isLoggedIn);
    const [hasValidSession, setHasValidSession] = useState(isLoggedIn);

    useEffect(() => {
        let cancelled = false;

        if (!isLoggedIn) {
            setIsCheckingSession(false);
            setHasValidSession(false);
            return () => {
                cancelled = true;
            };
        }

        setIsCheckingSession(true);
        setHasValidSession(true);

        (async () => {
            try {
                console.info("[protected-route] validating /auth/session");
                const { data } = await api.get("/auth/session");
                if (cancelled) return;
                const authenticated = Boolean(data?.authenticated);
                console.info("[protected-route] /auth/session result", {
                    authenticated,
                    allowedRole,
                    role,
                });
                setHasValidSession(authenticated);
                if (!authenticated) {
                    console.warn("[protected-route] invalid session, clearing auth");
                    dispatch(clearAuth());
                }
            } catch {
                if (cancelled) return;
                console.error("[protected-route] /auth/session request failed");
                // If session check request itself fails (temporary backend/network issue),
                // keep current auth state to avoid forcing a logout while token still exists.
                setHasValidSession(true);
            } finally {
                if (!cancelled) {
                    setIsCheckingSession(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dispatch, isLoggedIn]);

    if (!isLoggedIn) return <Navigate to={redirectTo} replace />;
    if (isCheckingSession) return <RouteLoader />;
    if (!hasValidSession) return <Navigate to={redirectTo} replace />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
    return children;
}

export default ProtectedRoute;
