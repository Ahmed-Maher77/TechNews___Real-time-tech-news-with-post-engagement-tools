import { useRef } from "react";
import "./CreatePostForm.css";

const CreatePostForm = () => {
    const fileInputRef = useRef(null);
    const handleImageClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    return (
        <form
            className="create-post-form w-100 p-4 rounded mx-auto"
            style={{ maxWidth: 600 }}
        >
            <h3 className="form-title mb-4">Create New Post</h3>

            {/* Post Image */}
            <div className="form-image mb-4 text-center">
                <div
                    className="image-upload-placeholder mb-2 mx-auto"
                    onClick={handleImageClick}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload post image"
                >
                    <i className="fa-regular fa-image fa-3x text-secondary"></i>
                </div>
                <input
                    type="file"
                    id="postImage"
                    className="form-control visually-hidden"
                    ref={fileInputRef}
                    tabIndex={-1}
                />
                <label htmlFor="postImage" className="d-block mb-2 fw-semibold">
                    Post Image <span className="text-danger">*</span>
                </label>
            </div>

            {/* Title */}
            <div className="mb-3">
                <label htmlFor="title" className="form-label fw-semibold">
                    Title <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control app-form-control"
                    id="title"
                    placeholder="Enter post title"
                    required
                />
            </div>

            {/* Content */}
            <div className="mb-3">
                <label htmlFor="content" className="form-label fw-semibold">
                    Content <span className="text-danger">*</span>
                </label>
                <textarea
                    className="form-control app-form-control"
                    id="content"
                    rows={5}
                    placeholder="Write your post..."
                    required
                ></textarea>
            </div>

            {/* Tags */}
            <div className="mb-3">
                <label htmlFor="tags" className="form-label fw-semibold">
                    Tags
                </label>
                <input
                    type="text"
                    className="form-control app-form-control"
                    id="tags"
                    placeholder="e.g. tech, news, ai"
                />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn create-post-btn w-100 mt-3">
                Create Post
            </button>
        </form>
    );
};

export default CreatePostForm;
