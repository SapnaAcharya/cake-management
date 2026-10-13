import { Link } from "react-router-dom";
import { Cake } from "lucide-react";
import "../styles/Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Brand */}
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            <Cake size={22} className="site-footer__logo-icon" />
            <span>Sweet Cakes</span>
          </Link>
          <p>Freshly baked cakes, made for every celebration.</p>
        </div>

        {/* Links */}
        <nav className="site-footer__col" aria-label="Footer">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cakes">Cakes</Link></li>
            <li><Link to="/design-by-template">Design Your Cake</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        {/* Social: put your real page links here */}
        <div className="site-footer__col">
          <h4>Follow us</h4>
          <div className="site-footer__social">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© {year} Sweet Cakes. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
