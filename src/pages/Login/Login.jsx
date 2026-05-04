import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainButton from "../../components/common/MainButton/MainButton";
import {
    loginUser,
    registerUser,
    saveStoredAuth,
} from "../../utils/authStorage";
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
        setSuccessMessage("Registration successful. You can login now.");
        setMode("login");
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

                <div className={`auth-forms-slider ${mode === "register" ? "register-mode" : ""}`}>
                    <div className="auth-forms-track">
                        <form className="auth-form" onSubmit={handleLoginSubmit}>
                            <h1 className="h4 mb-3">Welcome back</h1>
                            <div className="mb-3">
                                <label htmlFor="login-email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control app-form-control"
                                    id="login-email"
                                    required
                                    placeholder="Enter your email"
                                    value={loginData.email}
                                    onChange={(event) =>
                                        setLoginData((prev) => ({
                                            ...prev,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="login-password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control app-form-control"
                                    id="login-password"
                                    required
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={(event) =>
                                        setLoginData((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <MainButton
                                type="submit"
                                className="auth-submit-btn mt-2"
                                fullWidth
                            >
                                Login
                            </MainButton>
                        </form>

                        <form className="auth-form" onSubmit={handleRegisterSubmit}>
                            <h1 className="h4 mb-3">Create account</h1>
                            <div className="mb-3">
                                <label htmlFor="register-name" className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control app-form-control"
                                    id="register-name"
                                    required
                                    placeholder="Enter your full name"
                                    value={registerData.name}
                                    onChange={(event) =>
                                        setRegisterData((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="register-email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control app-form-control"
                                    id="register-email"
                                    required
                                    placeholder="Enter your email"
                                    value={registerData.email}
                                    onChange={(event) =>
                                        setRegisterData((prev) => ({
                                            ...prev,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="register-password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control app-form-control"
                                    id="register-password"
                                    required
                                    placeholder="Create a password"
                                    value={registerData.password}
                                    onChange={(event) =>
                                        setRegisterData((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="register-confirm-password" className="form-label">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control app-form-control"
                                    id="register-confirm-password"
                                    required
                                    placeholder="Confirm your password"
                                    value={registerData.confirmPassword}
                                    onChange={(event) =>
                                        setRegisterData((prev) => ({
                                            ...prev,
                                            confirmPassword: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="register-role" className="form-label">Role</label>
                                <select
                                    id="register-role"
                                    className="form-select app-form-control"
                                    value={registerData.role}
                                    onChange={(event) =>
                                        setRegisterData((prev) => ({
                                            ...prev,
                                            role: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <MainButton
                                type="submit"
                                className="auth-submit-btn mt-2"
                                fullWidth
                            >
                                Create account
                            </MainButton>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
