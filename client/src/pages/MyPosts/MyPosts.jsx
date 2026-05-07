import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import EditPostModal from "../../components/Posts_Components/EditPostModal/EditPostModal";
import DeletePostModal from "../../components/Posts_Components/DeletePostModal/DeletePostModal";
import { selectAuth } from "../../store/authSlice";
import "./MyPosts.css";

function MyPosts() {
    const { t } = useTranslation();
    const auth = useSelector(selectAuth);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [actionInProgressId, setActionInProgressId] = useState("");
    const [layoutMode, setLayoutMode] = useState("records");
    const [editingPost, setEditingPost] = useState(null);
    const [deletingPost, setDeletingPost] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setHasError(false);
        try {
            const { data } = await api.get("/posts/mine", {
                params: { limit: 50, page: 1 },
            });
            setPosts(data.posts || []);
        } catch {
            setPosts([]);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDeletePost = useCallback(
        (postId) => {
            const current = posts.find((post) => post.id === postId);
            if (!current) return;
            setDeletingPost(current);
        },
        [posts],
    );

    const handleConfirmDelete = useCallback(
        async (postId) => {
            setActionInProgressId(postId);
            try {
                await api.delete(`/posts/${postId}`);
                setPosts((prev) => prev.filter((post) => post.id !== postId));
                setDeletingPost(null);
                toast.success(t("myPosts.deleteSuccess"));
            } catch {
                toast.error(t("myPosts.deleteError"));
            } finally {
                setActionInProgressId("");
            }
        },
        [t],
    );

    const handleEditPost = useCallback(
        (postId) => {
            const current = posts.find((post) => post.id === postId);
            if (!current) return;
            setEditingPost(current);
        },
        [posts],
    );

    const handleSubmitEdit = useCallback(
        async ({
            id,
            title,
            category,
            description,
            content,
            coverInputMode,
            imageUrl,
            imageFile,
        }) => {
            setActionInProgressId(id);
            try {
                const payload = new FormData();
                payload.append("title", title);
                payload.append("category", category);
                payload.append("description", description);
                payload.append("content", content);
                if (coverInputMode === "file" && imageFile) {
                    payload.append("imageFile", imageFile);
                } else {
                    payload.append("image", imageUrl);
                }
                const { data } = await api.patch(`/posts/${id}`, payload);
                setPosts((prev) => prev.map((post) => (post.id === id ? data : post)));
                setEditingPost(null);
                toast.success(t("myPosts.editSuccess"));
            } catch {
                toast.error(t("myPosts.editError"));
            } finally {
                setActionInProgressId("");
            }
        },
        [t],
    );

    if (loading) {
        return (
            <section className="MyPosts py-max-lg-4">
                <header className="my-posts-header mb-5">
                    <h1 className="my-posts-title mb-2">
                        {t("myPosts.title")}
                    </h1>
                    <p className="my-posts-caption mb-0">
                        {t("myPosts.caption")}
                    </p>
                </header>
                <PostsLoading />
            </section>
        );
    }

    return (
        <section className="MyPosts py-5 py-lg-4">
            <header className="my-posts-header mb-5">
                <h1 className="my-posts-title mb-2">{t("myPosts.title")}</h1>
                <p className="my-posts-caption mb-0">{t("myPosts.caption")}</p>
                <div
                    className="my-posts-layout-toggle mt-3"
                    role="group"
                    aria-label={t("myPosts.layoutToggleAria")}
                >
                    <button
                        type="button"
                        className={`my-posts-layout-btn ${layoutMode === "records" ? "active" : ""}`}
                        onClick={() => setLayoutMode("records")}
                        aria-label={t("myPosts.layoutRecords")}
                        title={t("myPosts.layoutRecords")}
                    >
                        <i className="fa-solid fa-table-list"></i>
                    </button>
                    <button
                        type="button"
                        className={`my-posts-layout-btn ${layoutMode === "cards" ? "active" : ""}`}
                        onClick={() => setLayoutMode("cards")}
                        aria-label={t("myPosts.layoutCards")}
                        title={t("myPosts.layoutCards")}
                    >
                        <i className="fa-solid fa-table-cells-large"></i>
                    </button>
                </div>
            </header>
            {posts.length ? (
                <PostsContainer
                    posts={posts}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    actionInProgressId={actionInProgressId}
                    currentUserId={auth?.id || ""}
                    className={
                        layoutMode === "records"
                            ? "PostsContainer--records"
                            : "PostsContainer--record-cards"
                    }
                />
            ) : (
                <NoPostsFoundMessage
                    title={
                        hasError
                            ? t("myPosts.errorTitle")
                            : t("myPosts.emptyTitle")
                    }
                    subtitle={
                        hasError
                            ? t("myPosts.errorSubtitle")
                            : t("myPosts.emptySubtitle")
                    }
                    buttonLabel={
                        hasError
                            ? t("myPosts.retry")
                            : t("myPosts.createFirstPost")
                    }
                    onButtonClick={hasError ? load : undefined}
                />
            )}
            <EditPostModal
                open={Boolean(editingPost)}
                post={editingPost}
                submitting={
                    Boolean(editingPost) && actionInProgressId === editingPost?.id
                }
                onClose={() => {
                    if (actionInProgressId) return;
                    setEditingPost(null);
                }}
                onSubmit={handleSubmitEdit}
            />
            <DeletePostModal
                open={Boolean(deletingPost)}
                post={deletingPost}
                submitting={
                    Boolean(deletingPost) && actionInProgressId === deletingPost?.id
                }
                onClose={() => {
                    if (actionInProgressId) return;
                    setDeletingPost(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}

export default MyPosts;
