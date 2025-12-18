import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function ForgotPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/otp");
  };

  return (
    <div className="auth-light">
      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} alt="logo" className="brand-icon" />
              <h1 className="brand-name">WasteWise</h1>
            </div>

            <div className="text-content">
              <h2 className="headline">Forgot Password</h2>
              <p className="subtext">
                Enter your email and we will send an OTP to reset your password.
              </p>
            </div>
          </div>

          <div className="right-section">
            <div className="login-card">
              <form className="form-wrapper" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">
                    Email address <span className="required-mark">*</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <button type="submit" className="login-btn">
                  Next
                </button>

                <p className="back-link">
                  Go back to{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Login
                  </a>
                </p>

                <p className="register-text">
                  Haven’t an Account?
                  <a
                    href="#"
                    className="register-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register");
                    }}
                  >
                    {" "}Click Here To Register
                  </a>
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
