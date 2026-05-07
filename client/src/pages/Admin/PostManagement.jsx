import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import formatDate from "../../utils/functions/formatDate";
import "./AdminTables.css";

function PostManagement() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [busyPostId, setBusyPostId] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/posts/admin/all", {
                params: { page, limit: 15 },
            });
            setPosts(data.posts || []);
            setPages(data.pages || 1);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    const toggleFeatured = async (post) => {
        setBusyPostId(post.id);
        try {
            const { data } = await api.patch(`/posts/${post.id}/featured`, {
                featured: !post.featured,
            });
            setPosts((prev) =>
                prev.map((p) => (p.id === data.id ? data : p)),
            );
            toast.success(t("admin.featuredUpdated"));
        } catch {
            toast.error(t("admin.featuredError"));
        } finally {
            setBusyPostId("");
        }
    };

    return (
        <section className="PostManagement py-4">
            <h1 className="h3 mb-2">{t("nav.postManagement")}</h1>
            <p className="text-muted mb-4">{t("admin.postManagementBlurb")}</p>

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
                                key={`post-management-skeleton-${idx}`}
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
            ) : (
                <>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table table-striped align-middle admin-table">
                            <thead>
                                <tr>
                                    <th>{t("createPost.fieldTitle")}</th>
                                    <th>{t("createPost.fieldAuthor")}</th>
                                    <th>{t("admin.markAsFeatured")}</th>
                                    <th>{t("admin.statusCol")}</th>
                                    <th>{t("admin.dateCol")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
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
                                        <td
                                            data-label={t("admin.markAsFeatured")}
                                            className="admin-checkbox-cell"
                                        >
                                            <label className="admin-checkbox-wrap">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(post.featured)}
                                                    disabled={
                                                        post.moderationStatus === "rejected" ||
                                                        busyPostId === post.id
                                                    }
                                                    onChange={() =>
                                                        toggleFeatured(post)
                                                    }
                                                />
                                                <span className="admin-checkbox-label">
                                                    {post.featured
                                                        ? t("admin.featuredYes")
                                                        : t("admin.featuredNo")}
                                                </span>
                                            </label>
                                        </td>
                                        <td data-label={t("admin.statusCol")}>
                                            <span className="badge text-bg-secondary text-capitalize admin-status-badge">
                                                {t(
                                                    `admin.moderationStatus_${post.moderationStatus || "approved"}`,
                                                )}
                                            </span>
                                        </td>
                                        <td
                                            className="admin-date-cell"
                                            data-label={t("admin.dateCol")}
                                        >
                                            {formatDate(post.date)}
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
        </section>
    );
}

export default PostManagement;
