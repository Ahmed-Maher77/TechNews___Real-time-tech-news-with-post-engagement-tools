import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./DeletePostModal.css";

export default function DeletePostModal({
    open,
    post,
    submitting = false,
    onClose,
    onConfirm,
}) {
    const { t } = useTranslation();

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, submitting]);

    if (!open || !post) return null;

    return (
        <div
            className="delete-post-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) onClose?.();
            }}
        >
            <div className="delete-post-modal" role="dialog" aria-modal="true">
                <div className="delete-post-modal-header">
                    <div className="delete-post-modal-icon" aria-hidden="true">
                        <i className="fa-regular fa-trash-can"></i>
                    </div>
                    <div>
                        <h3 className="delete-post-modal-title mb-1">
                            {t("myPosts.deleteModalTitle")}
                        </h3>
                        <p className="delete-post-modal-subtitle mb-0">
                            {t("myPosts.deleteModalSubtitle")}
                        </p>
                    </div>
                </div>
                <div className="delete-post-modal-body">
                    <p className="delete-post-modal-post-label mb-1">
                        {t("myPosts.deleteModalPostLabel")}
                    </p>
                    <p className="delete-post-modal-post-title mb-0">{post.title}</p>
                </div>
                <div className="delete-post-modal-actions">
                    <button
                        type="button"
                        className="delete-post-action-btn delete-post-action-btn--ghost"
                        onClick={() => onClose?.()}
                        disabled={submitting}
                    >
                        {t("myPosts.deleteCancel")}
                    </button>
                    <button
                        type="button"
                        className="delete-post-action-btn delete-post-action-btn--danger"
                        onClick={() => onConfirm?.(post.id)}
                        disabled={submitting}
                    >
                        {submitting ? t("myPosts.deleteDeleting") : t("myPosts.deleteConfirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
