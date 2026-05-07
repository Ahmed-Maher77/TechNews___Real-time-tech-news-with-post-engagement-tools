import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import formatDate from "../../utils/functions/formatDate";
import "./AdminTables.css";

function ModerationQueue() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [status, setStatus] = useState(searchParams.get("status") || "pending");
    const [page, setPage] = useState(() => {
        const value = Number.parseInt(searchParams.get("page") || "1", 10);
        return Number.isFinite(value) && value > 0 ? value : 1;
    });
    const [pages, setPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [busyPostId, setBusyPostId] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/posts/moderation", {
                params: {
                    status,
                    page,
                    limit: 15,
                    search: searchTerm,
                    sort: sortBy,
                },
            });
            setPosts(data.posts || []);
            setPages(data.pages || 1);
        } catch {
            setPosts([]);
            setPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, sortBy, status]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, sortBy, status]);

    useEffect(() => {
        const nextParams = { page: String(page) };
        if (status && status !== "pending") nextParams.status = status;
        if (searchTerm.trim()) nextParams.search = searchTerm.trim();
        if (sortBy && sortBy !== "newest") nextParams.sort = sortBy;
        setSearchParams(nextParams, { replace: true });
    }, [page, searchTerm, setSearchParams, sortBy, status]);

    const handleModeration = async (postId, nextStatus) => {
        setBusyPostId(postId);
        try {
            const { data } = await api.patch(`/admin/posts/${postId}/moderation`, {
                status: nextStatus,
            });
            setPosts((prev) =>
                prev.map((p) => (p.id === data.id ? data : p)).filter((p) => {
                    if (status === "all") return true;
                    return p.moderationStatus === status;
                }),
            );
            toast.success(
                nextStatus === "approved"
                    ? t("admin.moderationApproved")
                    : t("admin.moderationRejected"),
            );
        } catch {
            toast.error(t("admin.moderationError"));
        } finally {
            setBusyPostId("");
        }
    };

    return (
        <section className="ModerationQueue py-4">
            <h1 className="h3 mb-2">{t("nav.moderationQueue")}</h1>
            <p className="text-muted mb-5">{t("admin.moderationBlurb")}</p>

            <div className="d-flex gap-2 flex-wrap mb-3">
                {["pending", "approved", "rejected", "all"].map((key) => (
                    <button
                        key={key}
                        type="button"
                        className={`btn btn-sm ${status === key ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setStatus(key)}
                    >
                        {t(`admin.moderationFilter_${key}`)}
                    </button>
                ))}
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3">
                <input
                    type="search"
                    className="form-control app-form-control"
                    style={{ maxWidth: 320 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("admin.searchModerationPlaceholder")}
                />
                <select
                    className="form-select app-form-control"
                    style={{ maxWidth: 220 }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">{t("admin.sortNewest")}</option>
                    <option value="oldest">{t("admin.sortOldest")}</option>
                    <option value="title_asc">{t("admin.sortTitleAsc")}</option>
                    <option value="title_desc">{t("admin.sortTitleDesc")}</option>
                </select>
            </div>

            {loading ? (
                <div className="admin-page-loader" role="status" aria-live="polite">
                    <div className="admin-page-loader-head">
                        <span
                            className="admin-page-loader-spinner"
                            aria-hidden="true"
                        ></span>
                        <p className="admin-page-loader-text mb-0">
                            {t("common.loading")}
                        </p>
                    </div>
                    <div className="admin-table-skeleton" aria-hidden="true">
                        <div className="admin-table-skeleton-head">
                            <span className="admin-skeleton-line medium"></span>
                            <span className="admin-skeleton-line short"></span>
                            <span className="admin-skeleton-line short"></span>
                            <span className="admin-skeleton-line short"></span>
                            <span className="admin-skeleton-line short"></span>
                        </div>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div
                                key={`moderation-queue-skeleton-${idx}`}
                                className="admin-table-skeleton-row"
                            >
                                <span className="admin-skeleton-line long"></span>
                                <span className="admin-skeleton-line medium"></span>
                                <span className="admin-skeleton-line short"></span>
                                <span className="admin-skeleton-line short"></span>
                                <span className="admin-skeleton-line medium"></span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : posts.length === 0 ? (
                <p className="text-muted mb-0">{t("admin.moderationEmpty")}</p>
            ) : (
                <>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table table-striped align-middle admin-table">
                            <thead>
                                <tr>
                                    <th>{t("createPost.fieldTitle")}</th>
                                    <th>{t("createPost.fieldAuthor")}</th>
                                    <th>{t("admin.statusCol")}</th>
                                    <th>{t("admin.dateCol")}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => {
                                    const isBusy = busyPostId === post.id;
                                    const isPending =
                                        (post.moderationStatus || "pending") ===
                                        "pending";
                                    const canShowActions =
                                        status === "all" ? isPending : true;
                                    return (
                                        <tr key={post.id}>
                                            <td
                                                className="admin-title-cell"
                                                data-label={t("createPost.fieldTitle")}
                                            >
                                                {post.title}
                                            </td>
                                            <td
                                                className="admin-author-cell"
                                                data-label={t("createPost.fieldAuthor")}
                                            >
                                                {post.author}
                                            </td>
                                            <td data-label={t("admin.statusCol")}>
                                                <span className="badge text-bg-secondary text-capitalize admin-status-badge">
                                                    {t(`admin.moderationStatus_${post.moderationStatus || "approved"}`)}
                                                </span>
                                            </td>
                                            <td
                                                className="admin-date-cell"
                                                data-label={t("admin.dateCol")}
                                            >
                                                {formatDate(post.date)}
                                            </td>
                                            <td className="text-end admin-actions-cell">
                                                {canShowActions ? (
                                                    <div className="admin-actions-group">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-success"
                                                            disabled={
                                                                isBusy ||
                                                                post.moderationStatus === "approved"
                                                            }
                                                            onClick={() =>
                                                                handleModeration(
                                                                    post.id,
                                                                    "approved",
                                                                )
                                                            }
                                                        >
                                                            {t("admin.approve")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={
                                                                isBusy ||
                                                                post.moderationStatus === "rejected"
                                                            }
                                                            onClick={() =>
                                                                handleModeration(
                                                                    post.id,
                                                                    "rejected",
                                                                )
                                                            }
                                                        >
                                                            {t("admin.reject")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
                </>
            )}
            <p className="text-muted mt-3 mb-0">
                {t("admin.moderationHint")}
            </p>
        </section>
    );
}

export default ModerationQueue;
