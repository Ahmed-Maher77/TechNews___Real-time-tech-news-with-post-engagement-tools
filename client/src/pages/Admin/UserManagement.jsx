import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import MainButton from "../../components/common/MainButton/MainButton";
import formatDate from "../../utils/functions/formatDate";
import "./AdminTables.css";

function UserManagement() {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError(false);
        try {
            const { data } = await api.get("/admin/users", {
                params: { page, limit: 12 },
            });
            setUsers(data?.users || []);
            setPages(data?.pages || 1);
        } catch {
            setUsers([]);
            setPages(1);
            setUsersError(true);
        } finally {
            setUsersLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
            if (page !== 1) {
                setPage(1);
            } else {
                loadUsers();
            }
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
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <p className="text-muted mb-0">{t("admin.createAdminBlurb")}</p>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => setShowCreateForm((prev) => !prev)}
                    aria-expanded={showCreateForm}
                    aria-controls="create-admin-form"
                >
                    {showCreateForm
                        ? t("admin.hideCreateAdminForm")
                        : t("admin.showCreateAdminForm")}
                </button>
            </div>

            {showCreateForm ? (
                <form
                    id="create-admin-form"
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
                        {submitting ? (
                            <span className="user-management-submitting">
                                <span
                                    className="admin-page-loader-spinner"
                                    aria-hidden="true"
                                ></span>
                                <span>{t("admin.creatingAdmin")}</span>
                            </span>
                        ) : (
                            t("admin.createAdminSubmit")
                        )}
                    </MainButton>
                </form>
            ) : null}

            <div className="mt-4">
                <h2 className="h5 mb-3">{t("admin.usersTableTitle")}</h2>
                {usersLoading ? (
                    <div
                        className="admin-page-loader"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="admin-page-loader-head">
                            <span
                                className="admin-page-loader-spinner"
                                aria-hidden="true"
                            ></span>
                            <p className="admin-page-loader-text mb-0">
                                {t("common.loading")}
                            </p>
                        </div>
                        <div
                            className="admin-table-skeleton admin-table-skeleton--users"
                            aria-hidden="true"
                        >
                            <div className="admin-table-skeleton-head">
                                <span className="admin-skeleton-line medium"></span>
                                <span className="admin-skeleton-line medium"></span>
                                <span className="admin-skeleton-line short"></span>
                                <span className="admin-skeleton-line short"></span>
                            </div>
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div
                                    key={`user-management-skeleton-${idx}`}
                                    className="admin-table-skeleton-row"
                                >
                                    <span className="admin-skeleton-line medium"></span>
                                    <span className="admin-skeleton-line long"></span>
                                    <span className="admin-skeleton-line short"></span>
                                    <span className="admin-skeleton-line short"></span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : usersError ? (
                    <p className="text-muted mb-0">{t("admin.usersTableError")}</p>
                ) : users.length === 0 ? (
                    <p className="text-muted mb-0">{t("admin.usersTableEmpty")}</p>
                ) : (
                    <>
                        <div className="table-responsive admin-table-wrap">
                            <table className="table table-striped align-middle admin-table">
                                <thead>
                                    <tr>
                                        <th>{t("auth.fullName")}</th>
                                        <th>{t("auth.email")}</th>
                                        <th>{t("admin.roleCol")}</th>
                                        <th>{t("admin.dateCol")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td
                                                className="admin-title-cell"
                                                data-label={t("auth.fullName")}
                                            >
                                                {user.name}
                                            </td>
                                            <td
                                                className="admin-author-cell"
                                                data-label={t("auth.email")}
                                            >
                                                {user.email}
                                            </td>
                                            <td data-label={t("admin.roleCol")}>
                                                <span
                                                    className={`badge admin-user-role ${
                                                        user.role === "admin"
                                                            ? "text-bg-dark"
                                                            : "text-bg-secondary"
                                                    }`}
                                                >
                                                    {user.role === "admin"
                                                        ? t("admin.userRoleAdmin")
                                                        : t("admin.userRoleUser")}
                                                </span>
                                            </td>
                                            <td
                                                className="admin-date-cell"
                                                data-label={t("admin.dateCol")}
                                            >
                                                {user.createdAt
                                                    ? formatDate(user.createdAt)
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pages > 1 ? (
                            <div className="d-flex justify-content-center gap-2 mt-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    {t("postsToolbar.prev")}
                                </button>
                                <span className="align-self-center small text-muted">
                                    {t("postsToolbar.pageStatus", {
                                        current: page,
                                        total: pages,
                                    })}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={page >= pages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    {t("postsToolbar.next")}
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </section>
    );
}

export default UserManagement;
