import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const logoSrc = "/waste-truck.png";

export default function ForgotPage() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("resetEmail", email);
        navigate("/otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-light">
      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} alt="logo" className="brand-icon" />
              <h1 className="brand-name">WasteZero</h1>
            </div>

            <div className="text-content">
              <h2 className="headline">Forgot Password</h2>
              <p className="subtext">
                Enter your email and we will send an OTP to reset your password.
              </p>
            </div>
          </div>

          <div className="right-section">
            <div className="login-card">
              <form className="form-wrapper" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">
                    Email address <span className="required-mark">*</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{error}</p>}

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Sending..." : "Next"}
                </button>

                <p className="back-link">
                  Go back to{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Login
                  </a>
                </p>

                <p className="register-text">
                  Haven’t an Account?
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register");
                    }}
                  >
                    {" "}Click Here To Register
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">COPYRIGHT 2026 WASTEZERO.IN ALL RIGHTS RESERVED</div>
    </div>
  );
}
