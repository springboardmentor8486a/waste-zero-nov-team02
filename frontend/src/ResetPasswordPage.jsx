import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "./assets/lo.png";
import bgSrc from "./assets/download.jpg";
import darkBg from "./assets/lod.png";
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    const id = "reset-password-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      :root {
        --green:#00a32a;
        --link:#3b82f6;
        --muted:#374151;
        --card-bg:rgba(255,255,255,0.65);
      }
      html,body,#root{height:100%}
      .reset-wrapper{
        min-height:100vh;
        width:100%;
        background-image:url("${bgSrc}");
        background-size:cover;
        background-position:center;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:2rem;
      }
      .reset-container{
        width:100%;
        max-width:1300px;
        display:flex;
        gap:4rem;
        align-items:center;
        justify-content:space-between;
      }
      .left-block{
        flex:1;
        display:flex;
        flex-direction:column;
        gap:1.6rem;
      }
      .brand-row{display:flex;align-items:center;gap:1rem}
      .brand-icon{width:91px;height:82px}
      .brand-text{font-size:4rem;font-weight:700;color:white}
      .reset-title{
        font-size:2.8rem;
        font-weight:700;
        color:white;
      }
      .right-block{
        flex:0 0 450px;
        display:flex;
        justify-content:center;
      }
      .reset-card{
        width:100%;
        padding:2.2rem;
        border-radius:28px;
        background:var(--card-bg);
        backdrop-filter:blur(20px);
        box-shadow:0 8px 32px rgba(0,0,0,0.12);
        border:1px solid rgba(255,255,255,0.5);
      }
      .input-label{
        font-size:.875rem;
        font-weight:600;
        color:var(--muted);
        margin-bottom:6px;
      }
      .pass-wrapper{position:relative;margin-bottom:1.3rem;}
      .input-field{
        width:100%;
        padding:.9rem 1rem;
        border:1.5px solid #d1d5db;
        border-radius:50px;
        font-size:.95rem;
        color:#1f2937;
        background:#ffffff;
        outline:none;
        transition:.3s;
      }
      .input-field:focus{
        border-color:var(--green);
        box-shadow:0 0 0 3px rgba(0,163,42,.1);
        background:white;
      }
      .show-btn{
        position:absolute;
        right:1rem;
        top:50%;
        transform:translateY(-50%);
        background:none;
        border:none;
        cursor:pointer;
        font-weight:600;
        color:var(--link);
        font-size:.85rem;
      }
      .reset-btn{
        width:100%;
        padding:1rem;
        border:none;
        border-radius:50px;
        font-size:1rem;
        font-weight:700;
        color:white;
        background:var(--green);
        cursor:pointer;
        transition:.3s;
        margin-top:10px;
      }
      .reset-btn:hover{
        background:#008c24;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --green:#00ff66;
          --link:#60a5fa;
          --muted:#d1d5db;
          --card-bg:rgba(20,20,20,0.55);
        }
        .reset-wrapper {
          background-image:url("${darkBg}") !important;
        }
        .reset-card{
          background:rgba(25,25,25,0.6);
        }
        .input-field{
          background:#333 !important;
          border-color:#555 !important;
          color:white !important;
        }
        .show-btn{color:#60a5fa;}
        .required{color:#ef4444;margin-left:4px}
        @media (max-width: 1024px) {
  .content-container {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
    padding: 1rem;
  }

  .left-section {
    justify-content: center;
    align-items: center;
  }

  .headline {
    font-size: 2.5rem;
  }

  .brand-name {
    font-size: 3.5rem;
  }

  .subtext {
    font-size: 1rem;
  }

  .right-section {
    width: 100%;
    justify-content: center;
  }

  .login-card {
    max-width: 380px;
    width: 100%;
  }
  .login-card,
  .form-wrapper,
  .input-group,
  .input-label,
  .checkbox-label,
  .register-text {
    text-align: left !important;
  }
}
  }
/* ---------- TABLET (≤1024px) ---------- */
@media (max-width: 1024px) {

  .reset-container {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .left-block {
    align-items: center;
    text-align: center;
  }

  .brand-text {
    font-size: 3rem;
  }

  .reset-title {
    font-size: 2.2rem;
  }

  .right-block {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .reset-card {
    max-width: 400px;
    width: 100%;
    text-align: left !important;
  }

  .input-label,
  .pass-wrapper,
  .reset-btn {
    text-align: left !important;
  }
}

/* ---------- MOBILE (≤768px) ---------- */
@media (max-width: 768px) {

  .reset-wrapper {
    padding: 1.5rem;
    background-position: center top;
  }

  .brand-icon {
    width: 70px;
    height: 62px;
  }

  .brand-text {
    font-size: 2.4rem;
  }

  .reset-title {
    font-size: 2rem;
  }

  .reset-card {
    max-width: 340px;
    padding: 1.7rem;
  }

  .input-field {
    padding: 0.8rem 1rem;
  }

  .reset-btn {
    padding: 0.85rem;
  }
}

/* ---------- SMALL MOBILE (≤480px) ---------- */
@media (max-width: 480px) {

  .brand-text {
    font-size: 2rem;
  }

  .reset-title {
    font-size: 1.6rem;
  }

  .reset-card {
    max-width: 290px;
    padding: 1.3rem;
  }

  .input-field {
    font-size: 0.85rem;
  }

  .show-btn {
    font-size: 0.75rem;
  }

  .reset-btn {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
}
    `;
    document.head.appendChild(style);
  }, []);
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
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 9999
      }}>
        {errorMsg && (
          <div style={{
            background: "#D0342C",
            padding: "12px 24px",
            borderRadius: "12px",
            color: "white",
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{
            background: "#00a32a",
            padding: "12px 24px",
            borderRadius: "12px",
            color: "white",
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            {successMsg}
          </div>
        )}
      </div>
      <div className="reset-wrapper">
        <div className="reset-container">
          <div className="left-block">
            <div className="brand-row">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-text">WasteZero</h1>
            </div>
            <h2 className="reset-title">Reset Password</h2>
          </div>
          <div className="right-block">
            <div className="reset-card">
              <form onSubmit={handleReset}>
                <label className="input-label">Password <span className="required">*</span></label>
                <div className="pass-wrapper">
                  <input
                    className="input-field"
                    type={showPass1 ? "text" : "password"}
                    placeholder="Enter your Password"
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
                <label className="input-label">Current Password <span className="required">*</span></label>
                <div className="pass-wrapper">
                  <input
                    className="input-field"
                    type={showPass2 ? "text" : "password"}
                    placeholder="Enter your Current Password"
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
                <button className="reset-btn">Reset Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
