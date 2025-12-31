import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./utils/api";
import "./App.css";

const logoSrc =
  "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

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

<<<<<<< Updated upstream
=======
  // Google Identity Services (register)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

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
          if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large' });
        } catch (e) {
          console.error('Google init error', e);
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
      document.head.appendChild(s);
    } else {
      onLoad();
    }
  }, [navigate]);

>>>>>>> Stashed changes
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [userOverrodeRole, setUserOverrodeRole] = useState(false);

  useEffect(() => {
    // auto-detect role based on email domain unless the user manually overrode it
    const domain = String(email).split('@')[1] || '';
    const derivedRole = /gmail/i.test(domain) ? 'volunteer' : (domain ? 'ngo' : '');
    if (!userOverrodeRole) setRole(derivedRole);
  }, [email, userOverrodeRole]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState("");
  const [showRoleTooltip, setShowRoleTooltip] = useState(false);

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
              <h1 className="brand-name">WasteWise</h1>
            </div>
            <h2 className="headline">Let's Build a Cleaner Tomorrow</h2>
            <p className="subtext">
              Provide a few details to get started with smarter, eco-friendly
              waste management.
            </p>
          </div>

          {/* RIGHT */}
          <div className="right-section">
            <div className="register-card">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, position: 'relative' }}>
                <div style={{ padding: '6px 8px', borderRadius: 6, background: role === 'ngo' ? '#e0f2fe' : '#ecfdf5', color: role === 'ngo' ? '#0369a1' : '#065f46', fontWeight: 600 }}>Role: {role || '—'}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>How role is derived</div>
                <button type="button" onMouseEnter={() => setShowRoleTooltip(true)} onMouseLeave={() => setShowRoleTooltip(false)} onFocus={() => setShowRoleTooltip(true)} onBlur={() => setShowRoleTooltip(false)} aria-label="Role info" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="1.5" /><path d="M11 10h2v6h-2zM11 7h2v2h-2z" fill="#9CA3AF"/></svg>
                </button>
                {showRoleTooltip && (
                  <div style={{ position: 'absolute', top: '36px', left: 0, zIndex: 40, width: 280, background: '#fff', border: '1px solid #e5e7eb', padding: 10, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>How roles are assigned</div>
                    <div style={{ fontSize: 12, color: '#374151' }}>We auto-detect your role from the email domain: addresses at Gmail domains will be registered as <strong>Volunteer</strong>, other business/institution domains will be registered as <strong>NGO</strong>. You may override this selection below if needed.</div>
                  </div>
                )}
              </div>
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
                      {showPass1 ? "Hide" : "Show"}
                    </button>
                  </div>
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
                      {showPass2 ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Role <span className="required">*</span>
                  </label>
                  <select
                    className="input-field select-field"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setUserOverrodeRole(true); }}
                  >
                    <option value="">Select role</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="ngo">NGO</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">Auto-detected from email but you can override.</div>
                </div>

                <button type="submit" className="register-btn" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </button>

<<<<<<< Updated upstream
=======
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <div id="googleSignInRegister" />
                  <div className="text-sm text-gray-600 mt-2">Google sign-in will register you as: <strong>{googleRole || '—'}</strong></div>
                </div>

>>>>>>> Stashed changes
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
      <div className="footer-bar">COPYRIGHT 2024 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </>
  );
}
