import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../utils/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Avatar from "../../common/Avatar/Avatar";
import "./PostDetailsModal.css";

function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function PostDetailsModal({ open, onClose, postId }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [reactions, setReactions] = useState({
        likedBy: [],
        dislikedBy: [],
        likes: 0,
        dislikes: 0,
    });

    const [error, setError] = useState(false);

    const fetchAll = useCallback(async () => {
        if (!open || !postId) return;
        setLoading(true);
        setError(false);
        try {
            const [postRes, commentsRes, reactionsRes] = await Promise.all([
                api.get(`/posts/${postId}`),
                api.get(`/posts/${postId}/comments`),
                api.get(`/posts/${postId}/reactions/users`),
            ]);

            setPost(postRes.data);
            setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
            setReactions({
                likedBy: reactionsRes.data?.likedBy || [],
                dislikedBy: reactionsRes.data?.dislikedBy || [],
                likes: reactionsRes.data?.likes || 0,
                dislikes: reactionsRes.data?.dislikes || 0,
            });
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [open, postId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const publishedLabel = useMemo(() => {
        const publishedAt = post?.publishedAt || post?.createdAt || "";
        return formatDateTime(publishedAt);
    }, [post]);

    if (!open) return null;

    return (
        <div
            className="post-details-modal-overlay"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                // Close only when clicking the overlay (not inside modal).
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="post-details-modal">
                <div className="post-details-modal-header">
                    <div className="post-details-modal-header-main">
                        <h2 className="post-details-modal-title">
                            {post?.title || t("postDetails.loading")}
                        </h2>
                        {publishedLabel ? (
                            <div className="post-details-modal-subtitle">
                                <i className="fa-regular fa-clock"></i>{" "}
                                {publishedLabel}
                            </div>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="post-details-modal-close"
                        aria-label="Close"
                        onClick={() => onClose?.()}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {loading ? (
                    <div className="post-details-modal-body">
                        <p className="mb-0 text-muted">
                            {t("postDetails.loadingComments")}
                        </p>
                    </div>
                ) : error ? (
                    <div className="post-details-modal-body">
                        <p className="mb-0 text-danger">
                            {t("postDetails.reactionSaveError")}
                        </p>
                    </div>
                ) : (
                    <div className="post-details-modal-body">
                        <p className="post-details-modal-description mb-3">
                            {post?.description || ""}
                        </p>

                        <div className="post-details-modal-section">
                            <div className="post-details-modal-section-title">
                                <span className="post-details-modal-title-left">
                                    <i className="fa-regular fa-comments"></i>
                                    {t("postDetails.discussionTitle")}
                                </span>
                                <span className="post-details-modal-count-badge">
                                    {post?.comments || comments.length}
                                </span>
                            </div>
                            <div className="post-details-modal-users-list">
                                {comments.length ? (
                                    comments.map((c) => (
                                        <div
                                            key={c.id}
                                            className="post-details-user-card"
                                        >
                                            <Link
                                                className="post-details-user-link"
                                                to={`/profile/${c.userId}`}
                                            >
                                                <Avatar
                                                    username={c.name}
                                                    src={c.userPic}
                                                    size={28}
                                                />
                                                <span className="post-details-user-name">
                                                    {c.name}
                                                </span>
                                            </Link>
                                            <p className="post-details-comment-text mb-0">
                                                {c.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="mb-0 post-details-empty-note">
                                        {t("postDetails.noCommentsYet")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="post-details-modal-section">
                            <div className="post-details-modal-section-title">
                                <span className="post-details-modal-title-left">
                                    <i className="fa-regular fa-thumbs-up"></i>
                                    Likes
                                </span>
                                <span className="post-details-modal-count-badge">
                                    {reactions.likes}
                                </span>
                            </div>
                            <div className="post-details-modal-users-list">
                                {reactions.likedBy.length ? (
                                    reactions.likedBy.map((u) => (
                                        <Link
                                            key={u.id}
                                            className="post-details-user-pill"
                                            to={`/profile/${u.id}`}
                                        >
                                            <Avatar
                                                username={u.name}
                                                src={u.userPic}
                                                size={26}
                                            />
                                            <span>{u.name}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="mb-0 post-details-empty-note">
                                        No likes yet
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="post-details-modal-section">
                            <div className="post-details-modal-section-title danger">
                                <span className="post-details-modal-title-left">
                                    <i className="fa-regular fa-thumbs-down"></i>
                                    Dislikes
                                </span>
                                <span className="post-details-modal-count-badge">
                                    {reactions.dislikes}
                                </span>
                            </div>
                            <div className="post-details-modal-users-list">
                                {reactions.dislikedBy.length ? (
                                    reactions.dislikedBy.map((u) => (
                                        <Link
                                            key={u.id}
                                            className="post-details-user-pill dislike"
                                            to={`/profile/${u.id}`}
                                        >
                                            <Avatar
                                                username={u.name}
                                                src={u.userPic}
                                                size={26}
                                            />
                                            <span>{u.name}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="mb-0 post-details-empty-note">
                                        No dislikes yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

