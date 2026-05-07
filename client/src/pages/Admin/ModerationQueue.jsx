import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../utils/api";
import formatDate from "../../utils/functions/formatDate";

function ModerationQueue() {
    const { t } = useTranslation();
    const [status, setStatus] = useState("pending");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [busyPostId, setBusyPostId] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/posts/moderation", {
                params: { status, page, limit: 15 },
            });
            setPosts(data.posts || []);
            setPages(data.pages || 1);
        } catch {
            setPosts([]);
            setPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [status]);

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
            <p className="text-muted mb-3">{t("admin.moderationBlurb")}</p>

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

            {loading ? (
                <p className="mb-0">{t("common.loading")}</p>
            ) : posts.length === 0 ? (
                <p className="text-muted mb-0">{t("admin.moderationEmpty")}</p>
            ) : (
                <>
                    <div className="table-responsive rounded-3 border">
                        <table className="table table-striped mb-0 align-middle">
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
                                    return (
                                        <tr key={post.id}>
                                            <td>{post.title}</td>
                                            <td>{post.author}</td>
                                            <td>
                                                <span className="badge text-bg-secondary text-capitalize">
                                                    {t(`admin.moderationStatus_${post.moderationStatus || "approved"}`)}
                                                </span>
                                            </td>
                                            <td>{formatDate(post.date)}</td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-2">
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
                                            </td>
                                        </tr>
                                    );
                                })}
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
            <p className="text-muted mt-3 mb-0">
                {t("admin.moderationHint")}
            </p>
        </section>
    );
}

export default ModerationQueue;
