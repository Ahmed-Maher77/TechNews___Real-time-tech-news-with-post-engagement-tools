import axios from "axios";
import { Component } from "react";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import FeaturedPost from "../../components/Posts_Components/FeaturedPost/FeaturedPost";
import PostsContainer from "../../components/Posts_Components/PostsContainer/PostsContainer";


class Posts extends Component {
    state = {
        posts: [],
        featuredPost: null,
    }

    fetchPosts = async () => {
        try {
            const res = await axios.get("http://localhost:3000/posts")
            const data = res.data
            if (data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                const featuredPost = data[randomIndex];
                const posts = data.filter((post) => post.id !== featuredPost.id);
                this.setState({ posts, featuredPost });
                return;
            }

            this.setState({ posts: [], featuredPost: null });
        } catch (error) {
            console.log(error);
        }
    }
    
    componentDidMount() {
        this.fetchPosts();
    }


    render() {
        const { posts, featuredPost } = this.state;

        return (
            <div className="Posts">
                {
                    featuredPost ? (
                        <>
                            <FeaturedPost post={featuredPost} />
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