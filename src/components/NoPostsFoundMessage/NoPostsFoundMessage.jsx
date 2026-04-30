import { Component } from "react";
import "./NoPostsFoundMessage.css";

class NoPostsFoundMessage extends Component {
    render() {

        return (
            <section className="NoPostsFoundMessage text-center" aria-live="polite">
                <div className="empty-state-icon">
                    <i className="fa-regular fa-newspaper"></i>
                </div>
                <h3 className="empty-state-title mb-2">No posts yet</h3>
                <p className="empty-state-subtitle mb-4">
                    Your feed is empty right now. Create your first post to get things started.
                </p>
                <button
                    type="button"
                    className="btn btn-primary px-4"
                >
                    Create your first post
                </button>
            </section>
        );
    }
}

export default NoPostsFoundMessage;