import { Component } from "react";
import "./FeaturedPost.css";
import formatDate from "../../../utils/functions/formatDate";

class FeaturedPost extends Component {
    render() {
        const { post } = this.props;
        if (!post) return null;

        return (
            <section className="FeaturedPost mb-4">
                <article className="featured-post-layout">
                    <div className="featured-post-content">
                        <p className="featured-post-label mb-3">
                            <i className="fa-solid fa-arrow-trend-up me-2"></i>
                            FEATURED TODAY
                        </p>

                        <div className="featured-post-meta mb-3">
                            <i className="fa-regular fa-user"></i>
                            <span>{post.author}</span>
                            <i className="fa-regular fa-calendar"></i>
                            <span>{formatDate(post.date)}</span>
                        </div>

                        <h2 className="featured-post-title mb-3">{post.title}</h2>
                        <p className="featured-post-description mb-4">{post.description}</p>

                        <div className="featured-post-footer">
                            <span className="topic-pill">{post.category || "Technology"}</span>
                            <span className="read-time">{Math.max(4, Math.ceil((post.views || 800) / 250))} min read</span>
                        </div>
                    </div>

                    <div className="featured-post-image-box">
                        <img src={post.image} alt={post.title || "Featured post"} loading="lazy" />
                    </div>
                </article>
            </section>
        );
    }
}

export default FeaturedPost;
