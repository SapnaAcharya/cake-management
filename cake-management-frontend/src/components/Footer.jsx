import { Link } from "react-router-dom";
import { Cake, Copyright } from "lucide-react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-icon">
            <Cake size={22} className="navbar-brand-icon" />
          </span>
          <span>Cake Management</span>
        </div>

        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/cakes">Cakes</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="footer-socials">
          {/* swap for real icons/links later */}
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
        </div>

        <p className="footer-copy">
            <Copyright size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
           {new Date().getFullYear()} Cake Management. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;