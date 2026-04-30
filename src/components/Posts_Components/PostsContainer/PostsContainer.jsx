import { Component } from "react";
import PostCard from "../PostCard/PostCard";
import "./PostsContainer.css";

class PostsContainer extends Component {
    render() {
        return (
            <div className="PostsContainer">
                {
                    this.props.posts.map((post) => (
                        <PostCard key={post.id} {...post} />
                    ))
                }
            </div>
        );
    }
}

export default PostsContainer;