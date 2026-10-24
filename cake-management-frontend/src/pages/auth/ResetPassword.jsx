import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Cake } from "lucide-react";
import authService from "../../services/authService";
import "../../styles/Login.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const linkIsIncomplete = !email || !token;

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "The passwords do not match.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (linkIsIncomplete) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await authService.resetPassword(email, token, formData.newPassword);

      // Go straight to login; the login page shows the success banner
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Unable to reset your password. The link may have expired."
      );
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
              <h1 className="auth-title">Reset password</h1>
              <p className="auth-subtitle">
                Please enter your new password below
              </p>
            </div>

            {linkIsIncomplete ? (
              <>
                <div className="auth-form-error">
                  This reset link is incomplete or invalid. Please request a
                  new one.
                </div>
                <div className="auth-switch">
                  <Link to="/forgot-password">Request a new link</Link>
                  <br />
                  Or, return to <Link to="/login">log in</Link>
                </div>
              </>
            ) : (
              <>
                {serverError && (
                  <div className="auth-form-error">{serverError}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <div className="auth-input">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="newPassword">New password</label>
                    <div
                      className={`auth-input ${
                        errors.newPassword ? "input-error" : ""
                      }`}
                    >
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter your new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowNew((v) => !v)}
                        tabIndex={-1}
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <div className="field-error">{errors.newPassword}</div>
                    )}
                  </div>

                  <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <div
                      className={`auth-input ${
                        errors.confirmPassword ? "input-error" : ""
                      }`}
                    >
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="field-error">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>

                <div className="auth-switch">
                  Link expired?{" "}
                  <Link to="/forgot-password">Request a new one</Link>
                  <br />
                  Or, return to <Link to="/login">log in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;