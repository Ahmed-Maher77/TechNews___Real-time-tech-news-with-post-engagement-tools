import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import { selectAuth } from "../../store/authSlice";
import "./MyPosts.css";

function MyPosts() {
    const { t } = useTranslation();
    const auth = useSelector(selectAuth);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [actionInProgressId, setActionInProgressId] = useState("");

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
        async (postId) => {
            const confirmed = window.confirm(t("myPosts.confirmDelete"));
            if (!confirmed) return;
            setActionInProgressId(postId);
            try {
                await api.delete(`/posts/${postId}`);
                setPosts((prev) => prev.filter((post) => post.id !== postId));
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
        async (postId) => {
            const current = posts.find((post) => post.id === postId);
            if (!current) return;

            const title = window.prompt(
                t("myPosts.editTitlePrompt"),
                current.title,
            );
            if (title === null) return;

            const description = window.prompt(
                t("myPosts.editDescriptionPrompt"),
                current.description,
            );
            if (description === null) return;

            const content = window.prompt(
                t("myPosts.editContentPrompt"),
                current.content,
            );
            if (content === null) return;

            setActionInProgressId(postId);
            try {
                const { data } = await api.patch(`/posts/${postId}`, {
                    title: title.trim(),
                    description: description.trim(),
                    content: content.trim(),
                });
                setPosts((prev) =>
                    prev.map((post) => (post.id === postId ? data : post)),
                );
                toast.success(t("myPosts.editSuccess"));
            } catch {
                toast.error(t("myPosts.editError"));
            } finally {
                setActionInProgressId("");
            }
        },
        [posts, t],
    );

    if (loading) {
        return (
            <section className="MyPosts py-4">
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
        <section className="MyPosts py-4">
            <header className="my-posts-header mb-5">
                <h1 className="my-posts-title mb-2">{t("myPosts.title")}</h1>
                <p className="my-posts-caption mb-0">{t("myPosts.caption")}</p>
            </header>
            {posts.length ? (
                <PostsContainer
                    posts={posts}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    actionInProgressId={actionInProgressId}
                    currentUserId={auth?.id || ""}
                    className="PostsContainer--records"
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
        </section>
    );
}

export default MyPosts;
