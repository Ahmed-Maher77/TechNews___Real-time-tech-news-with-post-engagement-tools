import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import formatDate from "../../utils/functions/formatDate";

function PostManagement() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

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
        }
    };

    return (
        <section className="PostManagement py-4">
            <h1 className="h3 mb-2">{t("nav.postManagement")}</h1>
            <p className="text-muted mb-4">{t("admin.postManagementBlurb")}</p>

            {loading ? (
                <p className="mb-0">{t("common.loading")}</p>
            ) : (
                <>
                    <div className="table-responsive rounded-3 border">
                        <table className="table table-striped mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th>{t("createPost.fieldTitle")}</th>
                                    <th>{t("createPost.fieldAuthor")}</th>
                                    <th>{t("admin.featuredCol")}</th>
                                    <th>{t("admin.dateCol")}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.title}</td>
                                        <td>{post.author}</td>
                                        <td>
                                            {post.featured ? (
                                                <span className="badge text-bg-success">
                                                    {t("admin.featuredYes")}
                                                </span>
                                            ) : (
                                                <span className="badge text-bg-secondary">
                                                    {t("admin.featuredNo")}
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatDate(post.date)}</td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-dark"
                                                onClick={() =>
                                                    toggleFeatured(post)
                                                }
                                            >
                                                {post.featured
                                                    ? t("admin.unfeature")
                                                    : t("admin.feature")}
                                            </button>
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
