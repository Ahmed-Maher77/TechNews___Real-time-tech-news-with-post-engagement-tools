import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import MainButton from "../../components/common/MainButton/MainButton";

function UserManagement() {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/admin/admins", {
                name: name.trim(),
                email: email.trim(),
                password,
            });
            toast.success(t("admin.adminCreated"));
            setName("");
            setEmail("");
            setPassword("");
        } catch (err) {
            const msg = err.response?.data?.message || "admin.adminCreateError";
            toast.error(t(msg, { defaultValue: msg }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="UserManagement py-4">
            <h1 className="h3 mb-2">{t("nav.userManagement")}</h1>
            <p className="text-muted mb-4">{t("admin.createAdminBlurb")}</p>
            <form
                className="card border-0 shadow-sm rounded-4 p-4"
                style={{ maxWidth: 480 }}
                onSubmit={handleSubmit}
            >
                <div className="mb-3">
                    <label className="form-label" htmlFor="admin-name">
                        {t("auth.fullName")}
                    </label>
                    <input
                        id="admin-name"
                        className="form-control app-form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="admin-email">
                        {t("auth.email")}
                    </label>
                    <input
                        id="admin-email"
                        type="email"
                        className="form-control app-form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label" htmlFor="admin-password">
                        {t("auth.password")}
                    </label>
                    <input
                        id="admin-password"
                        type="password"
                        className="form-control app-form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <MainButton type="submit" disabled={submitting} fullWidth>
                    {submitting
                        ? t("admin.creatingAdmin")
                        : t("admin.createAdminSubmit")}
                </MainButton>
            </form>
        </section>
    );
}

export default UserManagement;
