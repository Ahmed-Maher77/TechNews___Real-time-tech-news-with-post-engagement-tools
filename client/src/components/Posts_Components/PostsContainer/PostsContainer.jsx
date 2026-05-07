import { memo } from "react";
import PostCard from "../PostCard/PostCard";
import "./PostsContainer.css";

function PostsContainer({ posts, onEditPost, onDeletePost, actionInProgressId }) {
    return (
        <div className="PostsContainer">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    {...post}
                    onEditPost={onEditPost}
                    onDeletePost={onDeletePost}
                    actionInProgressId={actionInProgressId}
                />
            ))}
        </div>
    );
}

export default memo(PostsContainer);