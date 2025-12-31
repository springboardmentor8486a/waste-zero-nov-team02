import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter full OTP");
      return;
    }
    if (code === "1234") {
      setSuccessMsg("OTP Verified Successfully");
      setTimeout(() => navigate("/resetpassword"), 800);
    } else {
      setErrorMsg("Invalid OTP");
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
    <div className="auth-dark">
      {/* ===== TOAST MESSAGES ===== */}
      <div className="toast-wrapper">
        {errorMsg && <div className="toast error">{errorMsg}</div>}
        {successMsg && <div className="toast success">{successMsg}</div>}
      </div>

      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-name">WasteWise</h1>
            </div>
            <h2 className="headline">OTP Verification</h2>
            <p className="subtext">
              Enter the 4-digit code sent to your email/phone to continue.
            </p>
          </div>

          <div className="right-section">
            <div className="login-card">
              <form className="form-wrapper" onSubmit={handleSubmit}>
                <label className="input-label">
                  Enter OTP <span className="required">*</span>
                </label>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "1rem" }}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      maxLength="1"
                      className="input-field"
                      style={{ width: "55px", textAlign: "center", fontSize: "1.25rem", fontWeight: "bold" }}
                      value={v}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                    />
                  ))}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <button
                    type="button"
                    className="w-full py-2 bg-blue-50 text-[#0369a1] text-sm font-bold rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
                    onClick={async () => {
                      try {
                        if ('OTPCredential' in window) {
                          const content = await navigator.credentials.get({ otp: { transport: ['sms'] } });
                          if (content && content.code) {
                            setOtp(content.code.split('').slice(0, 4));
                            setSuccessMsg("✓ OTP Auto-filled!");
                          }
                        } else {
                          setErrorMsg("WebOTP not supported on this device/browser");
                          // Fallback simulation for Desktop
                          setSuccessMsg("✓ Simulated Auto-fill (Dev)");
                          setOtp(['1', '2', '3', '4', '5', '6']);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    ✨ Auto-fill from Messages
                  </button>
                </div>

                <button type="submit" className="login-btn">
                  Verify
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <div id="googleSignInOtp" />
                </div>

                <p className="bottom-text">
                  Haven’t an Account?{" "}
                  <span
                    className="bottom-link"
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
      <div className="footer-bar">COPYRIGHT 2025 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </div>
  );
}
