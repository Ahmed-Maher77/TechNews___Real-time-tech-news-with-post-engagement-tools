import { useTranslation } from "react-i18next";
import "./LikeDislikeCounter.css";

const LikeDislikeCounter = ({
    likes,
    dislikes,
    reaction,
    onLike,
    onDislike,
    disabled = false,
}) => {
    const { t } = useTranslation();
    return (
        <div className="like-dislike-counter">
            <button
                type="button"
                className={`reaction-btn ${reaction === "like" ? "active" : ""}`}
                aria-label={t("postCard.likeAria")}
                onClick={onLike}
                disabled={disabled}
            >
                <i className="fa-regular fa-thumbs-up"></i>
                <span>{likes}</span>
            </button>

            <button
                type="button"
                className={`reaction-btn ${reaction === "dislike" ? "active dislike" : ""}`}
                aria-label={t("postCard.dislikeAria")}
                onClick={onDislike}
                disabled={disabled}
            >
                <i className="fa-regular fa-thumbs-down"></i>
                <span>{dislikes}</span>
            </button>
        </div>
    );
};

export default LikeDislikeCounter;
