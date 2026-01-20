import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./utils/api";
import { Eye, EyeOff } from "lucide-react";
import "./App.css";

const logoSrc = "/waste-truck.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleClientIdMissing, setGoogleClientIdMissing] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in + Load remembered email
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then(() => navigate("/dashboard"))
        .catch(() => localStorage.removeItem("token"));
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  // ✅ Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleSignInEl = document.getElementById("googleSignIn");

    if (!clientId) {
      console.warn('Google Client ID not found. Google sign-in will not be available.');
      setGoogleClientIdMissing(true);
      if (googleSignInEl) {
        googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px; text-align: center;">Google sign-in not configured</p>';
      }
      return;
    }
    setGoogleClientIdMissing(false);

    const onLoad = () => {
      if (window.google?.accounts?.id) {
        try {
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

                  /* Legacy NGO check removed - now handled by OnboardingModal on Dashboard */

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
            // Clear any existing content
            el.innerHTML = '';
            try {
              window.google.accounts.id.renderButton(el, {
                theme: "outline",
                size: "large",
                shape: "pill",
                text: "signin_with",
                width: 350
              });
              console.log('✅ Google sign-in button rendered');
            } catch (renderErr) {
              console.error('Error rendering Google button:', renderErr);
              el.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to load Google sign-in</p>';
            }
          } else {
            console.warn('Google sign-in element not found');
          }
        } catch (initErr) {
          console.error('Error initializing Google sign-in:', initErr);
          const el = document.getElementById("googleSignIn");
          if (el) {
            el.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to initialize Google sign-in</p>';
          }
        }
      } else {
        console.warn('Google Identity Services not loaded');
        if (googleSignInEl) {
          googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Loading Google sign-in...</p>';
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
      s.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        const el = document.getElementById("googleSignIn");
        if (el) {
          el.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to load Google sign-in</p>';
        }
      };
      document.head.appendChild(s);
    } else {
      // Script already loaded, try to render immediately
      setTimeout(onLoad, 100);
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

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        /* Legacy NGO check removed - now handled by OnboardingModal on Dashboard */

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
              <h1 className="brand-name">WasteZero</h1>
            </div>
            <h2 className="headline">Join the Clean Future</h2>
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
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--white)' }}
                    />
                    Remember Me
                  </label>
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/otp");
                    }}
                    style={{ fontSize: "0.85rem" }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <button className="login-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login Account"}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12, minHeight: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div id="googleSignIn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                  {googleClientIdMissing && (
                    <p style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>
                      Configure VITE_GOOGLE_CLIENT_ID in .env to enable Google sign-in
                    </p>
                  )}
                </div>

                <p className="bottom-text" style={{ marginTop: '1rem', opacity: 0.8 }}>
                  NOT registered?{" "}
                  <span
                    className="bottom-link"
                    onClick={() => navigate("/register")}
                    style={{ textDecoration: 'underline' }}
                  >
                    click here to register
                  </span>
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
