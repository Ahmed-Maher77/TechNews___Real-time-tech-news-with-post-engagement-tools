import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeletePostModal from "../../components/Posts_Components/DeletePostModal/DeletePostModal";
import api from "../../utils/api";
import formatDate from "../../utils/functions/formatDate";
import "./AdminTables.css";

function PostManagement() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [busyPostId, setBusyPostId] = useState("");
    const [deletingPost, setDeletingPost] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/posts/admin/all", {
                params: { page, limit: 15, search: searchTerm, sort: sortBy },
            });
            setPosts(data.posts || []);
            setPages(data.pages || 1);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, sortBy]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, sortBy]);

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

    const handleDeletePost = async (postId) => {
        if (!postId) return;
        setDeleteSubmitting(true);
        try {
            await api.delete(`/posts/${postId}`);
            toast.success(t("admin.postDeleted"));
            setDeletingPost(null);
            if (posts.length === 1 && page > 1) {
                setPage((prev) => Math.max(1, prev - 1));
                return;
            }
            load();
        } catch {
            toast.error(t("admin.postDeleteError"));
        } finally {
            setDeleteSubmitting(false);
        }
    };

    return (
        <section className="PostManagement py-4">
            <h1 className="h3 mb-2">{t("nav.postManagement")}</h1>
            <p className="text-muted mb-4">{t("admin.postManagementBlurb")}</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
                <input
                    type="search"
                    className="form-control app-form-control"
                    style={{ maxWidth: 320 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("admin.searchPostsPlaceholder")}
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
                                <span className="admin-skeleton-line short"></span>
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
                                    <th></th>
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
                                        <td className="text-end admin-actions-cell">
                                            <div className="admin-actions-group">
                                                <button
                                                    type="button"
                                                    className="admin-icon-action-btn"
                                                    onClick={() =>
                                                        navigate(`/posts/${post.id}`)
                                                    }
                                                    aria-label={t("admin.viewPost")}
                                                    title={t("admin.viewPost")}
                                                >
                                                    <i className="fa-regular fa-eye"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-icon-action-btn admin-icon-action-btn--danger"
                                                    onClick={() =>
                                                        setDeletingPost({
                                                            id: post.id,
                                                            title: post.title,
                                                        })
                                                    }
                                                    aria-label={t("admin.deletePost")}
                                                    title={t("admin.deletePost")}
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

            <DeletePostModal
                open={Boolean(deletingPost)}
                post={deletingPost}
                submitting={deleteSubmitting}
                onClose={() => {
                    if (deleteSubmitting) return;
                    setDeletingPost(null);
                }}
                onConfirm={handleDeletePost}
                title={t("admin.deletePostModalTitle")}
                subtitle={t("admin.deletePostModalSubtitle")}
                itemLabel={t("admin.deletePostModalLabel")}
                cancelLabel={t("admin.deleteCancel")}
                confirmLabel={t("admin.deleteConfirm")}
                deletingLabel={t("admin.deletingPost")}
            />
        </section>
    );
}

export default PostManagement;
