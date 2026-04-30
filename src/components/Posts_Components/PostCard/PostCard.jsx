import { Component } from "react";
import "./PostCard.css";
import TooltipText from "../../common/TooltipText/TooltipText";
import formatDate from "../../../utils/functions/formatDate";

class PostCard extends Component {
    fallbackImage = "https://placehold.net/800x600.png";

    handleImageError = (event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = this.fallbackImage;
    };

    render() {
        const {
            title,
            description,
            likes,
            comments,
            author,
            date,
            image,
        } = this.props;

        return (
            <article className="PostCard">
                <div className="post-actions">
                    <button type="button" className="post-action-btn" aria-label="Add to favourites">
                        <i className="fa-regular fa-bookmark"></i>
                    </button>
                    <button type="button" className="post-action-btn" aria-label="Share post">
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

                        <div className="post-stats d-flex align-items-center gap-3 mt-3">
                            <span className="stat-pill">
                                <i className="fa-regular fa-heart me-2"></i>
                                {likes} likes
                            </span>
                            <span className="stat-pill">
                                <i className="fa-regular fa-comment me-2"></i>
                                {comments} comments
                            </span>
                        </div>
                    </footer>
                </div>
            </article>
        );
    }
}



export default PostCard;