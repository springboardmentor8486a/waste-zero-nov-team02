import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      setErrorMsg("✗ Please enter full OTP");
      return;
    }
    if (code === "1234") {
      setSuccessMsg("✓ OTP Verified Successfully");
      setTimeout(() => navigate("/resetpassword"), 800);
    } else {
      setErrorMsg("✗ Invalid OTP");
    }
  };

  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  // Google Identity Services (OTP page) — render sign-in if available
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const onLoad = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp) => {
              // OTP page may not need token handling — but we can post to auth/google
              const tokenId = resp.credential;
              try {
                const res = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tokenId }) });
                const data = await res.json();
                if (data?.success) {
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('name', data.user.fullName || data.user.username);
                  localStorage.setItem('role', data.user.role);
                  window.location.href = '/dashboard';
                }
              } catch (err) { console.error('Google on OTP failed', err); }
            }
          });

          const el = document.getElementById('googleSignInOtp');
          if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large' });
        } catch (e) { console.error('GSI init error', e); }
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
  }, []);

  return (
    <div className="auth-light">
      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-name">WasteWise</h1>
            </div>
            <h2 className="headline">OTP Verification</h2>
            <p className="subtext">
              Enter the 4-digit code sent to your email to continue.
            </p>
          </div>

          <div className="right-section">
            <div className="login-card">
              <form className="form-wrapper" onSubmit={handleSubmit}>
                <label className="input-label">
                  Enter OTP <span className="required-mark">*</span>
                </label>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      maxLength="1"
                      className="input-field"
                      style={{ width: "55px", textAlign: "center" }}
                      value={v}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                    />
                  ))}
                </div>

                <button type="submit" className="login-btn">
                  Verify
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <div id="googleSignInOtp" />
                </div>

                <p className="register-text">
                  Haven’t an Account?{" "}
                  <span
                    className="register-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register");
                    }}
                  >
                    Click Here To Register
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">COPYRIGHT 2024 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </div>
  );
}
