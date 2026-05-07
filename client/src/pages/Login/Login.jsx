import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ThemeToggleButton from "../../components/common/ThemeToggleButton/ThemeToggleButton";
import LanguageSwitcher from "../../components/common/LanguageSwitcher/LanguageSwitcher";
import api from "../../utils/api";
import { setAuth } from "../../store/authSlice";
import { selectTheme } from "../../store/uiSlice";
import "./Login.css";

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);
    const [mode, setMode] = useState("login");
    const [error, setError] = useState("");

    const handleLoginSubmit = async (loginData) => {
        setError("");
        try {
            const { data } = await api.post("/auth/login", {
                email: loginData.email,
                password: loginData.password,
            });
            dispatch(setAuth(data.user));
            toast.success(t("auth.loggedInSuccess"));
            const nextPath =
                data.user.role === "admin" ? "/admin/dashboard" : "/home";
            setTimeout(() => {
                navigate(nextPath, { replace: true });
            }, 400);
            return true;
        } catch (err) {
            const status = err.response?.status;
            const msg =
                status && status >= 500
                    ? "auth.serverUnavailable"
                    : err.response?.data?.message || "auth.invalidCredentials";
            setError(msg);
            return false;
        }
    };

    const handleRegisterSubmit = async (registerData) => {
        setError("");
        try {
            const formData = new FormData();
            formData.append("name", registerData.name);
            formData.append("email", registerData.email);
            formData.append("password", registerData.password);
            if (registerData.avatarFile) {
                formData.append("avatar", registerData.avatarFile);
            }

            const { data } = await api.post("/auth/register", formData);
            dispatch(setAuth(data.user));
            toast.success(t("auth.accountCreatedSuccess"));
            const nextPath =
                data.user.role === "admin" ? "/admin/dashboard" : "/home";
            setTimeout(() => {
                navigate(nextPath, { replace: true });
            }, 400);
            return true;
        } catch (err) {
            const status = err.response?.status;
            const msg =
                status && status >= 500
                    ? "auth.serverUnavailable"
                    : err.response?.data?.message || "auth.emailExists";
            setError(msg);
            return false;
        }
    };

    return (
        <section
            className={`LoginPage d-flex min-vh-100 align-items-center justify-content-center p-4 ${
                theme === "dark" ? "is-dark" : ""
            }`}
        >
            <div
                className="LoginPage__toolbar"
                aria-label={t("common.loginToolbarAria")}
            >
                <LanguageSwitcher compact />
                <ThemeToggleButton variant="switch" compact />
            </div>
            <div className="auth-stack w-100">
                <div className="auth-header mb-3">
                    <p className="auth-kicker mb-1">{t("auth.headerKicker")}</p>
                    <h2 className="auth-system-title mb-0 lobster-font">
                        {t("common.brandName")}
                    </h2>
                </div>
                <div className="auth-card w-100">
                    <div className="auth-toggle mb-3">
                        <button
                            type="button"
                            className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
                            onClick={() => {
                                setError("");
                                setMode("login");
                            }}
                        >
                            {t("auth.loginTab")}
                        </button>
                        <button
                            type="button"
                            className={`auth-toggle-btn ${mode === "register" ? "active" : ""}`}
                            onClick={() => {
                                setError("");
                                setMode("register");
                            }}
                        >
                            {t("auth.registerTab")}
                        </button>
                    </div>

                    {error ? (
                        <div className="alert alert-danger py-2" role="alert">
                            {t(error, { defaultValue: error })}
                        </div>
                    ) : null}

                    <div className="auth-forms-slider">
                        {mode === "login" ? (
                            <LoginForm onSubmit={handleLoginSubmit} />
                        ) : (
                            <RegisterForm onSubmit={handleRegisterSubmit} />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
