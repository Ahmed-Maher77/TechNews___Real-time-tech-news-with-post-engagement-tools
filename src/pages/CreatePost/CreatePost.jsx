import { Component } from "react";
import CreatePostForm from "./CreatePostForm";

class CreatePost extends Component {
    render() {
        return (
            <div className="CreatePost d-flex justify-content-center align-items-start pt-4 w-100">
                <CreatePostForm />
            </div>
        );
    }
}

export default CreatePost;