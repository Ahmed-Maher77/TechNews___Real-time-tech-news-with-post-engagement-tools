import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import MainButton from "../../components/common/MainButton/MainButton";
import DeletePostModal from "../../components/Posts_Components/DeletePostModal/DeletePostModal";
import formatDate from "../../utils/functions/formatDate";
import { selectAuth } from "../../store/authSlice";
import "./AdminTables.css";

function UserManagement() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const auth = useSelector(selectAuth);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState(false);
    const [page, setPage] = useState(() => {
        const value = Number.parseInt(searchParams.get("page") || "1", 10);
        return Number.isFinite(value) && value > 0 ? value : 1;
    });
    const [pages, setPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError(false);
        try {
            const { data } = await api.get("/admin/users", {
                params: { page, limit: 12, search: searchTerm, sort: sortBy },
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
    }, [page, searchTerm, sortBy]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, sortBy]);

    useEffect(() => {
        const nextParams = { page: String(page) };
        if (searchTerm.trim()) nextParams.search = searchTerm.trim();
        if (sortBy && sortBy !== "newest") nextParams.sort = sortBy;
        setSearchParams(nextParams, { replace: true });
    }, [page, searchTerm, setSearchParams, sortBy]);

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

    const handleDeleteUser = async (userId) => {
        if (!userId) return;
        setDeleteSubmitting(true);
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success(t("admin.userDeleted"));
            setDeletingUser(null);
            if (users.length === 1 && page > 1) {
                setPage((prev) => Math.max(1, prev - 1));
                return;
            }
            loadUsers();
        } catch (err) {
            const msg = err.response?.data?.message || "admin.userDeleteError";
            toast.error(t(msg, { defaultValue: msg }));
        } finally {
            setDeleteSubmitting(false);
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

            <div
                className={`user-management-create-form-wrap ${
                    showCreateForm ? "is-open" : "is-collapsed"
                }`}
                aria-hidden={!showCreateForm}
            >
                <form
                    id="create-admin-form"
                    className="card border-0 shadow-sm rounded-4 p-4 user-management-create-form"
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
                            placeholder={t("admin.adminNamePlaceholder")}
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
                            placeholder={t("admin.adminEmailPlaceholder")}
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
                            placeholder={t("admin.adminPasswordPlaceholder")}
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
            </div>

            <div className="mt-4">
                <h2 className="h5 mb-3">{t("admin.usersTableTitle")}</h2>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <input
                        type="search"
                        className="form-control app-form-control"
                        style={{ maxWidth: 320 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("admin.searchUsersPlaceholder")}
                    />
                    <select
                        className="form-select app-form-control"
                        style={{ maxWidth: 220 }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">{t("admin.sortNewest")}</option>
                        <option value="oldest">{t("admin.sortOldest")}</option>
                        <option value="name_asc">{t("admin.sortNameAsc")}</option>
                        <option value="name_desc">{t("admin.sortNameDesc")}</option>
                        <option value="email_asc">{t("admin.sortEmailAsc")}</option>
                        <option value="email_desc">{t("admin.sortEmailDesc")}</option>
                    </select>
                </div>
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
                            <table className="table table-striped align-middle admin-table user-management-table">
                                <thead>
                                    <tr>
                                        <th className="admin-name-col">
                                            {t("auth.fullName")}
                                        </th>
                                        <th className="admin-email-col">{t("auth.email")}</th>
                                        <th>{t("admin.roleCol")}</th>
                                        <th>{t("admin.joinedAtCol")}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td
                                                className="admin-title-cell admin-name-col"
                                                data-label={t("auth.fullName")}
                                            >
                                                {user.name}
                                            </td>
                                            <td
                                                className="admin-author-cell admin-email-col"
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
                                                data-label={t("admin.joinedAtCol")}
                                            >
                                                {user.createdAt
                                                    ? formatDate(user.createdAt)
                                                    : "—"}
                                            </td>
                                            <td className="text-end admin-actions-cell">
                                                <div className="admin-actions-group">
                                                    <button
                                                        type="button"
                                                        className="admin-icon-action-btn"
                                                        onClick={() =>
                                                            navigate(`/users/${user.id}`)
                                                        }
                                                        aria-label={t("admin.viewUser")}
                                                        title={t("admin.viewUser")}
                                                    >
                                                        <i className="fa-regular fa-eye"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-icon-action-btn admin-icon-action-btn--danger"
                                                        onClick={() =>
                                                            setDeletingUser({
                                                                id: user.id,
                                                                title: user.name,
                                                            })
                                                        }
                                                        aria-label={t("admin.deleteUser")}
                                                        title={t("admin.deleteUser")}
                                                        disabled={user.id === auth?.id}
                                                    >
                                                        <i className="fa-regular fa-trash-can"></i>
                                                    </button>
                                                </div>
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

            <DeletePostModal
                open={Boolean(deletingUser)}
                post={deletingUser}
                submitting={deleteSubmitting}
                onClose={() => {
                    if (deleteSubmitting) return;
                    setDeletingUser(null);
                }}
                onConfirm={handleDeleteUser}
                title={t("admin.deleteUserModalTitle")}
                subtitle={t("admin.deleteUserModalSubtitle")}
                itemLabel={t("admin.deleteUserModalLabel")}
                cancelLabel={t("admin.deleteCancel")}
                confirmLabel={t("admin.deleteConfirm")}
                deletingLabel={t("admin.deletingUser")}
            />
        </section>
    );
}

export default UserManagement;
