import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
    return (
        <section className="not-found-page">
            <div className="not-found-card">
                <p className="not-found-code mb-2">404</p>
                <h1 className="not-found-title mb-2">Page not found</h1>
                <p className="not-found-text mb-4">
                    The page you are looking for does not exist or may have been
                    moved.
                </p>

                <div className="not-found-actions">
                    <Link to="/home" className="not-found-link primary">
                        <i className="fa-solid fa-house me-2"></i>
                        Go to Home
                    </Link>
                    <Link to="/explore" className="not-found-link">
                        <i className="fa-solid fa-compass me-2"></i>
                        Explore Posts
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default NotFoundPage;
