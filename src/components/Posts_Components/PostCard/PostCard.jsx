import { Component } from "react";
import "./PostCard.css";
import TooltipText from "../../common/TooltipText/TooltipText";
import formatDate from "../../../utils/functions/formatDate";
import LikeDislikeCounter from "../LikeDislikeCounter/LikeDislikeCounter";

class PostCard extends Component {
    state = {
        likes: this.props.likes || 0,
        dislikes: this.props.dislikes || 0,
        reaction: null,
    };

    fallbackImage = "https://placehold.net/800x600.png";

    handleImageError = (event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = this.fallbackImage;
    };

    handleLike = () => {
        const { reaction } = this.state;
        if (reaction === "like") {
            this.setState((prev) => ({
                likes: Math.max(0, prev.likes - 1),
                reaction: null,
            }));
            return;
        }

        if (reaction === "dislike") {
            this.setState((prev) => ({
                dislikes: Math.max(0, prev.dislikes - 1),
            }));
        }

        this.setState((prev) => ({
            likes: prev.likes + 1,
            reaction: "like",
        }));
    };

    handleDislike = () => {
        const { reaction } = this.state;
        if (reaction === "dislike") {
            this.setState((prev) => ({
                dislikes: Math.max(0, prev.dislikes - 1),
                reaction: null,
            }));
            return;
        }

        if (reaction === "like") {
            this.setState((prev) => ({
                likes: Math.max(0, prev.likes - 1),
            }));
        }

        this.setState((prev) => ({
            dislikes: prev.dislikes + 1,
            reaction: "dislike",
        }));
    };

    render() {
        const { id, title, description, comments, author, date, image } =
            this.props;
        const { likes, dislikes, reaction } = this.state;

        return (
            <article className="PostCard">
                <div className="post-actions">
                    <button
                        type="button"
                        className="post-action-btn"
                        aria-label="Add to favourites"
                    >
                        <i className="fa-regular fa-bookmark"></i>
                    </button>
                    <button
                        type="button"
                        className="post-action-btn"
                        aria-label="Share post"
                    >
                        <i className="fa-solid fa-share-nodes"></i>
                    </button>
                </div>

                {image && (
                    <figure className="post-image mb-0">
                        <img
                            src={image}
                            alt={title || "Post cover"}
                            loading="lazy"
                            onError={this.handleImageError}
                        />
                        <button
                            type="button"
                            className="post-action-btn post-link-btn"
                            aria-label="Open post link"
                            onClick={() => console.log(id)}
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                    </figure>
                )}

                <div className="post-content p-3 p-md-4">
                    <header className="post-header">
                        <TooltipText text={title}>
                            <h3 className="post-title mb-2">{title}</h3>
                        </TooltipText>
                        <p className="post-description mb-0">{description}</p>
                    </header>

                    <footer className="post-footer mt-4">
                        <div className="post-meta d-flex align-items-center gap-3 flex-wrap">
                            <span className="meta-item">
                                <i className="fa-regular fa-user me-2"></i>
                                {author}
                            </span>
                            <span className="meta-item">
                                <i className="fa-regular fa-calendar me-2"></i>
                                {formatDate(date)}
                            </span>
                        </div>

                        <div className="post-stats d-flex align-items-center justify-content-between gap-3 mt-3">
                            <LikeDislikeCounter
                                likes={likes}
                                dislikes={dislikes}
                                reaction={reaction}
                                onLike={this.handleLike}
                                onDislike={this.handleDislike}
                            />
                            <span className="post-comments-stat" aria-label="Comments count">
                                <i className="fa-regular fa-comment"></i>
                                {comments}
                            </span>
                        </div>
                    </footer>
                </div>
            </article>
        );
    }
}

export default PostCard;
