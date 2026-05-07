import MainButton from "../../../components/common/MainButton/MainButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    registerDefaultValues,
    registerSchema,
} from "../../../validations/registerValidation";

function RegisterForm({ onSubmit }) {
    const { t } = useTranslation();
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [imageError, setImageError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: registerDefaultValues,
    });

    useEffect(() => {
        return () => {
            if (avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleRegisterImageChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            setAvatarFile(null);
            setAvatarPreview("");
            setImageError("");
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setImageError("auth.imageInvalid");
            return;
        }

        setAvatarFile(selectedFile);
        setAvatarPreview(URL.createObjectURL(selectedFile));
        setImageError("");
    };

    const submitHandler = async (values) => {
        const isSuccess = await onSubmit({
            ...values,
            avatarFile,
        });
        if (!isSuccess) return;
        reset();
        setAvatarFile(null);
        setAvatarPreview("");
        setImageError("");
    };

    return (
        <form
            key="register-form"
            className="auth-form auth-form-panel auth-form-panel--register"
            onSubmit={handleSubmit(submitHandler)}
            autoComplete="off"
            noValidate
        >
            <h1 className="h4 mb-3 text-center">{t("auth.createAccount")}</h1>
            <div className="auth-avatar-field mb-4">
                <input
                    type="file"
                    className="auth-avatar-file-input"
                    id="register-user-pic"
                    accept="image/*"
                    onChange={handleRegisterImageChange}
                />
                <label
                    htmlFor="register-user-pic"
                    className="auth-avatar-label"
                >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="" />
                    ) : (
                        <span className="auth-avatar-placeholder" aria-hidden>
                            <i className="fa-regular fa-user" />
                        </span>
                    )}
                </label>
                <p className="auth-avatar-caption mb-0">
                    <strong>{t("auth.profilePhoto")}</strong> —{" "}
                    {t("auth.profilePhotoHint")}
                </p>
                {imageError ? (
                    <div className="auth-field-error text-center">
                        {t(imageError)}
                    </div>
                ) : null}
            </div>
            <div className="mb-3">
                <label htmlFor="register-name" className="form-label">
                    {t("auth.fullName")}
                </label>
                <input
                    type="text"
                    className={`form-control app-form-control ${errors.name ? "is-invalid" : ""}`}
                    id="register-name"
                    name="register_name"
                    autoComplete="off"
                    placeholder={t("auth.enterFullName")}
                    {...register("name")}
                />
                {errors.name ? (
                    <div className="auth-field-error">
                        {t(errors.name.message)}
                    </div>
                ) : null}
            </div>
            <div className="mb-3">
                <label htmlFor="register-email" className="form-label">
                    {t("auth.email")}
                </label>
                <input
                    type="email"
                    className={`form-control app-form-control ${errors.email ? "is-invalid" : ""}`}
                    id="register-email"
                    name="register_email"
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
                <label htmlFor="register-password" className="form-label">
                    {t("auth.password")}
                </label>
                <div className="auth-password-wrap">
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control app-form-control ${errors.password ? "is-invalid" : ""}`}
                        id="register-password"
                        name="register_password"
                        autoComplete="new-password"
                        placeholder={t("auth.createPassword")}
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
            <div className="mb-3">
                <label
                    htmlFor="register-confirm-password"
                    className="form-label"
                >
                    {t("auth.confirmPassword")}
                </label>
                <div className="auth-password-wrap">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control app-form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        id="register-confirm-password"
                        name="register_confirm_password"
                        autoComplete="new-password"
                        placeholder={t("auth.confirmPasswordPlaceholder")}
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={t(
                            showConfirmPassword
                                ? "auth.hidePassword"
                                : "auth.showPassword",
                        )}
                        title={t(
                            showConfirmPassword
                                ? "auth.hidePassword"
                                : "auth.showPassword",
                        )}
                    >
                        <i
                            className={`fa-regular ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                        />
                    </button>
                </div>
                {errors.confirmPassword ? (
                    <div className="auth-field-error">
                        {t(errors.confirmPassword.message)}
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
                    ? t("auth.registerSubmitting")
                    : t("auth.registerSubmit")}
            </MainButton>
        </form>
    );
}

export default RegisterForm;
