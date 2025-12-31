import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReCAPTCHA from "react-google-recaptcha";
import api from "./utils/api";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setErrorMsg("Please enter valid phone number");
      return;
    }
    setOtpLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.post("/auth/send-otp", {
        contact: phoneNumber,
        type: 'phone',
        isRegister: true
      });
      setOtpSent(true);
      const otpMsg = res.data.debugOtp ? `OTP Sent! Code: ${res.data.debugOtp}` : "OTP Sent to your phone";
      setSuccessMsg(otpMsg);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!recaptchaToken) {
      setErrorMsg("Please complete the CAPTCHA");
      return;
    }

    if (!otp) {
      setErrorMsg("Please verify your phone number with OTP");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/register", {
        email,
        username,
        password,
        confirmPassword,
        phoneNumber,
        recaptchaToken,
        otp
      });

      if (res.data.success) {
        setSuccessMsg("Registration successful! Logging in...");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user.username);
        // Redirect
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
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
              <img src={logoSrc} className="brand-icon" alt="Logo" />
              <h1 className="brand-name">WasteWise</h1>
            </div>
            <h2 className="headline">Join the Clean Future</h2>
            <p className="subtext">
              Create an account to track your waste impact and join our community.
            </p>
          </div>

          <div className="right-section">
            <div className="login-card">
              {errorMsg && <div className="toast error" style={{ marginBottom: "1rem" }}>{errorMsg}</div>}
              {successMsg && <div className="toast success" style={{ marginBottom: "1rem" }}>{successMsg}</div>}

              <form className="form-wrapper" onSubmit={handleRegister}>

                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    type="text"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <PhoneInput
                        country={'in'}
                        value={phoneNumber}
                        onChange={(phone) => setPhoneNumber(phone)}
                        inputClass="input-field"
                        containerStyle={{ width: '100%' }}
                        buttonClass="phone-input-button"
                        dropdownClass="phone-input-dropdown"
                      />
                    </div>
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || !phoneNumber}
                        className="px-3 bg-white/10 text-xs font-bold text-green-400 rounded-lg hover:bg-white/20 whitespace-nowrap border border-green-500/30"
                      >
                        {otpLoading ? "..." : "Verify"}
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
                      <span className="text-xs text-green-400">OTP Sent!</span>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 20 }}>
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(token) => setRecaptchaToken(token)}
                    theme="light"
                  />
                </div>

                <button className="login-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="register-text">
                Already have an account? <Link to="/login" className="register-link">Log In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">COPYRIGHT 2025 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </div>
  );
}
