import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const logoSrc = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (errorMsg || successMsg) {
      const t = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [errorMsg, successMsg]);

  const handleReset = (e) => {
    e.preventDefault();

    if (!newPass || !currentPass) {
      setErrorMsg("✗ Fill all fields");
      return;
    }
    if (newPass !== currentPass) {
      setErrorMsg("✗ Passwords do not match");
      return;
    }

    setSuccessMsg("✓ Password Reset Successful!");
    setTimeout(() => navigate("/login"), 1800);
  };

  return (
    <>
      <div className="toast-wrapper">
        {errorMsg && <div className="toast error">{errorMsg}</div>}
        {successMsg && <div className="toast success">{successMsg}</div>}
      </div>

      <div className="reset-wrapper">
        <div className="reset-container">
          <div className="left-block">
            <div className="brand-row">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-text">WasteWise</h1>
            </div>
            <h2 className="reset-title">Reset Password</h2>
            <p className="reset-subtext">
              Enter your new password to secure your account.
            </p>
          </div>

          <div className="right-block">
            <div className="reset-card">
              <form className="form-wrapper" onSubmit={handleReset}>
                <div className="input-group">
                  <label className="input-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="pass-wrapper">
                    <input
                      className="input-field"
                      type={showPass1 ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                    <button
                      type="button"
                      className="show-btn"
                      onClick={() => setShowPass1(!showPass1)}
                    >
                      {showPass1 ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="pass-wrapper">
                    <input
                      className="input-field"
                      type={showPass2 ? "text" : "password"}
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                    />
                    <button
                      type="button"
                      className="show-btn"
                      onClick={() => setShowPass2(!showPass2)}
                    >
                      {showPass2 ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button className="reset-btn">Reset Password</button>

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
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bar">COPYRIGHT 2024 WASTEWISE.COM ALL RIGHTS RESERVED</div>
    </>
  );
}
