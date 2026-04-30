import { Component } from "react";
import "./FeaturedPost.css";
import formatDate from "../../../utils/functions/formatDate";

class FeaturedPost extends Component {
    state = {
        activeIndex: 0,
    };

    componentDidMount() {
        this.startAutoSlide();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.posts !== this.props.posts) {
            this.setState({ activeIndex: 0 });
            this.stopAutoSlide();
            this.startAutoSlide();
        }
    }

    componentWillUnmount() {
        this.stopAutoSlide();
    }

    startAutoSlide = () => {
        const totalPosts = Math.min(this.props.posts?.length || 0, 3);
        if (totalPosts <= 1) return;

        this.autoSlideInterval = setInterval(() => {
            this.setState((prev) => ({
                activeIndex: (prev.activeIndex + 1) % totalPosts,
            }));
        }, 5000);
    };

    stopAutoSlide = () => {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    };

    setActiveIndex = (index) => {
        this.stopAutoSlide();
        this.setState({ activeIndex: index });
        this.startAutoSlide();
    };

    render() {
        const { posts = [] } = this.props;
        const sliderPosts = posts.slice(0, 3);
        const { activeIndex } = this.state;
        if (!sliderPosts.length) return null;

        return (
            <section className="FeaturedPost mb-4">
                <article className="featured-slider">
                    {sliderPosts.map((post, index) => (
                        <div
                            key={post.id}
                            className={`featured-slide ${index === activeIndex ? "active" : ""}`}
                            aria-hidden={index !== activeIndex}
                        >
                            <img
                                src={post.image}
                                alt={post.title || "Featured post"}
                                loading="eager"
                            />
                            <div className="featured-overlay"></div>

                            <div className="featured-content">
                                <p className="featured-label mb-3">
                                    <i className="fa-solid fa-arrow-trend-up me-2"></i>
                                    FEATURED TODAY
                                </p>

                                <h2 className="featured-title mb-2">
                                    {post.title}
                                </h2>
                                <p className="featured-description mb-0">
                                    {post.description}
                                </p>
                            </div>

                            <div className="featured-meta">
                                <span className="featured-author">
                                    <i className="fa-regular fa-user me-2"></i>
                                    {post.author}
                                </span>
                                <span>
                                    {formatDate(post.date)} -{" "}
                                    {Math.max(
                                        4,
                                        Math.ceil((post.views || 800) / 250),
                                    )}{" "}
                                    mins read
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="featured-pagination">
                        {sliderPosts.map((post, index) => (
                            <button
                                key={post.id}
                                type="button"
                                className={`featured-dot ${index === activeIndex ? "active" : ""}`}
                                aria-label={`Show featured post ${index + 1}`}
                                onClick={() => this.setActiveIndex(index)}
                            ></button>
                        ))}
                    </div>
                </article>
            </section>
        );
    }
}

export default FeaturedPost;
