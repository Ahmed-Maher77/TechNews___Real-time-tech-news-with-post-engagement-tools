import api from "../../utils/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import FeaturedPost from "../../components/Posts_Components/FeaturedPost/FeaturedPost";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsToolbar from "../../components/common/PostsToolbar/PostsToolbar";
import useDebounce from "../../hooks/useDebounce";
import { selectAuth } from "../../store/authSlice";
import { getSocket } from "../../utils/socket";
import "./Posts.css";

function Posts() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useSelector(selectAuth);
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchQuery, sortOrder]);

    const fetchLists = useCallback(async () => {
        const hasData = featuredPosts.length > 0 || posts.length > 0;
        setIsLoading(!hasData);
        setIsRefreshing(hasData);
        try {
            const [featRes, postsRes] = await Promise.all([
                api.get("/posts/featured", { params: { limit: 3 } }),
                api.get("/posts", {
                    params: {
                        page,
                        limit: 10,
                        search: debouncedSearchQuery.trim() || undefined,
                        sort: sortOrder,
                    },
                }),
            ]);
            setFeaturedPosts(Array.isArray(featRes.data) ? featRes.data : []);
            setPosts(postsRes.data.posts || []);
            setPages(postsRes.data.pages || 1);
        } catch (error) {
            console.error(error);
            setPosts([]);
            setFeaturedPosts([]);
            setPages(1);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [debouncedSearchQuery, featuredPosts.length, page, posts.length, sortOrder]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const handlePostCreated = useCallback((event) => {
        const created = event?.detail;
        if (!created) return;
        setPosts((prevPosts) => {
            const existsInPosts = prevPosts.some((p) => p.id === created.id);
            if (existsInPosts) return prevPosts;
            return [created, ...prevPosts];
        });
        setFeaturedPosts((prev) => {
            if (!prev.length) return [created];
            return prev;
        });
    }, []);

    useEffect(() => {
        window.addEventListener("postCreated", handlePostCreated);
        return () => {
            window.removeEventListener("postCreated", handlePostCreated);
        };
    }, [handlePostCreated]);

    useEffect(() => {
        const socket = getSocket();

        const onPostCreated = ({ post, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!post) return;
            if (post.moderationStatus && post.moderationStatus !== "approved")
                return;
            setPosts((prev) => {
                if (prev.some((p) => p.id === post.id)) return prev;
                return [post, ...prev];
            });
        };

        const onPostUpdated = ({ post, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!post) return;
            if (post.moderationStatus && post.moderationStatus !== "approved") {
                setPosts((prev) => prev.filter((p) => p.id !== post.id));
                setFeaturedPosts((prev) => prev.filter((p) => p.id !== post.id));
                return;
            }
            setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...post } : p)));
            setFeaturedPosts((prev) =>
                prev.map((p) => (p.id === post.id ? { ...p, ...post } : p)),
            );
        };

        const onPostDeleted = ({ postId, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!postId) return;
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            setFeaturedPosts((prev) => prev.filter((p) => p.id !== postId));
        };

        const onPostReacted = ({ postId, likes, dislikes, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!postId) return;
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? { ...p, likes: Number(likes || 0), dislikes: Number(dislikes || 0) }
                        : p,
                ),
            );
            setFeaturedPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? { ...p, likes: Number(likes || 0), dislikes: Number(dislikes || 0) }
                        : p,
                ),
            );
        };

        const onCommentCreated = ({ postId, comments, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!postId) return;
            const count = Number(comments || 0);
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, comments: count } : p)),
            );
            setFeaturedPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, comments: count } : p)),
            );
        };

        socket.on("post:created", onPostCreated);
        socket.on("post:updated", onPostUpdated);
        socket.on("post:deleted", onPostDeleted);
        socket.on("post:reacted", onPostReacted);
        socket.on("comment:created", onCommentCreated);

        return () => {
            socket.off("post:created", onPostCreated);
            socket.off("post:updated", onPostUpdated);
            socket.off("post:deleted", onPostDeleted);
            socket.off("post:reacted", onPostReacted);
            socket.off("comment:created", onCommentCreated);
        };
    }, [auth?.id]);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    const handleSortChange = useCallback((nextSortOrder) => {
        setSortOrder(nextSortOrder);
    }, []);

    const hasNoMatchingPosts =
        !isLoading && featuredPosts.length > 0 && posts.length === 0;

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

    const showFeed = useMemo(
        () => !isLoading && featuredPosts.length > 0,
        [isLoading, featuredPosts.length],
    );

    return (
        <div className="Posts">
            {isLoading ? (
                <PostsLoading />
            ) : showFeed ? (
                <>
                    <FeaturedPost posts={featuredPosts} />

                    <PostsToolbar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        busy={isRefreshing}
                    />

                    {posts.length > 0 ? (
                        <>
                            <PostsContainer
                                posts={posts}
                                currentUserId={auth?.id || ""}
                            />
                            {pages > 1 ? (
                                <nav
                                    className="d-flex justify-content-center align-items-center gap-2 my-4"
                                    aria-label={t("postsToolbar.paginationAria")}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark btn-sm"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                    >
                                        {t("postsToolbar.prev")}
                                    </button>
                                    <span className="text-secondary small">
                                        {t("postsToolbar.pageStatus", {
                                            current: page,
                                            total: pages,
                                        })}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark btn-sm"
                                        disabled={page >= pages}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(pages, p + 1),
                                            )
                                        }
                                    >
                                        {t("postsToolbar.next")}
                                    </button>
                                </nav>
                            ) : null}
                        </>
                    ) : (
                        hasNoMatchingPosts && (
                            <NoPostsFoundMessage
                                title={t("emptyState.noMatchTitle")}
                                subtitle={t("emptyState.noMatchSubtitle")}
                                buttonLabel={t("emptyState.clearSearch")}
                                onButtonClick={handleClearSearch}
                            />
                        )
                    )}
                </>
            ) : (
                <NoPostsFoundMessage
                    onButtonClick={() => navigate("/create-post")}
                />
            )}
        </div>
    );
}

export default Posts;
