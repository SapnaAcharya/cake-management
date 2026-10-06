import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Cake } from "lucide-react";
import authService from "../../services/authService";
import "../../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
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
      await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
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
                <Cake size={22} className="navbar-brand-icon" />
              </span>
              <div className="auth-panel-brand">Cake Management</div>
              <h1 className="auth-title">Create Your Account</h1>
              <p className="auth-subtitle">
                Join us and start ordering your favorite cakes
              </p>
            </div>

            {serverError && <div className="auth-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="fullName">Full Name</label>
                <div className={`auth-input ${errors.fullName ? "input-error" : ""}`}>
                  <User size={16} className="auth-input-icon" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                {errors.fullName && <div className="field-error">{errors.fullName}</div>}
              </div>

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
                    placeholder="Create a password"
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

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div
                  className={`auth-input ${errors.confirmPassword ? "input-error" : ""}`}
                >
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="field-error">{errors.confirmPassword}</div>
                )}
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;