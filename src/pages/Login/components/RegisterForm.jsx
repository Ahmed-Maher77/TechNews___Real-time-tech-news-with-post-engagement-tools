import MainButton from "../../../components/common/MainButton/MainButton";

function RegisterForm({ registerData, setRegisterData, onSubmit, onImageChange }) {
    return (
        <form
            key="register-form"
            className="auth-form auth-form-panel auth-form-panel--register"
            onSubmit={onSubmit}
            autoComplete="off"
        >
            <h1 className="h4 mb-3 text-center">Create account</h1>
            <div className="auth-avatar-field mb-4">
                <input
                    type="file"
                    className="auth-avatar-file-input"
                    id="register-user-pic"
                    accept="image/*"
                    onChange={onImageChange}
                />
                <label htmlFor="register-user-pic" className="auth-avatar-label">
                    {registerData.userPic ? (
                        <img src={registerData.userPic} alt="" />
                    ) : (
                        <span className="auth-avatar-placeholder" aria-hidden>
                            <i className="fa-regular fa-user" />
                        </span>
                    )}
                </label>
                <p className="auth-avatar-caption mb-0">
                    <strong>Profile photo</strong> — optional. Tap the circle to upload your
                    picture
                </p>
            </div>
            <div className="mb-3">
                <label htmlFor="register-name" className="form-label">Full Name</label>
                <input
                    type="text"
                    className="form-control app-form-control"
                    id="register-name"
                    name="register_name"
                    autoComplete="off"
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
                    name="register_email"
                    autoComplete="off"
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
                    name="register_password"
                    autoComplete="new-password"
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
                    name="register_confirm_password"
                    autoComplete="new-password"
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
    );
}

export default RegisterForm;
