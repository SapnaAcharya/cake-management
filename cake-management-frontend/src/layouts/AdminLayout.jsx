import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  CakeSlice,
  Tags,
  ShoppingBag,
  Users,
  LogOut,
  ChevronDown,
  ExternalLink,
  Cake,
  Menu,
  X,
  Sparkles,
  LayoutTemplate
} from "lucide-react";
import "../styles/AdminLayout.css";

const navItems = [
  { label: "Dashboard", to: "/admin/", icon: LayoutDashboard },
  { label: "Cakes", to: "/admin/cakes", icon: CakeSlice },
  { label: "Templates", to: "/admin/templates", icon: LayoutTemplate },
  { label: "Decorations", to: "/admin/decorations", icon: Sparkles },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Users", to: "/admin/users", icon: Users },
];

function AdminLayout({ children, title, subtitle, headerAction }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="admin-shell">
      {/* Overlay — click to close sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-brand-icon">
            <Cake size={22} className="navbar-brand-icon" />
          </span>
          <span>Cake Management</span>

          {/* Close button, mobile only */}
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            // const isActive = location.pathname === item.to;
            const isActive = item.to === "/admin/"
                 ? location.pathname === "/admin" || location.pathname === "/admin/"
                 : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item view-store-link"
          >
            <ExternalLink size={17} />
            <span>View store</span>
          </a>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="admin-user-wrapper">
            <div
              className="admin-user"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <div className="admin-avatar" />
              <span>Admin</span>
              <ChevronDown size={15} />
            </div>

            {menuOpen && (
              <div className="admin-user-menu">
                <Link
                  to="/profile"
                  className="admin-user-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button className="admin-user-menu-item" onClick={handleLogout}>
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-header">
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {headerAction}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;