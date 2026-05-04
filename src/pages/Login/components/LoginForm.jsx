import MainButton from "../../../components/common/MainButton/MainButton";

function LoginForm({ loginData, setLoginData, onSubmit }) {
    return (
        <form
            key="login-form"
            className="auth-form auth-form-panel auth-form-panel--login"
            onSubmit={onSubmit}
            autoComplete="off"
        >
            <h1 className="h4 mb-3 text-center">Welcome back</h1>
            <div className="mb-3">
                <label htmlFor="login-email" className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control app-form-control"
                    id="login-email"
                    name="login_email"
                    autoComplete="off"
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
                    name="login_password"
                    autoComplete="new-password"
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
    );
}

export default LoginForm;
