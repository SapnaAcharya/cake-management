import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Cake } from "lucide-react";
import authService from "../../services/authService";
import "../../styles/Register.css";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
  if (secondsLeft <= 0) return;

  const timer = setTimeout(() => {
    setSecondsLeft((seconds) => Math.max(0, seconds - 1));
  }, 1000);

  return () => clearTimeout(timer);
}, [secondsLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
    const result = await authService.verifyEmail(
  email.trim().toLowerCase(),
  otp
);

setMessage(
  result.message || "Email verified successfully."
);

setOtp("");
setSecondsLeft(300);

// Redirect to login only after the user has time to see success.
setTimeout(() => {
  navigate("/login", {
    replace: true,
    state: {
      email: email.trim().toLowerCase(),
      message:
        result.message ||
        "Email verified successfully. You can now sign in.",
    },
  });
}, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setResending(true);

    try {
      const result = await authService.resendEmailOtp(
        email.trim().toLowerCase()
      );

      setMessage(
        result.message ||
        "If your account is unverified, a new code will be sent."
      );
      setOtp("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not resend the code. Please try again later."
      );
    } finally {
      setResending(false);
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

              <div className="auth-panel-brand">
                SweetCakes
              </div>

              <h1 className="auth-title">
                Verify Your Email
              </h1>

              <p className="auth-subtitle">
                Enter the six-digit code sent to your email
                address to activate your account.
              </p>
            </div>

            {message && (
              <div className="auth-form-success" role="status">
                {message}
              </div>
            )}

            {error && (
              <div className="auth-form-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} noValidate>
              <div className="auth-field">
                <label htmlFor="verificationEmail">
                  Email Address
                </label>

                <div className="auth-input">
                  <Mail size={16} className="auth-input-icon" />

                  <input
                    id="verificationEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <p className="otp-expiry">
  {secondsLeft > 0 ? (
    <>
      Your OTP expires in{" "}
      <strong>
        {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
        {String(secondsLeft % 60).padStart(2, "0")}
      </strong>
    </>
  ) : (
    <strong>Your OTP may have expired. Please request a new code.</strong>
  )}
</p>

              <div className="auth-field">
                <label htmlFor="otp">
                  Verification Code
                </label>

                <div className="auth-input">
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth"
                disabled={loading || resending}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <button
              type="button"
              className="btn-auth"
              onClick={handleResend}
              disabled={loading || resending}
              style={{ marginTop: "12px" }}
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>

            <div className="auth-switch">
              Already verified? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
