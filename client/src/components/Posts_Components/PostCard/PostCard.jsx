import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PostCard.css";
import TooltipText from "../../common/TooltipText/TooltipText";
import formatDate from "../../../utils/functions/formatDate";
import truncateText from "../../../utils/functions/truncateText";
import LikeDislikeCounter from "../LikeDislikeCounter/LikeDislikeCounter";
import { toast } from "react-toastify";
import PostDetailsModal from "../PostDetailsModal/PostDetailsModal";

function PostCard({
    id,
    title,
    description,
    comments,
    author,
    authorId,
    date,
    image,
    category,
    likes: initialLikes = 0,
    dislikes: initialDislikes = 0,
    onEditPost,
    onDeletePost,
    actionInProgressId,
    currentUserId = "",
    recordView = false,
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [reaction, setReaction] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const isManaging = actionInProgressId === id;
    const isOwnPost = Boolean(currentUserId) && currentUserId === authorId;
    const showManageActions =
        typeof onEditPost === "function" || typeof onDeletePost === "function";
    const fallbackImage = "https://placehold.net/800x600.png";

    const handleImageError = useCallback((event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackImage;
    }, []);

    const handleLike = useCallback(() => {
        if (reaction === "like") {
            setLikes((prev) => Math.max(0, prev - 1));
            setReaction(null);
            return;
        }

        if (reaction === "dislike") {
            setDislikes((prev) => Math.max(0, prev - 1));
        }

        setLikes((prev) => prev + 1);
        setReaction("like");
    }, [reaction]);

    const handleDislike = useCallback(() => {
        if (reaction === "dislike") {
            setDislikes((prev) => Math.max(0, prev - 1));
            setReaction(null);
            return;
        }

        if (reaction === "like") {
            setLikes((prev) => Math.max(0, prev - 1));
        }

        setDislikes((prev) => prev + 1);
        setReaction("dislike");
    }, [reaction]);

    const handleShare = useCallback(async () => {
        const shareUrl = `${window.location.origin}/posts/${id}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title || t("postCard.shareTitleFallback"),
                    text: description || "",
                    url: shareUrl,
                });
                return;
            }
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            toast.error(t("postCard.shareError"));
        }
    }, [description, id, t, title]);

    return (
        <>
            <article className={`PostCard${recordView ? " PostCard--record" : ""}`}>
            {!recordView ? (
                <div className="post-actions">
                    <button
                        type="button"
                        className="post-action-btn"
                        aria-label={t("postCard.favoriteAria")}
                    >
                        <i className="fa-regular fa-bookmark"></i>
                    </button>
                    <button
                        type="button"
                        className="post-action-btn"
                        aria-label={t("postCard.shareAria")}
                        onClick={handleShare}
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            ) : null}

            {image && (
                <figure className="post-image mb-0">
                    <img
                        src={image}
                        alt={title || t("postCard.postCoverAlt")}
                        loading="lazy"
                        onError={handleImageError}
                    />
                    {category && (
                        <span className="post-image-category">
                            <i className="fa-solid fa-tag"></i>
                            <span className="post-image-category-text">
                                <span title={category}>
                                    {truncateText(category, 20)}
                                </span>
                            </span>
                        </span>
                    )}
                    {isOwnPost && !recordView ? (
                        <span className="post-owner-badge">
                            <i className="fa-solid fa-circle-user"></i>
                            {t("postCard.ownerPostBadge")}
                        </span>
                    ) : null}
                    {recordView ? (
                        <button
                            type="button"
                            className="post-action-btn post-share-btn"
                            aria-label={t("postCard.shareAria")}
                            onClick={handleShare}
                        >
                            <i className="fa-solid fa-share-nodes"></i>
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="post-action-btn post-link-btn"
                        aria-label={t("postCard.openPostAria")}
                        onClick={() => navigate(`/posts/${id}`)}
                    >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                </figure>
            )}

            <div className="post-content p-3 p-md-4">
                <header className="post-header">
                    {recordView ? (
                        <h3 className="post-title mb-2">{title}</h3>
                    ) : (
                        <TooltipText text={title}>
                            <h3 className="post-title mb-2">{title}</h3>
                        </TooltipText>
                    )}
                    <p className="post-description mb-0">{description}</p>
                </header>

                <footer className="post-footer mt-4">
                    {showManageActions ? (
                        <div className="post-manage-actions mb-3">
                            {recordView ? (
                                <button
                                    type="button"
                                    className="post-manage-btn icon-only"
                                    onClick={() => setDetailsOpen(true)}
                                    disabled={isManaging}
                                    aria-label={t("postCard.detailsAction")}
                                    title={t("postCard.detailsAction")}
                                >
                                    <i className="fa-regular fa-eye"></i>
                                </button>
                            ) : null}
                            {typeof onEditPost === "function" ? (
                                <button
                                    type="button"
                                    className={`post-manage-btn${recordView ? " icon-only" : ""}`}
                                    onClick={() => onEditPost(id)}
                                    disabled={isManaging}
                                    aria-label={t("postCard.editAction")}
                                    title={t("postCard.editAction")}
                                >
                                    <i className="fa-regular fa-pen-to-square"></i>
                                    {!recordView ? t("postCard.editAction") : null}
                                </button>
                            ) : null}
                            {typeof onDeletePost === "function" ? (
                                <button
                                    type="button"
                                    className={`post-manage-btn danger${recordView ? " icon-only" : ""}`}
                                    onClick={() => onDeletePost(id)}
                                    disabled={isManaging}
                                    aria-label={t("postCard.deleteAction")}
                                    title={t("postCard.deleteAction")}
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                    {!recordView ? t("postCard.deleteAction") : null}
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                    {recordView ? (
                        <div className="post-record-footer">
                            <div className="post-record-date">
                                <i className="fa-regular fa-calendar"></i>
                                <span>{formatDate(date)}</span>
                            </div>
                            <div className="post-record-metrics">
                                <span className="post-record-metric">
                                    <i className="fa-regular fa-thumbs-up"></i>
                                    <span>{likes}</span>
                                </span>
                                <span className="post-record-metric dislike">
                                    <i className="fa-regular fa-thumbs-down"></i>
                                    <span>{dislikes}</span>
                                </span>
                                <span
                                    className="post-record-metric"
                                    aria-label={t("postCard.commentsCountAria")}
                                >
                                    <i className="fa-regular fa-comment"></i>
                                    <span>{comments}</span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="post-meta d-flex align-items-center gap-3 flex-wrap">
                                <span className="meta-item gap-2">
                                    <i className="fa-regular fa-user"></i>
                                    <span className="meta-author-name" title={author}>
                                        <span className="meta-author-name__full">
                                            {author}
                                        </span>
                                        <span className="meta-author-name__trunc">
                                            {truncateText(author, 9)}
                                        </span>
                                    </span>
                                </span>
                                <span className="meta-item gap-2">
                                    <i className="fa-regular fa-calendar"></i>
                                    {formatDate(date)}
                                </span>
                            </div>

                            <div className="post-stats d-flex align-items-center justify-content-between gap-3 mt-3">
                                <LikeDislikeCounter
                                    likes={likes}
                                    dislikes={dislikes}
                                    reaction={reaction}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                    disabled={isOwnPost}
                                />
                                <span
                                    className="post-comments-stat"
                                    aria-label={t("postCard.commentsCountAria")}
                                >
                                    <i className="fa-regular fa-comment"></i>
                                    {comments}
                                </span>
                            </div>
                        </>
                    )}
                </footer>
            </div>
            </article>
            {recordView ? (
                <PostDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    postId={id}
                />
            ) : null}
        </>
    );
}

export default memo(PostCard);
