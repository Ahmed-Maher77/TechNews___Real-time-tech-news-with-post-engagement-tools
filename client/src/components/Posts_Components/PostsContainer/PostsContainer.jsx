import { memo } from "react";
import PostCard from "../PostCard/PostCard";
import "./PostsContainer.css";

function PostsContainer({
    posts,
    onEditPost,
    onDeletePost,
    actionInProgressId,
    currentUserId = "",
    className = "",
}) {
    return (
        <div className={`PostsContainer${className ? ` ${className}` : ""}`}>
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    {...post}
                    onEditPost={onEditPost}
                    onDeletePost={onDeletePost}
                    actionInProgressId={actionInProgressId}
                    currentUserId={currentUserId}
                    recordView={className.includes("PostsContainer--records")}
                />
            ))}
        </div>
    );
}

export default memo(PostsContainer);
