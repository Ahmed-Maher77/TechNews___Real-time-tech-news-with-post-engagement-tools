import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./CreatePostForm.css";
import MainButton from "../../components/common/MainButton/MainButton";

const CreatePostForm = () => {
    const getInitialForm = () => ({
        title: "",
        author: "",
        category: "",
        date: new Date().toISOString().slice(0, 10),
        image: "",
        description: "",
        content: "",
        views: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
    });

    const [formData, setFormData] = useState(getInitialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { id, value, type } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post("http://localhost:3000/posts", formData);

            toast.success("Post created successfully.");
            setFormData(getInitialForm());
        } catch {
            toast.error("Unable to create post. Please check json-server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="create-post-form w-100 p-4 rounded mx-auto"
            style={{ maxWidth: 650 }}
            onSubmit={handleSubmit}
        >
            <h3 className="form-title mb-4">Create New Post</h3>
            <fieldset className="create-post-fieldset" disabled={isSubmitting}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control app-form-control"
                        id="title"
                        placeholder="Enter post title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="author-category-row mb-3">
                    <div className="author-category-field">
                        <label
                            htmlFor="author"
                            className="form-label fw-semibold"
                        >
                            Author <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control app-form-control"
                            id="author"
                            placeholder="Author name"
                            value={formData.author}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="author-category-field">
                        <label
                            htmlFor="category"
                            className="form-label fw-semibold"
                        >
                            Category <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control app-form-control"
                            id="category"
                            placeholder="e.g. React, AI"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="image" className="form-label fw-semibold">
                        Image URL <span className="text-danger">*</span>
                    </label>
                    <input
                        type="url"
                        className="form-control app-form-control"
                        id="image"
                        placeholder="/react-hooks.jpg or https://..."
                        value={formData.image}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                    >
                        Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className="form-control app-form-control"
                        id="description"
                        rows={3}
                        placeholder="Short post summary..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="content" className="form-label fw-semibold">
                        Content <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className="form-control app-form-control"
                        id="content"
                        rows={5}
                        placeholder="Full post content..."
                        value={formData.content}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <MainButton
                    type="submit"
                    className="create-post-btn mt-3"
                    fullWidth
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create Post"}
                </MainButton>
            </fieldset>
        </form>
    );
};

export default CreatePostForm;
