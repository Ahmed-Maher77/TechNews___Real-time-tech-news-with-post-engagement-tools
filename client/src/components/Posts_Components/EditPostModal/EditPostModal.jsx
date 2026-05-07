import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./EditPostModal.css";

export default function EditPostModal({
    open,
    post,
    submitting = false,
    onClose,
    onSubmit,
}) {
    const { t } = useTranslation();
    const imageFileInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [coverInputMode, setCoverInputMode] = useState("url");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageFileError, setImageFileError] = useState("");

    useEffect(() => {
        if (!open || !post) return;
        setTitle(post.title || "");
        setCategory(post.category || "");
        setDescription(post.description || "");
        setContent(post.content || "");
        setImageUrl(post.image || "");
        setCoverInputMode("url");
        setImageFile(null);
        setImageFileError("");
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview("");
        if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }, [open, post]);

    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, submitting]);

    const hasValidValues = useMemo(() => {
        if (!title.trim()) return false;
        if (!category.trim()) return false;
        if (!description.trim()) return false;
        if (!content.trim()) return false;
        if (coverInputMode === "url") return Boolean(imageUrl.trim());
        return Boolean(imageFile || imageUrl.trim());
    }, [category, content, coverInputMode, description, imageFile, imageUrl, title]);

    if (!open || !post) return null;

    const handleImageFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setImageFile(null);
            if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
            setImagePreview("");
            setImageFileError("");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setImageFileError("auth.imageInvalid");
            setImageFile(null);
            if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
            setImagePreview("");
            event.target.value = "";
            return;
        }
        if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageFileError("");
    };

    const clearSelectedImage = () => {
        setImageFile(null);
        setImageFileError("");
        if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImagePreview("");
        if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!hasValidValues || submitting) return;
        await onSubmit?.({
            id: post.id,
            title: title.trim(),
            category: category.trim(),
            description: description.trim(),
            content: content.trim(),
            coverInputMode,
            imageUrl: imageUrl.trim(),
            imageFile,
        });
    };

    return (
        <div
            className="edit-post-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !submitting) onClose?.();
            }}
        >
            <div className="edit-post-modal">
                <div className="edit-post-modal-header">
                    <h3 className="mb-0">{t("myPosts.editModalTitle")}</h3>
                    <button
                        type="button"
                        className="edit-post-modal-close"
                        aria-label={t("myPosts.editModalClose")}
                        onClick={() => onClose?.()}
                        disabled={submitting}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <form className="edit-post-modal-form" onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">{t("createPost.fieldTitle")}</label>
                        <input
                            type="text"
                            className="form-control app-form-control"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">{t("createPost.fieldCategory")}</label>
                        <input
                            type="text"
                            className="form-control app-form-control"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">{t("createPost.fieldImage")}</label>
                        <div className="create-post-image-tabs mb-2" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={coverInputMode === "url"}
                                className={`create-post-image-tab ${coverInputMode === "url" ? "active" : ""}`}
                                onClick={() => setCoverInputMode("url")}
                                disabled={submitting}
                            >
                                {t("createPost.imageTabUrl")}
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={coverInputMode === "file"}
                                className={`create-post-image-tab ${coverInputMode === "file" ? "active" : ""}`}
                                onClick={() => setCoverInputMode("file")}
                                disabled={submitting}
                            >
                                {t("createPost.imageTabFile")}
                            </button>
                        </div>
                        {coverInputMode === "url" ? (
                            <>
                                <input
                                    type="url"
                                    className="form-control app-form-control"
                                    value={imageUrl}
                                    onChange={(event) => setImageUrl(event.target.value)}
                                    placeholder={t("createPost.placeholderImage")}
                                    disabled={submitting}
                                />
                                <p className="form-text mb-0 mt-2">{t("createPost.imageUrlHint")}</p>
                            </>
                        ) : (
                            <>
                                <p className="form-text mb-2">{t("createPost.imageFileHint")}</p>
                                <input
                                    type="file"
                                    id="edit-post-image-file"
                                    className="create-post-file-input"
                                    accept="image/*"
                                    ref={imageFileInputRef}
                                    onChange={handleImageFileChange}
                                    disabled={submitting}
                                />
                                <label htmlFor="edit-post-image-file" className="create-post-upload-card">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt={t("createPost.fieldImage")}
                                            className="create-post-upload-preview"
                                        />
                                    ) : (
                                        <img
                                            src={post.image}
                                            alt={t("createPost.fieldImage")}
                                            className="create-post-upload-preview"
                                        />
                                    )}
                                </label>
                                <div className="create-post-upload-actions">
                                    <button
                                        type="button"
                                        className="edit-post-action-btn edit-post-action-btn--ghost edit-post-action-btn--sm"
                                        onClick={() => imageFileInputRef.current?.click()}
                                        disabled={submitting}
                                    >
                                        {imageFile
                                            ? t("createPost.changeUploadedImage")
                                            : t("createPost.chooseImageFromDevice")}
                                    </button>
                                    {imageFile ? (
                                        <button
                                            type="button"
                                            className="edit-post-action-btn edit-post-action-btn--danger edit-post-action-btn--sm"
                                            onClick={clearSelectedImage}
                                            disabled={submitting}
                                        >
                                            {t("createPost.removeImage")}
                                        </button>
                                    ) : null}
                                </div>
                                {imageFileError ? (
                                    <div className="app-field-error">{t(imageFileError)}</div>
                                ) : null}
                            </>
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            {t("createPost.fieldDescription")}
                        </label>
                        <textarea
                            rows={3}
                            className="form-control app-form-control"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-0">
                        <label className="form-label fw-semibold">{t("createPost.fieldContent")}</label>
                        <textarea
                            rows={5}
                            className="form-control app-form-control"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="edit-post-modal-actions mt-4">
                        <button
                            type="button"
                            className="edit-post-action-btn edit-post-action-btn--ghost"
                            onClick={() => onClose?.()}
                            disabled={submitting}
                        >
                            {t("myPosts.editCancel")}
                        </button>
                        <button
                            type="submit"
                            className="edit-post-action-btn edit-post-action-btn--primary"
                            disabled={!hasValidValues || submitting}
                        >
                            {submitting ? t("myPosts.editSaving") : t("myPosts.editSave")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
