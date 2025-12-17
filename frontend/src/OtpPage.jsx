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

  return (
    <div className="auth-dark">
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
