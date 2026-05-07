import CreatePostForm from "./CreatePostForm";

function CreatePost() {
    return (
        <section className="CreatePost w-100 py-4 py-lg-5">
            <div className="create-post-shell mx-auto">
                <header className="create-post-shell__header mb-4 mb-lg-5">
                    <p className="create-post-shell__eyebrow mb-2">Publish</p>
                    <h1 className="create-post-shell__title mb-2">
                        Create a new post
                    </h1>
                    <p className="create-post-shell__subtitle mb-0">
                        Share a clear, valuable update with your audience.
                    </p>
                </header>
                <CreatePostForm />
            </div>
        </section>
    );
}

export default CreatePost;