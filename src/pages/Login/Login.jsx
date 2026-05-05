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
        userPic: "",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleRegisterImageChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            setRegisterData((prev) => ({ ...prev, userPic: "" }));
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setRegisterData((prev) => ({
                ...prev,
                userPic: typeof reader.result === "string" ? reader.result : "",
            }));
        };
        reader.readAsDataURL(selectedFile);
    };

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
            userPic: result.user.userPic || "",
        };
        saveStoredAuth(authPayload);
        toast.success("Logged in successfully.");
        setTimeout(() => {
            navigate(authPayload.role === "admin" ? "/admin/dashboard" : "/home", {
                replace: true,
            });
        }, 700);
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
            userPic: registerData.userPic,
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
            userPic: result.user.userPic || "",
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
            userPic: "",
        });
        setSuccessMessage("");
        setTimeout(() => {
            navigate(authPayload.role === "admin" ? "/admin/dashboard" : "/home", {
                replace: true,
            });
        }, 700);
    };

    return (
        <section className="LoginPage gray-bg d-flex min-vh-100 align-items-center justify-content-center p-4">
            <div className="auth-stack w-100">
                <div className="auth-header mb-3">
                    <p className="auth-kicker mb-1">Tech News Platform</p>
                    <h2 className="auth-system-title mb-0 lobster-font">TechNews</h2>
                </div>
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
                                onImageChange={handleRegisterImageChange}
                                onSubmit={handleRegisterSubmit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
