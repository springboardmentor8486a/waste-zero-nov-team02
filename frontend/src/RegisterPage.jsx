import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./utils/api";
import { Eye, EyeOff } from "lucide-react";
import "./App.css";

const logoSrc = "/waste-truck.png";

export default function RegisterPage() {
  const navigate = useNavigate();

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

  // Google Identity Services (register)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const googleSignInEl = document.getElementById("googleSignIn");

    if (!clientId) {
      console.warn('Google Client ID not found. Google sign-in will not be available.');
      if (googleSignInEl) {
        googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Google sign-in not configured</p>';
      }
      return;
    }

    const onLoad = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp) => {
              try {
                console.debug('Google credential received (register)', resp);
                const tokenId = resp.credential;
                // attempt quick client-side decode to show detected role
                try {
                  const parts = tokenId.split('.');
                  if (parts.length >= 2) {
                    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
                    const payload = JSON.parse(payloadJson);
                    const gEmail = payload?.email || '';
                    const domain = String(gEmail).split('@')[1] || '';
                    const derivedRole = /gmail/i.test(domain) ? 'volunteer' : 'ngo';
                    setGoogleRole(derivedRole);
                  }
                } catch (e) {
                  console.debug('Failed to decode Google token payload', e);
                }

                const res = await api.post('/auth/google', { tokenId });
                console.debug('Backend /auth/google response (register)', res?.data);

                if (res?.data?.success) {
                  localStorage.setItem('token', res.data.token);
                  localStorage.setItem('name', res.data.user.fullName || res.data.user.username);
                  localStorage.setItem('role', res.data.user.role);
                  navigate('/dashboard');
                  return;
                }

                if (res?.data?.token) {
                  console.warn('No success flag but token returned (register) — using fallback redirect');
                  localStorage.setItem('token', res.data.token);
                  localStorage.setItem('name', res.data.user?.fullName || res.data.user?.username || 'User');
                  localStorage.setItem('role', res.data.user?.role || googleRole || 'volunteer');
                  navigate('/dashboard');
                  return;
                }
              } catch (err) {
                console.error('Google register failed', err);
              }
            }
          });

          const el = document.getElementById('googleSignInRegister');
          const el1 = document.getElementById("googleSignIn");

          if (el1) {
            el1.innerHTML = ""; // 🔴 IMPORTANT: clears cached button

            try {
              window.google.accounts.id.renderButton(el1, {
                theme: "filled_white",   // ✅ white bg + black text
                size: "large",
                shape: "pill",
                text: "signup_with",
                width: 350
              });
              console.log('✅ Google sign-in button rendered (register)');
            } catch (renderErr) {
              console.error('Error rendering Google button:', renderErr);
              el1.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to load Google sign-in</p>';
            }
          } else {
            console.warn('Google sign-in element not found (register)');
          }

        } catch (e) {
          console.error('Google init error', e);
          if (googleSignInEl) {
            googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to initialize Google sign-in</p>';
          }
        }
      } else {
        console.warn('Google Identity Services not loaded');
        if (googleSignInEl) {
          googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Loading Google sign-in...</p>';
        }
      }
    };

    const id = 'gsi-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = onLoad;
      s.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        if (googleSignInEl) {
          googleSignInEl.innerHTML = '<p style="color: #999; font-size: 12px; padding: 8px;">Failed to load Google sign-in</p>';
        }
      };
      document.head.appendChild(s);
    } else {
      // Script already loaded, try to render immediately
      setTimeout(onLoad, 100);
    }
  }, [navigate]);

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    // auto-detect role based on email domain
    const domain = String(email).split('@')[1] || '';
    const derivedRole = /gmail/i.test(domain) ? 'volunteer' : (domain ? 'ngo' : '');
    setRole(derivedRole);
  }, [email]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState("");

  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!email || !username || !password || !confirmPassword) {
      setErrorMsg("✗ Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("✗ Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("✗ Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // derive role from email domain on client-side as well (server enforces too)
      const domain = String(email).split('@')[1] || '';
      const derivedRole = /gmail/i.test(domain) ? 'volunteer' : 'ngo';
      const finalRole = role || derivedRole;

      const response = await api.post("/auth/register", {
        email,
        username,
        password,
        confirmPassword,
        role: finalRole,
      });

      if (response.data.success) {
        setSuccessMsg("✓ Account Registered Successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "✗ Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <><div className="auth-dark">
      {/* ===== TOAST MESSAGES ===== */}
      <div className="toast-wrapper">
        {errorMsg && <div className="toast error">{errorMsg}</div>}
        {successMsg && <div className="toast success">{successMsg}</div>}
      </div>

      {/* ===== PAGE ===== */}
      <div className="main-wrapper">
        <div className="content-container">
          {/* LEFT */}
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-name">WasteZero</h1>
            </div>
            <h2 className="headline">Let's Build a Cleaner Tomorrow</h2>
          </div>

          {/* RIGHT */}
          <div className="right-section">
            <div className="register-card">

              <form className="form-wrapper" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">
                    Email address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    User name <span className="required">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPass1 ? "text" : "password"}
                      className="input-field"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="show-pass-btn"
                      onClick={() => setShowPass1(!showPass1)}
                    >
                      {showPass1 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && (
                    <div className={`password-strength-text strength-${password.length < 6 ? 'weak' :
                      (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/) && password.length >= 8) ? 'strong' :
                        (password.length >= 8 && ((password.match(/[a-z]/) && password.match(/[0-9]/)) || (password.match(/[a-zA-Z]/) && password.match(/[^a-zA-Z0-9]/)))) ? 'medium' :
                          'weak'
                      }`}>
                      Strength: {
                        password.length < 6 ? 'Too Weak (min 6 chars)' :
                          (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/) && password.length >= 8) ? 'Strong' :
                            (password.length >= 8 && ((password.match(/[a-z]/) && password.match(/[0-9]/)) || (password.match(/[a-zA-Z]/) && password.match(/[^a-zA-Z0-9]/)))) ? 'Medium' :
                              'Weak'
                      }
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Confirm password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPass2 ? "text" : "password"}
                      className="input-field"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="show-pass-btn"
                      onClick={() => setShowPass2(!showPass2)}
                    >
                      {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>



                <button type="submit" className="register-btn" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12, minHeight: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div id="googleSignIn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                </div>

                <p className="bottom-text">
                  Have an Account?{" "}
                  <span
                    className="bottom-link"
                    onClick={() => navigate("/login")}
                  >
                    Click Here To Login
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div className="footer-bar">COPYRIGHT 2026 WASTEZERO.IN ALL RIGHTS RESERVED</div>
    </>
  );
}
