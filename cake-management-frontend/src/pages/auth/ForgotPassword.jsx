import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Cake, CheckCircle } from "lucide-react";
import authService from "../../services/authService";
import "../../styles/Login.css";

const RESEND_SECONDS = 60;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Count down the resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validate = () => {
    if (!email.trim()) return "Email address is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    return "";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;

    setServerError("");
    setSent(false);

    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      if (err.response?.status === 429) {
        setServerError(
          "Too many requests. Please wait a few minutes and try again."
        );
      } else {
        setServerError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading
    ? "Sending..."
    : cooldown > 0
    ? `Resend in ${cooldown}s`
    : "Email password reset link";

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
              <h1 className="auth-title">Forgot password</h1>
              <p className="auth-subtitle">
                Enter your email to receive a password reset link
              </p>
            </div>

            {sent && (
              <div className="auth-form-success" role="status">
                <CheckCircle size={18} />
                <span>
                  We have sent a password reset
                  link to your email. Please check your email.
                </span>
              </div>
            )}

            {serverError && (
              <div className="auth-form-error" role="alert">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className={`auth-input ${error ? "input-error" : ""}`}>
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
                {error && <div className="field-error">{error}</div>}
              </div>

              <button
                type="submit"
                className="btn-auth"
                disabled={loading || cooldown > 0}
              >
                {buttonLabel}
              </button>
            </form>

            <div className="auth-switch">
              Or, return to <Link to="/login">log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;