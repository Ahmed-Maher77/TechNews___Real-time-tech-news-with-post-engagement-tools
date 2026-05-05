import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar/Avatar";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import formatDate from "../../utils/functions/formatDate";
import { getStoredAuth } from "../../utils/authStorage";
import "./PostDetails.css";
import { toast } from "react-toastify";

function PostDetails() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reaction, setReaction] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);

    const auth = getStoredAuth();
    const commenterName = auth?.name || "Guest User";
    const commenterPic = auth?.userPic || "";

    useEffect(() => {
        const fetchPostById = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/posts/${postId}`);
                const fetchedPost = response.data;
                setPost(fetchedPost);
                setLikes(fetchedPost?.likes || 0);
                setDislikes(fetchedPost?.dislikes || 0);
            } catch {
                setPost(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostById();
    }, [postId]);

    const readMins = useMemo(() => {
        if (!post) return 1;
        const text = `${post.title || ""} ${post.description || ""} ${post.content || ""}`.trim();
        const words = text ? text.split(/\s+/).length : 0;
        return Math.max(1, Math.ceil(words / 220));
    }, [post]);

    const postUrl = useMemo(
        () => `${window.location.origin}/posts/${postId}`,
        [postId],
    );

    const persistReactions = useCallback(
        async (nextLikes, nextDislikes) => {
            try {
                await axios.patch(`http://localhost:3000/posts/${postId}`, {
                    likes: nextLikes,
                    dislikes: nextDislikes,
                });
            } catch {
                toast.error("Unable to save reactions. Please try again.");
            }
        },
        [postId],
    );

    const handleLike = useCallback(() => {
        if (reaction === "like") {
            const nextLikes = Math.max(0, likes - 1);
            setReaction(null);
            setLikes(nextLikes);
            persistReactions(nextLikes, dislikes);
            return;
        }

        let nextDislikes = dislikes;
        if (reaction === "dislike") {
            nextDislikes = Math.max(0, dislikes - 1);
            setDislikes(nextDislikes);
        }

        const nextLikes = likes + 1;
        setReaction("like");
        setLikes(nextLikes);
        persistReactions(nextLikes, nextDislikes);
    }, [dislikes, likes, persistReactions, reaction]);

    const handleDislike = useCallback(() => {
        if (reaction === "dislike") {
            const nextDislikes = Math.max(0, dislikes - 1);
            setReaction(null);
            setDislikes(nextDislikes);
            persistReactions(likes, nextDislikes);
            return;
        }

        let nextLikes = likes;
        if (reaction === "like") {
            nextLikes = Math.max(0, likes - 1);
            setLikes(nextLikes);
        }

        const nextDislikes = dislikes + 1;
        setReaction("dislike");
        setDislikes(nextDislikes);
        persistReactions(nextLikes, nextDislikes);
    }, [dislikes, likes, persistReactions, reaction]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post?.title || "TechNews Post",
                    text: post?.description || "",
                    url: postUrl,
                });
                return;
            }
            await navigator.clipboard.writeText(postUrl);
        } catch {
            // no-op fallback for unsupported clipboard
        }
    };

    const handleAddComment = useCallback(
        (event) => {
            event.preventDefault();
            const nextComment = commentText.trim();
            if (!nextComment) return;

            setComments((prev) => [
                {
                    id: crypto.randomUUID(),
                    name: commenterName,
                    userPic: commenterPic,
                    text: nextComment,
                },
                ...prev,
            ]);
            setCommentText("");
        },
        [commentText, commenterName, commenterPic],
    );

    if (isLoading) return <section className="PostDetails">Loading post...</section>;
    if (!post) {
        return (
            <section className="PostDetails">
                <NoPostsFoundMessage
                    title="Post not found"
                    subtitle="This post may have been removed or the link is invalid."
                />
            </section>
        );
    }

    return (
        <section className="PostDetails">
            <article className="post-details-card">
                {post.image ? (
                    <div className="post-details-banner">
                        <img
                            className="post-details-image"
                            src={post.image}
                            alt={post.title || "Post cover"}
                        />
                        <div className="post-details-banner-actions">
                            <button
                                type="button"
                                className={`post-details-action-btn post-details-banner-btn ${isFavorite ? "active" : ""}`}
                                onClick={() => setIsFavorite((prev) => !prev)}
                                aria-label="Toggle favorite"
                            >
                                <i
                                    className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-bookmark`}
                                ></i>
                            </button>
                            <button
                                type="button"
                                className="post-details-action-btn post-details-banner-btn"
                                onClick={handleShare}
                                aria-label="Share post"
                            >
                                <i className="fa-solid fa-share-nodes"></i>
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="post-details-content">
                    <header className="post-details-header">
                        <div className="details-container">
                            <div className="post-details-author">
                                <Avatar username={post.author} size={42} />
                                <span>{post.author}</span>
                            </div>
                            <div className="post-details-meta">
                                <span>
                                    <i className="fa-regular fa-calendar me-2"></i>
                                    {formatDate(post.date)}
                                </span>
                                <span className="text-capitalize">
                                    <i className="fa-solid fa-tag me-2"></i>
                                    {post.category}
                                </span>
                                <span>
                                    <i className="fa-regular fa-clock me-2"></i>
                                    {readMins} mins read
                                </span>
                            </div>
                        </div>
                        <h1 className="post-details-title">{post.title}</h1>
                    </header>

                    <p className="post-details-description">{post.description}</p>
                    <p className="post-details-body">{post.content}</p>

                    <div className="post-details-actions">
                        <button
                            type="button"
                            className={`post-details-action-btn ${reaction === "like" ? "active" : ""}`}
                            onClick={handleLike}
                        >
                            <i className="fa-regular fa-thumbs-up"></i> {likes}
                        </button>
                        <button
                            type="button"
                            className={`post-details-action-btn ${reaction === "dislike" ? "active" : ""}`}
                            onClick={handleDislike}
                        >
                            <i className="fa-regular fa-thumbs-down"></i> {dislikes}
                        </button>
                    </div>

                    <div className="post-details-comments">
                        <h2 className="h5 mb-3">Comments</h2>
                        <form onSubmit={handleAddComment} className="post-details-comment-form">
                            <div className="post-details-comment-author">
                                <Avatar username={commenterName} src={commenterPic} size={34} />
                                <strong>{commenterName}</strong>
                            </div>
                            <textarea
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                className="form-control"
                                rows={3}
                                placeholder="Write your comment..."
                            />
                            <button type="submit" className="btn btn-dark">
                                Add comment
                            </button>
                        </form>

                        <div className="post-details-comment-list">
                            {comments.length ? (
                                comments.map((comment) => (
                                    <article key={comment.id} className="post-details-comment-item">
                                        <Avatar
                                            username={comment.name}
                                            src={comment.userPic}
                                            size={34}
                                        />
                                        <div>
                                            <strong>{comment.name}</strong>
                                            <p className="mb-0">{comment.text}</p>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="post-details-empty-comments">
                                    <i className="fa-regular fa-comments"></i>
                                    <p className="mb-0">No comments yet. Start the discussion.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </section>
    );
}

export default PostDetails;
