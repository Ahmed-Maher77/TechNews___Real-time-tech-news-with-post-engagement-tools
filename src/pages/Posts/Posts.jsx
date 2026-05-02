import axios from "axios";
import { Component } from "react";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import FeaturedPost from "../../components/Posts_Components/FeaturedPost/FeaturedPost";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";
import PostsToolbar from "../../components/common/PostsToolbar/PostsToolbar";
import "./Posts.css";

class Posts extends Component {
    state = {
        posts: [],
        featuredPosts: [],
        isLoading: true,
        searchQuery: "",
        sortOrder: "newest",
    };

    fetchPosts = async () => {
        try {
            const res = await axios.get("http://localhost:3000/posts");
            const data = res.data;
            if (data.length > 0) {
                const featuredPosts = this.getRandomPosts(data, 3);
                const featuredIds = new Set(
                    featuredPosts.map((post) => post.id),
                );
                const posts = data.filter((post) => !featuredIds.has(post.id));
                this.setState({ posts, featuredPosts, isLoading: false });
                return;
            }

            this.setState({ posts: [], featuredPosts: [], isLoading: false });
        } catch (error) {
            console.log(error);
            this.setState({ isLoading: false });
        }
    };

    getRandomPosts = (posts, count) => {
        const shuffled = [...posts];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[i],
            ];
        }
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    componentDidMount() {
        this.fetchPosts();
        window.addEventListener("postCreated", this.handlePostCreated);
    }

    componentWillUnmount() {
        window.removeEventListener("postCreated", this.handlePostCreated);
    }

    handlePostCreated = (event) => {
        const created = event?.detail;
        if (!created) return;

        this.setState((prev) => {
            const existsInFeatured = prev.featuredPosts.some(
                (p) => p.id === created.id,
            );
            const existsInPosts = prev.posts.some((p) => p.id === created.id);
            if (existsInFeatured || existsInPosts) return null;

            // Add the new post to the non-featured posts list
            return { posts: [created, ...prev.posts] };
        });
    };

    handleSearchChange = (event) => {
        this.setState({ searchQuery: event.target.value });
    };

    handleSortChange = (sortOrder) => {
        this.setState({ sortOrder });
    };

    getFilteredPosts = () => {
        const { posts, searchQuery } = this.state;
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (!normalizedQuery) return posts;

        return posts.filter((post) => {
            const title = (post.title || "").toLowerCase();
            const category = (post.category || "").toLowerCase();

            return (
                title.includes(normalizedQuery) ||
                category.includes(normalizedQuery)
            );
        });
    };

    getSortedPosts = (posts) => {
        const { sortOrder } = this.state;

        return [...posts].sort((firstPost, secondPost) => {
            const firstDate = new Date(firstPost.date || 0).getTime();
            const secondDate = new Date(secondPost.date || 0).getTime();

            return sortOrder === "oldest"
                ? firstDate - secondDate
                : secondDate - firstDate;
        });
    };

    render() {
        const { featuredPosts, isLoading, searchQuery, sortOrder } = this.state;
        const filteredPosts = this.getSortedPosts(this.getFilteredPosts());
        const hasNoMatchingPosts =
            !isLoading &&
            featuredPosts.length > 0 &&
            filteredPosts.length === 0;

        return (
            <div className="Posts">
                {isLoading ? (
                    <PostsLoading />
                ) : featuredPosts.length > 0 ? (
                    <>
                        <FeaturedPost posts={featuredPosts} />

                        <PostsToolbar
                            searchQuery={searchQuery}
                            onSearchChange={this.handleSearchChange}
                            sortOrder={sortOrder}
                            onSortChange={this.handleSortChange}
                        />

                        {filteredPosts.length > 0 ? (
                            <PostsContainer posts={filteredPosts} />
                        ) : (
                            hasNoMatchingPosts && (
                                <NoPostsFoundMessage
                                    title="No matching posts"
                                    subtitle="Try a different title or category to find posts in the feed."
                                    buttonLabel="Clear the search"
                                    onButtonClick={() =>
                                        this.setState({ searchQuery: "" })
                                    }
                                />
                            )
                        )}
                    </>
                ) : (
                    <NoPostsFoundMessage />
                )}
            </div>
        );
    }
}

export default Posts;
