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
  LayoutTemplate,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import useProfilePhoto from "../hooks/useProfilePhoto";
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

const trainingNavItems = [
  {
    label: "Training Packages",
    to: "/admin/training-packages",
    icon: BookOpen,
  },
  {
    label: "Trainers",
    to: "/admin/trainers",
    icon: Users,
  },
  {
    label: "Training Batches",
    to: "/admin/training-batches",
    icon: CalendarDays,
  },
  {
    label: "Enrollments",
    to: "/admin/training-enrollments",
    icon: ClipboardCheck,
  },
];

function AdminLayout({ children, title, subtitle, headerAction }) {
  const location = useLocation();
  const profilePhoto = useProfilePhoto();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);

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
          {/* <span className="admin-brand-icon">
            <Cake size={22} className="navbar-brand-icon" />
          </span>
          <span>Cake Management</span> */}
          <Link to="/admin/" className="admin-brand-link">
  <Cake size={22} className="admin-brand-cake" aria-hidden="true" />
  <span className="admin-brand-name">Sweet Cakes</span>
</Link>

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
  
<div className="admin-nav-group">
  <button
    type="button"
    className={`admin-nav-item admin-nav-toggle ${
      location.pathname.startsWith("/admin/training")
        ? "active"
        : ""
    }`}
    onClick={() => setTrainingOpen((open) => !open)}
    aria-expanded={trainingOpen}
  >
    <GraduationCap size={17} />
    <span>Training </span>
    <ChevronDown
      size={15}
      className={`admin-nav-chevron ${
        trainingOpen ? "rotated" : ""
      }`}
    />
  </button>

  {trainingOpen && (
    <div className="admin-subnav">
      {trainingNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`admin-nav-item admin-subnav-item ${
              isActive ? "active" : ""
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  )}
</div>


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
              {/* <div className="admin-avatar" /> */}
              <div className="admin-avatar">
  {profilePhoto ? (
    <img src={profilePhoto} alt="Admin profile" />
  ) : (
    <span aria-hidden="true">A</span>
  )}
</div>
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