import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    loginUser,
    registerUser,
    saveStoredAuth,
} from "../../utils/authStorage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        const result = loginUser(loginData);
        if (!result.ok) {
            setError(result.message);
            return;
        }

        const authPayload = {
            isLoggedIn: true,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
        };
        saveStoredAuth(authPayload);
        toast.success("Logged in successfully.");
        navigate(authPayload.role === "admin" ? "/admin/dashboard" : "/home", {
            replace: true,
        });
    };

    const handleRegisterSubmit = (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const result = registerUser({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            role: registerData.role,
        });

        if (!result.ok) {
            setError(result.message);
            return;
        }

        const authPayload = {
            isLoggedIn: true,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
        };
        saveStoredAuth(authPayload);
        toast.success("Account created successfully.");

        setLoginData({
            email: registerData.email,
            password: registerData.password,
        });
        setRegisterData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
        });
        setSuccessMessage("");
        navigate(authPayload.role === "admin" ? "/admin/dashboard" : "/home", {
            replace: true,
        });
    };

    return (
        <section className="LoginPage gray-bg d-flex min-vh-100 align-items-center justify-content-center p-4">
            <div className="auth-card w-100">
                <div className="auth-toggle mb-3">
                    <button
                        type="button"
                        className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
                        onClick={() => {
                            setError("");
                            setSuccessMessage("");
                            setMode("login");
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`auth-toggle-btn ${mode === "register" ? "active" : ""}`}
                        onClick={() => {
                            setError("");
                            setSuccessMessage("");
                            setMode("register");
                        }}
                    >
                        Register
                    </button>
                </div>

                {error ? (
                    <div className="alert alert-danger py-2" role="alert">
                        {error}
                    </div>
                ) : null}
                {successMessage ? (
                    <div className="alert alert-success py-2" role="alert">
                        {successMessage}
                    </div>
                ) : null}

                <div className="auth-forms-slider">
                    {mode === "login" ? (
                        <LoginForm
                            loginData={loginData}
                            setLoginData={setLoginData}
                            onSubmit={handleLoginSubmit}
                        />
                    ) : (
                        <RegisterForm
                            registerData={registerData}
                            setRegisterData={setRegisterData}
                            onSubmit={handleRegisterSubmit}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}

export default Login;
