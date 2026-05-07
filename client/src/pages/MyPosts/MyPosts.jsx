import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";

function MyPosts() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/posts/mine", {
                params: { limit: 50, page: 1 },
            });
            setPosts(data.posts || []);
        } catch {
            setPosts([]);
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
                <h1 className="h4 mb-3">{t("myPosts.title")}</h1>
                <PostsLoading />
            </section>
        );
    }

    return (
        <section className="MyPosts py-4">
            <h1 className="h4 mb-3">{t("myPosts.title")}</h1>
            {posts.length ? (
                <PostsContainer posts={posts} />
            ) : (
                <p className="text-muted mb-0">{t("myPosts.empty")}</p>
            )}
        </section>
    );
}

export default MyPosts;
