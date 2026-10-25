import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Cake } from "lucide-react";
import authService from "../../services/authService";
import { GoogleLogin } from "@react-oauth/google";
import "../../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepSignedIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Banner shown after a successful password reset
  const [resetSuccess, setResetSuccess] = useState(
    !!location.state?.passwordReset
  );

  const googleWrapRef = useRef(null);
const [googleWidth, setGoogleWidth] = useState(360);

// Make the Google button match the width of the form
useEffect(() => {
  const el = googleWrapRef.current;
  if (!el) return;

  const update = () => {
    const w = Math.floor(el.getBoundingClientRect().width);
    setGoogleWidth(Math.min(400, Math.max(200, w)));
  };

  update();
  const observer = new ResizeObserver(update);
  observer.observe(el);
  return () => observer.disconnect();
}, []);

  // Clear the router state so the banner does not return on page refresh
  useEffect(() => {
    if (location.state?.passwordReset) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setResetSuccess(false);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await authService.login(
        formData.email.trim(),
        formData.password
      );

      const token = data.token;

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

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("user");

      const storage = formData.keepSignedIn ? localStorage : sessionStorage;

      storage.setItem("token", token);
      storage.setItem("role", role);
      storage.setItem("user", JSON.stringify(user));

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

  
const handleGoogleSuccess = async (credentialResponse) => {
  setServerError("");
  setResetSuccess(false);

  const idToken = credentialResponse.credential;
  console.log("GOOGLE ID TOKEN:", idToken);

  if (!idToken) {
    setServerError("Google did not return an ID token. Please try again.");
    return;
  }

  setLoading(true);

  try {
    const data = await authService.googleLogin(idToken);

    const token = data.token;
    const role = data.role || data.user?.role;

    const user = {
      id: data.userId ?? data.user?.id ?? data.id,
      name: data.name ?? data.user?.name ?? data.fullName ?? "",
      email: data.email ?? data.user?.email ?? "",
      role,
    };

    if (!token || !role) {
      throw new Error("The server did not return a token or user role.");
    }

    if (!["admin", "customer"].includes(role.toLowerCase())) {
      throw new Error("Unknown user role.");
    }

    // Clear any previous session before saving the new one.
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("role");
      storage.removeItem("user");
    }

    // Match the existing Remember me behavior.
    const storage = formData.keepSignedIn
      ? localStorage
      : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("role", role);
    storage.setItem("user", JSON.stringify(user));

    if (role.toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    setServerError(
      err.response?.data?.message ||
        err.message ||
        "Google sign-in failed. Please try again."
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

            {resetSuccess && (
              <div className="auth-form-success">
                Password updated successfully! Please login again with your new
                password!
              </div>
            )}

            {serverError && <div className="auth-form-error">{serverError}</div>}

            
<div
  ref={googleWrapRef}
  className={`google-login-wrap ${loading ? "is-disabled" : ""}`}
>
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => {
      setServerError(
        "Google sign-in could not be completed. Please try again."
      );
    }}
    theme="outline"
    size="large"
    shape="rectangular"
    text="continue_with"
    width={String(googleWidth)}
  />
</div>

 <div className="auth-divider">
              <span>OR USE EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div
                  className={`auth-input ${errors.email ? "input-error" : ""}`}
                >
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div
                  className={`auth-input ${
                    errors.password ? "input-error" : ""
                  }`}
                >
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                {errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
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
