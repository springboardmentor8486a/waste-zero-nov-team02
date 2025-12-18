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
      // Verify token is still valid
      api.get("/auth/me")
        .then(() => navigate("/dashboard"))
        .catch(() => localStorage.removeItem("token"));
    }
  }, [navigate]);

  // Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const onLoad = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp) => {
              // resp.credential contains the ID token
              const tokenId = resp.credential;
              try {
                const res = await api.post('/auth/google', { tokenId });
                if (res.data?.success) {
                  localStorage.setItem('token', res.data.token);
                  localStorage.setItem('name', res.data.user.fullName || res.data.user.username);
                  localStorage.setItem('role', res.data.user.role);
                  navigate('/dashboard');
                }
              } catch (err) {
                console.error('Google sign-in failed', err);
              }
            }
          });

          // render button into placeholder
          const el = document.getElementById('googleSignIn');
          if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large' });
        } catch (e) {
          console.error('Google ID init error', e);
        }
      }
    };

    // load script
    const id = 'gsi-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://accounts.google.com/gsi/client';
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

    if (!email || !password) {
      setErrorMsg("✗ Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.user.fullName || response.data.user.username);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("username", response.data.user.username);
        
        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "✗ Invalid email or password"
      );
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
