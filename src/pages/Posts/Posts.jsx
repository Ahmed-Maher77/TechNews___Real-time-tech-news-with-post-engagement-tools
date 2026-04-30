import axios from "axios";
import { Component } from "react";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import FeaturedPost from "../../components/Posts_Components/FeaturedPost/FeaturedPost";
import PostsLoading from "../../components/Posts_Components/PostsLoading/PostsLoading";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";


class Posts extends Component {
    state = {
        posts: [],
        featuredPosts: [],
        isLoading: true,
    }

    fetchPosts = async () => {
        try {
            const res = await axios.get("http://localhost:3000/posts")
            const data = res.data
            if (data.length > 0) {
                const featuredPosts = this.getRandomPosts(data, 3);
                const featuredIds = new Set(featuredPosts.map((post) => post.id));
                const posts = data.filter((post) => !featuredIds.has(post.id));
                this.setState({ posts, featuredPosts, isLoading: false });
                return;
            }

            this.setState({ posts: [], featuredPosts: [], isLoading: false });
        } catch (error) {
            console.log(error);
            this.setState({ isLoading: false });
        }
    }

    getRandomPosts = (posts, count) => {
        const shuffled = [...posts];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }
        return shuffled.slice(0, Math.min(count, shuffled.length));
    };
    
    componentDidMount() {
        this.fetchPosts();
    }


    render() {
        const { posts, featuredPosts, isLoading } = this.state;

        return (
            <div className="Posts">
                {
                    isLoading ? (
                        <PostsLoading />
                    ) : featuredPosts.length > 0 ? (
                        <>
                            <FeaturedPost posts={featuredPosts} />
                            {posts.length > 0 && <PostsContainer posts={posts} />}
                        </>
                    ) :
                    (
                        <NoPostsFoundMessage />
                    )
                }
            </div>
        );
    }
}


export default Posts;