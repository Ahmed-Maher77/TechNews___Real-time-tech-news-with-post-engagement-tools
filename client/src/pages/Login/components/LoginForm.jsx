import MainButton from "../../../components/common/MainButton/MainButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    loginDefaultValues,
    loginSchema,
} from "../../../validations/loginValidation";

function LoginForm({ onSubmit }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: loginDefaultValues,
    });

    const submitHandler = async (values) => {
        const isSuccess = await onSubmit(values);
        if (!isSuccess) return;
    };

    return (
        <form
            key="login-form"
            className="auth-form auth-form-panel auth-form-panel--login"
            onSubmit={handleSubmit(submitHandler)}
            autoComplete="off"
            noValidate
        >
            <h1 className="h4 mb-3 text-center">{t("auth.welcomeBack")}</h1>
            <div className="mb-3">
                <label htmlFor="login-email" className="form-label">
                    {t("auth.email")}
                </label>
                <input
                    type="email"
                    className={`form-control app-form-control ${errors.email ? "is-invalid" : ""}`}
                    id="login-email"
                    name="login_email"
                    autoComplete="off"
                    placeholder={t("auth.enterEmail")}
                    {...register("email")}
                />
                {errors.email ? (
                    <div className="auth-field-error">
                        {t(errors.email.message)}
                    </div>
                ) : null}
            </div>
            <div className="mb-3">
                <label htmlFor="login-password" className="form-label">
                    {t("auth.password")}
                </label>
                <div className="auth-password-wrap">
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control app-form-control ${errors.password ? "is-invalid" : ""}`}
                        id="login-password"
                        name="login_password"
                        autoComplete="new-password"
                        placeholder={t("auth.enterPassword")}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={t(
                            showPassword
                                ? "auth.hidePassword"
                                : "auth.showPassword",
                        )}
                        title={t(
                            showPassword
                                ? "auth.hidePassword"
                                : "auth.showPassword",
                        )}
                    >
                        <i
                            className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                        />
                    </button>
                </div>
                {errors.password ? (
                    <div className="auth-field-error">
                        {t(errors.password.message)}
                    </div>
                ) : null}
            </div>
            <MainButton
                type="submit"
                className="auth-submit-btn mt-2"
                fullWidth
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? t("auth.loginSubmitting")
                    : t("auth.loginSubmit")}
            </MainButton>
        </form>
    );
}

export default LoginForm;
