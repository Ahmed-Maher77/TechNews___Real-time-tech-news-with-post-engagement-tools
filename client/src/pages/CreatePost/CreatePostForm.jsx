import api from "../../utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./CreatePostForm.css";
import MainButton from "../../components/common/MainButton/MainButton";
import {
    CATEGORY_MIN_LENGTH,
    CONTENT_MIN_LENGTH,
    createPostDefaultValues,
    createPostSchema,
    DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH,
    TITLE_MIN_LENGTH,
} from "../../validations/createPostValidation";

function translateCreatePostFieldError(t, error) {
    if (!error?.message) return "";
    const key = error.message;
    const countByKey = {
        "validation.titleMin": TITLE_MIN_LENGTH,
        "validation.categoryMin": CATEGORY_MIN_LENGTH,
        "validation.contentMin": CONTENT_MIN_LENGTH,
        "validation.descriptionMin": DESCRIPTION_MIN_LENGTH,
        "validation.descriptionMax": DESCRIPTION_MAX_LENGTH,
    };
    const count = countByKey[key];
    return count !== undefined ? t(key, { count }) : t(key);
}

const CreatePostForm = () => {
    const { t } = useTranslation();
    const [coverInputMode, setCoverInputMode] = useState("url");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageFileError, setImageFileError] = useState("");
    const imageFileInputRef = useRef(null);
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createPostSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: createPostDefaultValues(),
    });
    const descriptionValue =
        useWatch({
            control,
            name: "description",
        }) || "";

    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setImageFile(null);
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview("");
            setImageFileError("");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setImageFileError("auth.imageInvalid");
            setImageFile(null);
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview("");
            event.target.value = "";
            return;
        }
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageFileError("");
    };

    const clearSelectedImage = () => {
        setImageFile(null);
        setImageFileError("");
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview("");
        if (imageFileInputRef.current) {
            imageFileInputRef.current.value = "";
        }
    };

    const onSubmit = async (formData) => {
        const url = formData.imageUrl?.trim() || "";
        const usingUrl = coverInputMode === "url";

        if (usingUrl && !url) {
            toast.error(t("createPost.imageRequired"));
            return;
        }
        if (!usingUrl && !imageFile) {
            toast.error(t("createPost.imageRequired"));
            return;
        }

        try {
            const fd = new FormData();
            fd.append("title", formData.title.trim());
            fd.append("category", formData.category.trim());
            fd.append("description", formData.description.trim());
            fd.append("content", formData.content.trim());
            if (!usingUrl && imageFile) {
                fd.append("imageFile", imageFile);
            } else {
                fd.append("image", url);
            }

            const { data: createdPost } = await api.post("/posts", fd);

            try {
                window.dispatchEvent(
                    new CustomEvent("postCreated", { detail: createdPost }),
                );
            } catch {
                // ignore
            }

            toast.success(t("createPost.success"));
            reset(createPostDefaultValues());
            setCoverInputMode("url");
            clearSelectedImage();
        } catch (error) {
            const serverMessage = error?.response?.data?.message;
            toast.error(
                serverMessage && typeof serverMessage === "string"
                    ? t(serverMessage)
                    : t("createPost.error"),
            );
        }
    };

    const requiredMark = <span className="text-danger">*</span>;

    return (
        <form
            className="create-post-form w-100 p-4 rounded mx-auto"
            style={{ maxWidth: 650 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <fieldset className="create-post-fieldset" disabled={isSubmitting}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold">
                        {t("createPost.fieldTitle")} {requiredMark}
                    </label>
                    <input
                        type="text"
                        className={`form-control app-form-control ${errors.title ? "is-invalid" : ""}`}
                        id="title"
                        placeholder={t("createPost.placeholderTitle")}
                        minLength={TITLE_MIN_LENGTH}
                        {...register("title")}
                    />
                    {errors.title ? (
                        <div className="app-field-error">
                            {translateCreatePostFieldError(t, errors.title)}
                        </div>
                    ) : null}
                </div>

                <div className="mb-3">
                    <label
                        htmlFor="category"
                        className="form-label fw-semibold"
                    >
                        {t("createPost.fieldCategory")} {requiredMark}
                    </label>
                    <input
                        type="text"
                        className={`form-control app-form-control ${errors.category ? "is-invalid" : ""}`}
                        id="category"
                        placeholder={t("createPost.placeholderCategory")}
                        minLength={CATEGORY_MIN_LENGTH}
                        {...register("category")}
                    />
                    {errors.category ? (
                        <div className="app-field-error">
                            {translateCreatePostFieldError(t, errors.category)}
                        </div>
                    ) : null}
                </div>

                <div className="mb-3">
                    <label
                        htmlFor="imageUrl"
                        className="form-label fw-semibold"
                    >
                        {t("createPost.fieldImage")} {requiredMark}
                    </label>
                    <div className="create-post-image-tabs mb-2" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={coverInputMode === "url"}
                            className={`create-post-image-tab ${coverInputMode === "url" ? "active" : ""}`}
                            onClick={() => setCoverInputMode("url")}
                        >
                            {t("createPost.imageTabUrl")}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={coverInputMode === "file"}
                            className={`create-post-image-tab ${coverInputMode === "file" ? "active" : ""}`}
                            onClick={() => setCoverInputMode("file")}
                        >
                            {t("createPost.imageTabFile")}
                        </button>
                    </div>
                    {coverInputMode === "url" ? (
                        <>
                            <input
                                type="url"
                                className={`form-control app-form-control ${errors.imageUrl ? "is-invalid" : ""}`}
                                id="imageUrl"
                                placeholder={t("createPost.placeholderImage")}
                                {...register("imageUrl")}
                            />
                            {errors.imageUrl ? (
                                <div className="app-field-error">
                                    {translateCreatePostFieldError(
                                        t,
                                        errors.imageUrl,
                                    )}
                                </div>
                            ) : null}
                            <p className="form-text mb-2">
                                {t("createPost.imageUrlHint")}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="form-text mb-2">
                                {t("createPost.imageFileHint")}
                            </p>
                            <input
                                type="file"
                                id="post-image-file"
                                className="create-post-file-input"
                                accept="image/*"
                                ref={imageFileInputRef}
                                onChange={handleImageFileChange}
                            />
                            <label
                                htmlFor="post-image-file"
                                className="create-post-upload-card"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt={t("createPost.fieldImage")}
                                        className="create-post-upload-preview"
                                    />
                                ) : (
                                    <span
                                        className="create-post-upload-placeholder"
                                        aria-hidden
                                    >
                                        <i className="fa-regular fa-image" />
                                    </span>
                                )}
                            </label>
                            <div className="create-post-upload-actions">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                        imageFileInputRef.current?.click()
                                    }
                                >
                                    {imageFile
                                        ? t("createPost.changeUploadedImage")
                                        : t("createPost.chooseImageFromDevice")}
                                </button>
                                {imageFile ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={clearSelectedImage}
                                    >
                                        {t("createPost.removeImage")}
                                    </button>
                                ) : null}
                            </div>
                            {imageFileError ? (
                                <div className="app-field-error">
                                    {t(imageFileError)}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="mb-3">
                    <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                    >
                        {t("createPost.fieldDescription")} {requiredMark}
                    </label>
                    <textarea
                        className={`form-control app-form-control ${errors.description ? "is-invalid" : ""}`}
                        id="description"
                        rows={3}
                        placeholder={t("createPost.placeholderDescription")}
                        minLength={DESCRIPTION_MIN_LENGTH}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        {...register("description")}
                    ></textarea>
                    <div className="app-field-counter">
                        {descriptionValue.length}/{DESCRIPTION_MAX_LENGTH}
                    </div>
                    {errors.description ? (
                        <div className="app-field-error">
                            {translateCreatePostFieldError(
                                t,
                                errors.description,
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="mb-3">
                    <label htmlFor="content" className="form-label fw-semibold">
                        {t("createPost.fieldContent")} {requiredMark}
                    </label>
                    <textarea
                        className={`form-control app-form-control ${errors.content ? "is-invalid" : ""}`}
                        id="content"
                        rows={5}
                        placeholder={t("createPost.placeholderContent")}
                        minLength={CONTENT_MIN_LENGTH}
                        {...register("content")}
                    ></textarea>
                    {errors.content ? (
                        <div className="app-field-error">
                            {translateCreatePostFieldError(t, errors.content)}
                        </div>
                    ) : null}
                </div>

                <MainButton
                    type="submit"
                    className="create-post-btn mt-3"
                    fullWidth
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? t("createPost.submitting")
                        : t("createPost.submit")}
                </MainButton>
            </fieldset>
        </form>
    );
};

export default CreatePostForm;
