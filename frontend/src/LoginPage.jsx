import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./utils/api";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then(() => navigate("/dashboard"))
        .catch(() => localStorage.removeItem("token"));
    }
  }, [navigate]);

  // ✅ Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const onLoad = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            try {
              console.debug('Google credential received', resp);
              const res = await api.post("/auth/google", {
                tokenId: resp.credential,
              });
              console.debug('Backend /auth/google response', res?.data);

              // Primary flow: respect explicit success flag
              if (res?.data?.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem(
                  "name",
                  res.data.user.fullName || res.data.user.username
                );
                localStorage.setItem("role", res.data.user.role);
                navigate("/dashboard");
                return;
              }

              // Fallback: if backend returned a token even without `success`, still accept it
              if (res?.data?.token) {
                console.warn('No success flag but token returned — using fallback redirect');
                localStorage.setItem("token", res.data.token);
                localStorage.setItem(
                  "name",
                  res.data.user?.fullName || res.data.user?.username || 'User'
                );
                localStorage.setItem("role", res.data.user?.role || 'volunteer');
                navigate("/dashboard");
                return;
              }

              // If we reach here, show error for visibility
              console.error('Google sign-in did not return token or success flag', res?.data);
              setErrorMsg("Google sign-in failed");
            } catch (err) {
              console.error("Google sign-in failed", err);
              setErrorMsg("Google sign-in failed");
            }
          },
        });

        const el = document.getElementById("googleSignIn");
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
          });
        }
      }
    };

    if (!document.getElementById("gsi-script")) {
      const s = document.createElement("script");
      s.id = "gsi-script";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = onLoad;
      document.head.appendChild(s);
    } else {
      onLoad();
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "name",
          res.data.user.fullName || res.data.user.username
        );
        localStorage.setItem("role", res.data.user.role);
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg("✗ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 👇 Dark mode wrapper */
    <div className="auth-dark">
      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-name">WasteWise</h1>
            </div>
            <h2 className="headline">Join the Clean Future</h2>
            <p className="subtext">
              Together, we build cleaner communities through responsible waste practices.
            </p>
          </div>

          <div className="right-section">
            <div className="login-card">
              {errorMsg && (
                <div className="toast error" style={{ marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
              )}
              <form className="form-wrapper" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <a
                  href="#"
                  className="register-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/otp");
                  }}
                  style={{ display: "inline-block", marginBottom: "0.5rem" }}
                >
                  Forgot Password?
                </a>

                <button className="login-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login Account"}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <div id="googleSignIn" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">COPYRIGHT 2024 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </div>
  );
}
