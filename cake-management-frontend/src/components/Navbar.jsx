import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, LayoutDashboard, User, X, Cake } from "lucide-react"; 
import "../styles/Navbar.css";

function Navbar({ cartCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role === "Admin";

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/?search=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Cakes", to: "/cakes" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Cake size={22} className="navbar-brand-icon" />
          <span className="navbar-brand-name">Sweet Cakes</span>
        </Link>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${
                location.pathname === link.to ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

          <div className="navbar-actions">
          {searchOpen ? (
            <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                autoFocus
                className="navbar-search-input"
                placeholder="Search cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="navbar-icon-btn"
                aria-label="Close search"
                onClick={handleSearchToggle}
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <button
              className="navbar-icon-btn"
              aria-label="Search"
              onClick={handleSearchToggle}
            >
              <Search size={18} />
            </button>
          )}

          <Link to="/cart" className="navbar-icon-btn navbar-cart">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
          </Link>

          {isAdmin && (
            <Link to="/admin/cakes" className="navbar-admin-link">
              <LayoutDashboard size={16} />
              Admin
            </Link>
          )}

          {/* 2. Update Auth Actions Section */}
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="navbar-icon-btn" title="My Profile">
                <User size={18} />
              </Link>
              <button className="navbar-login" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login">
                Login
              </Link>
              <Link to="/register" className="navbar-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;