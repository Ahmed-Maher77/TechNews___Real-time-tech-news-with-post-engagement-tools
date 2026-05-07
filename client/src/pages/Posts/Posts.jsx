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
import "./Posts.css";

function Posts() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useSelector(selectAuth);
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchQuery, sortOrder]);

    const fetchLists = useCallback(async () => {
        setIsLoading(true);
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
        }
    }, [page, debouncedSearchQuery, sortOrder]);

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
