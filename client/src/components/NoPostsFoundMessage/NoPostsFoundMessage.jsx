import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MainButton from "../common/MainButton/MainButton";
import "./NoPostsFoundMessage.css";

function NoPostsFoundMessage({
    title,
    subtitle,
    buttonLabel,
    onButtonClick,
    showCallToAction = true,
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleButtonClick = useCallback(() => {
        if (typeof onButtonClick === "function") {
            onButtonClick();
            return;
        }
        navigate("/create-post");
    }, [navigate, onButtonClick]);

    return (
        <section className="NoPostsFoundMessage text-center" aria-live="polite">
            <div className="empty-state-icon">
                <i className="fa-regular fa-newspaper"></i>
            </div>
            <h3 className="empty-state-title mb-2">
                {title ?? t("emptyState.noPostsTitle")}
            </h3>
            <p className="empty-state-subtitle mb-4">
                {subtitle ?? t("emptyState.noPostsSubtitle")}
            </p>
            {showCallToAction ? (
                <MainButton
                    type="button"
                    className="empty-state-cta-btn px-4"
                    onClick={handleButtonClick}
                >
                    {buttonLabel ?? t("emptyState.createFirstPost")}
                </MainButton>
            ) : null}
        </section>
    );
}

export default memo(NoPostsFoundMessage);
