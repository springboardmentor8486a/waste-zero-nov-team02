import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from "./utils/api";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Login States
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' | 'otp'
  const [contactType, setContactType] = useState("email"); // 'email' | 'phone'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

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

  // Google Identity Services
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

              if (res?.data?.success || res?.data?.token) {
                const token = res.data.token || res.data.user.token;
                localStorage.setItem("token", token);
                // Handle potentially different user structures
                const user = res.data.user || {};
                localStorage.setItem("name", user.fullName || user.username || 'User');
                localStorage.setItem("role", user.role || 'volunteer');
                navigate("/dashboard");
              } else {
                setErrorMsg("Google sign-in failed");
              }
            } catch (err) {
              console.error("Google sign-in failed", err);
              setErrorMsg("Google sign-in failed");
            }
          },
        });

        const el = document.getElementById("googleSignIn");
        if (el) window.google.accounts.id.renderButton(el, { theme: "outline", size: "large" });
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

  const handleSendOTP = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const contact = contactType === 'email' ? email : phone;
      if (!contact) {
        setErrorMsg(`Please enter your ${contactType}`);
        setLoading(false);
        return;
      }

      const res = await api.post("/auth/send-otp", { contact, type: contactType });
      if (res.data.success) {
        setOtpSent(true);
        const otpMsg = res.data.debugOtp ? `OTP sent! Code: ${res.data.debugOtp}` : `OTP sent to your ${contactType}`;
        setSuccessMsg(otpMsg);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // ReCAPTCHA check
    if (!recaptchaToken) {
      setErrorMsg("Please complete the CAPTCHA");
      setLoading(false);
      return;
    }

    try {
      let res;

      if (loginMethod === 'otp') {
        if (!otp) { setErrorMsg("Please enter OTP"); setLoading(false); return; }
        res = await api.post("/auth/login", {
          email: contactType === 'email' ? email : undefined,
          phone: contactType === 'phone' ? phone : undefined,
          otp,
          recaptchaToken
        });
      } else {
        res = await api.post("/auth/login", { email, password, recaptchaToken });
      }

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user.fullName || res.data.user.username);
        localStorage.setItem("role", res.data.user.role);

        if (rememberMe && email) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
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
              {errorMsg && <div className="toast error" style={{ marginBottom: "1rem" }}>{errorMsg}</div>}
              {successMsg && <div className="toast success" style={{ marginBottom: "1rem" }}>{successMsg}</div>}

              {/* Toggle Switch */}
              <div className="flex bg-gray-100/10 p-1 rounded-xl mb-6 relative border border-white/10">
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-[#059669] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setLoginMethod('password')}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-[#059669] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setLoginMethod('otp')}
                >
                  OTP Login
                </button>
              </div>

              <form className="form-wrapper" onSubmit={handleSubmit}>

                {loginMethod === 'password' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    {/* Contact Type Toggle */}
                    <div className="flex gap-4 mb-4 text-sm font-medium text-gray-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={contactType === 'email'} onChange={() => setContactType('email')} className="accent-green-500" />
                        Email
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={contactType === 'phone'} onChange={() => setContactType('phone')} className="accent-green-500" />
                        Phone (SMS)
                      </label>
                    </div>

                    <div className="input-group">
                      <label className="input-label">{contactType === 'email' ? 'Email Address' : 'Phone Number'}</label>
                      <div className="flex gap-2">
                        {contactType === 'email' ? (
                          <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            disabled={otpSent}
                          />
                        ) : (
                          <PhoneInput
                            country={'in'}
                            value={phone}
                            onChange={phone => setPhone(phone)}
                            inputClass="input-field"
                            containerStyle={{ flex: 1 }}
                            disabled={otpSent}
                            buttonClass="phone-input-button"
                            dropdownClass="phone-input-dropdown"
                          />
                        )}
                        {!otpSent && (
                          <button type="button" onClick={handleSendOTP} disabled={loading} className="px-3 bg-white/10 text-xs font-bold text-green-400 rounded-lg hover:bg-white/20 whitespace-nowrap border border-green-500/30">
                            {loading ? '...' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    </div>

                    {otpSent && (
                      <div className="input-group animate-in slide-in-from-top-2">
                        <label className="input-label">One-Time Password</label>
                        <input
                          type="text"
                          className="input-field text-center tracking-widest text-xl font-bold"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="• • • • • •"
                          maxLength={6}
                        />
                        <div className="text-right mt-1">
                          <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-gray-400 hover:text-white underline">Change Contact</button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--green)' }}
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

                <div className="input-group" style={{ marginBottom: 20 }}>
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(token) => setRecaptchaToken(token)}
                    theme="light" // or "dark" if you prefer
                  />
                </div>

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
      <div className="footer-bar">COPYRIGHT 2025 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </div>
  );
}
