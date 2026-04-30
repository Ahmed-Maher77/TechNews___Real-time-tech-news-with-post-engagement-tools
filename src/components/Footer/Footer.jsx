import Logo from "../NavigationBars/Logo";
import "./Footer.css";
import MainButton from "../common/MainButton/MainButton";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="AppFooter mt-5 pt-4">
            <div className="footer-main">
                <div className="footer-column">
                    <div className="footer-logo-wrap">
                        <Logo />
                    </div>
                    <p className="footer-description">
                        TechNews delivers concise, high-quality technology stories and trends to keep
                        you informed every day.
                    </p>
                    <nav className="footer-links" aria-label="Footer links">
                        <a href="/">Home</a>
                        <a href="/explore">Explore</a>
                        <a href="/my-posts">My Posts</a>
                    </nav>
                </div>

                <div className="footer-column footer-newsletter">
                    <h3 className="">Newsletter</h3>
                    <p>Get weekly updates on top stories and product news.</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Enter your email" />
                        <MainButton type="submit" className="footer-subscribe-btn">
                            Subscribe
                        </MainButton>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">© {currentYear} All Rights Reserved</div>
        </footer>
    );
};

export default Footer;
