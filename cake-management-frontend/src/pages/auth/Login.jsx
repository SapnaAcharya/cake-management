import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Cake } from "lucide-react";
import authService from "../../services/authService";
import "../../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepSignedIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {

    const data = await authService.login(
    formData.email,
    formData.password
);

console.log("LOGIN RESPONSE:", data);

const token = data.token;

// Support both possible backend response formats:
// 1. { user: { role: "Admin", ... } }
// 2. { role: "Admin", ... }
const user = data.user
    ? data.user
    : {
        id: data.id,
        name: data.name,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
    };

const role = user.role || data.role;

if (!token) {
    throw new Error("Token was not returned by the server.");
}

if (!role) {
    throw new Error("User role was not returned by the server.");
}

// Clear old login data before saving the new session
localStorage.removeItem("token");
localStorage.removeItem("role");
localStorage.removeItem("user");

sessionStorage.removeItem("token");
sessionStorage.removeItem("role");
sessionStorage.removeItem("user");

// Save according to Remember me
const storage = formData.keepSignedIn
    ? localStorage
    : sessionStorage;

storage.setItem("token", token);
storage.setItem("role", role);
storage.setItem("user", JSON.stringify(user));

// Redirect based on backend-provided role
if (role.toLowerCase() === "admin") {
    navigate("/admin");
} else if (role.toLowerCase() === "customer") {
    navigate("/");
} else {
    setServerError("Unknown user role.");
}
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <div className="auth-panel-header">
              <span className="auth-icon">
                <Cake size={22} className="nnavbar-brand-icon" />
              </span>
              <div className="auth-panel-brand">Cake Management</div>
              <h1 className="auth-title">Welcome Back!</h1>
              <p className="auth-subtitle">Login to your account to continue</p>
            </div>

            {serverError && <div className="auth-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className={`auth-input ${errors.email ? "input-error" : ""}`}>
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className={`auth-input ${errors.password ? "input-error" : ""}`}>
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="auth-row">
                <label className="check-row">
                  <input
                    type="checkbox"
                    name="keepSignedIn"
                    checked={formData.keepSignedIn}
                    onChange={handleChange}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-switch">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
