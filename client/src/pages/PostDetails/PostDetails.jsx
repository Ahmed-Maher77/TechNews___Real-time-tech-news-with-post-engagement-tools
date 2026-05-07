import api from "../../utils/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Avatar from "../../components/common/Avatar/Avatar";
import NoPostsFoundMessage from "../../components/NoPostsFoundMessage/NoPostsFoundMessage";
import formatDate from "../../utils/functions/formatDate";
import { selectAuth } from "../../store/authSlice";
import "./PostDetails.css";
import { toast } from "react-toastify";
import TooltipText from "../../components/common/TooltipText/TooltipText";
import { getSocket } from "../../utils/socket";

function PostDetails() {
    const { t } = useTranslation();
    const { postId } = useParams();
    const auth = useSelector(selectAuth);
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reaction, setReaction] = useState(null);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);

    const commenterName = auth?.name || t("postDetails.guestUser");
    const commenterPic = auth?.userPic || "";
    const commentsSectionRef = useRef(null);

    useEffect(() => {
        const fetchPostById = async () => {
            try {
                const response = await api.get(`/posts/${postId}`);
                const fetchedPost = response.data;
                setPost(fetchedPost);
                setLikes(fetchedPost?.likes || 0);
                setDislikes(fetchedPost?.dislikes || 0);
                setReaction(fetchedPost?.reaction || null);
            } catch {
                setPost(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostById();
    }, [postId]);

    useEffect(() => {
        const loadComments = async () => {
            setCommentsLoading(true);
            try {
                const { data } = await api.get(`/posts/${postId}/comments`);
                setComments(
                    (Array.isArray(data) ? data : []).map((c) => ({
                        ...c,
                        reaction: null,
                    })),
                );
            } catch {
                setComments([]);
            } finally {
                setCommentsLoading(false);
            }
        };
        loadComments();
    }, [postId]);

    useEffect(() => {
        const socket = getSocket();
        socket.emit("post:join", postId);

        const onPostReacted = ({ postId: eventPostId, likes, dislikes, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (eventPostId !== postId) return;
            const nextLikes = Number(likes || 0);
            const nextDislikes = Number(dislikes || 0);
            setLikes(nextLikes);
            setDislikes(nextDislikes);
            setPost((prevPost) =>
                prevPost
                    ? {
                          ...prevPost,
                          likes: nextLikes,
                          dislikes: nextDislikes,
                      }
                    : prevPost,
            );
        };

        const onCommentCreated = ({
            postId: eventPostId,
            comment,
            comments,
            actorId,
        }) => {
            if (actorId && actorId === auth?.id) return;
            if (eventPostId !== postId || !comment) return;
            setComments((prev) => {
                if (prev.some((c) => c.id === comment.id)) return prev;
                return [{ ...comment, reaction: null }, ...prev];
            });
            setPost((prevPost) =>
                prevPost
                    ? {
                          ...prevPost,
                          comments: Number(comments || (prevPost.comments || 0) + 1),
                      }
                    : prevPost,
            );
        };

        const onCommentVoted = ({ postId: eventPostId, comment, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (eventPostId !== postId || !comment) return;
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === comment.id
                        ? {
                              ...c,
                              upvotes: comment.upvotes,
                              downvotes: comment.downvotes,
                          }
                        : c,
                ),
            );
        };

        const onPostUpdated = ({ post: updatedPost, actorId }) => {
            if (actorId && actorId === auth?.id) return;
            if (!updatedPost || updatedPost.id !== postId) return;
            setPost((prevPost) => (prevPost ? { ...prevPost, ...updatedPost } : updatedPost));
        };

        const onPostDeleted = ({ postId: deletedPostId }) => {
            if (deletedPostId !== postId) return;
            setPost(null);
        };

        socket.on("post:reacted", onPostReacted);
        socket.on("comment:created", onCommentCreated);
        socket.on("comment:voted", onCommentVoted);
        socket.on("post:updated", onPostUpdated);
        socket.on("post:deleted", onPostDeleted);

        return () => {
            socket.emit("post:leave", postId);
            socket.off("post:reacted", onPostReacted);
            socket.off("comment:created", onCommentCreated);
            socket.off("comment:voted", onCommentVoted);
            socket.off("post:updated", onPostUpdated);
            socket.off("post:deleted", onPostDeleted);
        };
    }, [auth?.id, postId]);

    const readMins = useMemo(() => {
        if (!post) return 1;
        const text =
            `${post.title || ""} ${post.description || ""} ${post.content || ""}`.trim();
        const words = text ? text.split(/\s+/).length : 0;
        return Math.max(1, Math.ceil(words / 220));
    }, [post]);

    const postUrl = useMemo(
        () => `${window.location.origin}/posts/${postId}`,
        [postId],
    );

    const setServerReaction = useCallback(
        async (type) => {
            try {
                const { data } = await api.post(`/posts/${postId}/reactions`, {
                    type,
                });
                setLikes(data.likes || 0);
                setDislikes(data.dislikes || 0);
                setReaction(data.reaction || null);
                setPost((prevPost) =>
                    prevPost
                        ? {
                              ...prevPost,
                              likes: data.likes || 0,
                              dislikes: data.dislikes || 0,
                          }
                        : prevPost,
                );
            } catch {
                toast.error(t("postDetails.reactionSaveError"));
            }
        },
        [postId, t],
    );

    const handleLike = useCallback(() => setServerReaction("like"), [
        setServerReaction,
    ]);

    const handleDislike = useCallback(() => setServerReaction("dislike"), [
        setServerReaction,
    ]);

    const handleShare = useCallback(async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post?.title || t("postDetails.shareTitleFallback"),
                    text: post?.description || "",
                    url: postUrl,
                });
                return;
            }
            await navigator.clipboard.writeText(postUrl);
        } catch {
            // no-op
        }
    }, [post, postUrl, t]);

    const scrollToComments = useCallback(() => {
        commentsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, []);

    const handleAddComment = useCallback(
        async (event) => {
            event.preventDefault();
            const nextComment = commentText.trim();
            if (!nextComment) return;
            if (!auth) {
                toast.error(t("postDetails.loginToComment"));
                return;
            }
            try {
                const { data } = await api.post(
                    `/posts/${postId}/comments`,
                    { text: nextComment },
                );
                setComments((prev) => [
                    { ...data, reaction: null },
                    ...prev,
                ]);
                setCommentText("");
                setPost((p) =>
                    p ? { ...p, comments: (p.comments || 0) + 1 } : p,
                );
            } catch {
                toast.error(t("postDetails.commentError"));
            }
        },
        [auth, commentText, postId, t],
    );

    const handleCommentVote = useCallback(
        async (commentId, voteType) => {
            if (!auth) {
                toast.error(t("postDetails.loginToVote"));
                return;
            }
            const type = voteType === "upvote" ? "upvote" : "downvote";
            try {
                const { data } = await api.post(
                    `/posts/${postId}/comments/${commentId}/vote`,
                    { type },
                );
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment.id === commentId
                            ? {
                                  ...comment,
                                  upvotes: data.upvotes,
                                  downvotes: data.downvotes,
                              }
                            : comment,
                    ),
                );
            } catch {
                toast.error(t("postDetails.voteError"));
            }
        },
        [auth, postId, t],
    );

    const isOwnPost = Boolean(auth?.id) && auth.id === post?.authorId;
    const isAdmin = auth?.role === "admin";
    const breadcrumbHomePath = isAdmin ? "/admin/dashboard" : "/home";

    if (isLoading)
        return (
            <section className="PostDetails post-details-loading-state">
                <div className="post-details-loading-box" aria-live="polite">
                    <span
                        className="post-details-loading-spinner"
                        aria-hidden="true"
                    ></span>
                    <p className="post-details-loading-text mb-0">
                        {t("postDetails.loading")}
                    </p>
                </div>
            </section>
        );
    if (!post) {
        return (
            <section className="PostDetails">
                <NoPostsFoundMessage
                    title={t("emptyState.postNotFoundTitle")}
                    subtitle={t("emptyState.postNotFoundSubtitle")}
                    showCallToAction={false}
                />
            </section>
        );
    }

    return (
        <section className="PostDetails">
            <nav
                className="post-details-breadcrumb"
                aria-label={t("postDetails.breadcrumbAria")}
            >
                <Link to={breadcrumbHomePath} className="post-details-breadcrumb-link">
                    {isAdmin ? t("nav.dashboard") : t("nav.home")}
                </Link>
                <span className="post-details-breadcrumb-sep" aria-hidden="true">
                    /
                </span>
                <span className="post-details-breadcrumb-current">
                    {t("postDetails.breadcrumbCurrent")}
                </span>
            </nav>
            <article className="post-details-card">
                {post.image ? (
                    <div className="post-details-banner">
                        <img
                            className="post-details-image"
                            src={post.image}
                            alt={post.title || t("postDetails.postCoverAlt")}
                        />
                        <div className="post-details-banner-overlay"></div>
                        <div className="post-details-banner-copy">
                            <h1 className="post-details-title">{post.title}</h1>
                            <p className="post-details-description mb-0">
                                {post.description}
                            </p>
                        </div>
                        <div className="post-details-banner-actions">
                            <TooltipText
                                text={t("postDetails.favoriteTooltip")}
                                className="post-details-banner-tooltip"
                            >
                                <button
                                    type="button"
                                    className={`post-details-action-btn post-details-banner-btn ${isFavorite ? "active" : ""}`}
                                    onClick={() =>
                                        setIsFavorite((prev) => !prev)
                                    }
                                    aria-label={t(
                                        "postDetails.toggleFavoriteAria",
                                    )}
                                >
                                    <i
                                        className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-bookmark`}
                                    ></i>
                                </button>
                            </TooltipText>
                            <TooltipText
                                text={t("postDetails.shareTooltip")}
                                className="post-details-banner-tooltip"
                            >
                                <button
                                    type="button"
                                    className="post-details-action-btn post-details-banner-btn"
                                    onClick={handleShare}
                                    aria-label={t("postDetails.sharePostAria")}
                                >
                                    <i className="fa-solid fa-share"></i>
                                </button>
                            </TooltipText>
                            <TooltipText
                                text={t("postDetails.jumpDiscussionTooltip")}
                                className="post-details-banner-tooltip"
                            >
                                <button
                                    type="button"
                                    className="post-details-action-btn post-details-banner-btn comments-btn"
                                    onClick={scrollToComments}
                                    aria-label={t(
                                        "postDetails.goToCommentsAria",
                                    )}
                                >
                                    <i className="fa-regular fa-comments"></i>
                                </button>
                            </TooltipText>
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
                                <span className="d-inline-flex align-items-center gap-2">
                                    <i className="fa-regular fa-calendar"></i>
                                    {formatDate(post.date)}
                                </span>
                                <span className="text-capitalize d-inline-flex align-items-center gap-2">
                                    <i className="fa-solid fa-tag"></i>
                                    {post.category}
                                </span>
                                <span className="d-inline-flex align-items-center gap-2">
                                    <i className="fa-regular fa-clock"></i>
                                    {t("postDetails.minsRead", {
                                        count: readMins,
                                    })}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="post-details-actions">
                        <button
                            type="button"
                            className={`post-details-action-btn ${reaction === "like" ? "active" : ""}`}
                            onClick={isOwnPost ? undefined : handleLike}
                            disabled={isOwnPost}
                        >
                            <i className="fa-regular fa-thumbs-up"></i> {likes}
                        </button>
                        <button
                            type="button"
                            className={`post-details-action-btn ${reaction === "dislike" ? "active dislike" : ""}`}
                            onClick={isOwnPost ? undefined : handleDislike}
                            disabled={isOwnPost}
                        >
                            <i className="fa-regular fa-thumbs-down"></i>{" "}
                            {dislikes}
                        </button>
                    </div>

                    <p className="post-details-body">{post.content}</p>

                    <div
                        className="post-details-comments"
                        ref={commentsSectionRef}
                    >
                        <div className="post-details-discussion-head mb-3">
                            <h2 className="post-details-discussion-title">
                                {t("postDetails.discussionTitle")}
                            </h2>
                            <p className="post-details-discussion-subtitle mb-0">
                                {t("postDetails.discussionSubtitle")}
                            </p>
                            <span
                                className="post-details-discussion-dots"
                                aria-hidden
                            >
                                ...
                            </span>
                        </div>
                        <form
                            onSubmit={handleAddComment}
                            className="post-details-comment-form"
                        >
                            <div className="post-details-comment-author">
                                <Avatar
                                    username={commenterName}
                                    src={commenterPic}
                                    size={34}
                                />
                                <strong>{commenterName}</strong>
                            </div>
                            <textarea
                                value={commentText}
                                onChange={(event) =>
                                    setCommentText(event.target.value)
                                }
                                className="form-control"
                                rows={3}
                                placeholder={t(
                                    "postDetails.commentPlaceholder",
                                )}
                            />
                            <button type="submit" className="btn btn-dark">
                                {t("postDetails.addComment")}
                            </button>
                        </form>

                        <div className="post-details-comment-list">
                            {commentsLoading ? (
                                <p className="text-muted mb-0">
                                    {t("postDetails.loadingComments")}
                                </p>
                            ) : comments.length ? (
                                comments.map((comment) => (
                                    <article
                                        key={comment.id}
                                        className="post-details-comment-item"
                                    >
                                        <Avatar
                                            username={comment.name}
                                            src={comment.userPic}
                                            size={34}
                                        />
                                        <div>
                                            <strong>{comment.name}</strong>
                                            <p className="mb-0">
                                                {comment.text}
                                            </p>
                                            <div className="comment-votes mt-3">
                                                <button
                                                    type="button"
                                                    className={`comment-vote-btn ${comment.reaction === "upvote" ? "active" : ""}`}
                                                    onClick={() =>
                                                        handleCommentVote(
                                                            comment.id,
                                                            "upvote",
                                                        )
                                                    }
                                                >
                                                    <i className="fa-regular fa-thumbs-up"></i>
                                                    <span>
                                                        {comment.upvotes}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`comment-vote-btn ${comment.reaction === "downvote" ? "active dislike" : ""}`}
                                                    onClick={() =>
                                                        handleCommentVote(
                                                            comment.id,
                                                            "downvote",
                                                        )
                                                    }
                                                >
                                                    <i className="fa-regular fa-thumbs-down"></i>
                                                    <span>
                                                        {comment.downvotes}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="post-details-empty-comments">
                                    <i className="fa-regular fa-comments"></i>
                                    <p className="mb-0">
                                        {t("postDetails.noCommentsYet")}
                                    </p>
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
