import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import "./MyPosts.css";

function MyPosts() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

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

    if (loading) {
        return (
            <section className="MyPosts py-4">
                <header className="my-posts-header mb-4">
                    <h1 className="my-posts-title mb-2">{t("myPosts.title")}</h1>
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
            <header className="my-posts-header mb-4">
                <h1 className="my-posts-title mb-2">{t("myPosts.title")}</h1>
                <p className="my-posts-caption mb-0">{t("myPosts.caption")}</p>
            </header>
            {posts.length ? (
                <PostsContainer posts={posts} />
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
