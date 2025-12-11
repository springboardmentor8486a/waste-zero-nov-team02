import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "./assets/lo.png";
import bgSrc from "./assets/download.jpg";
import ld from "./assets/lod.png";
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
      document.getElementById(`otp-${index + 1}`).focus();
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
      setTimeout(() => navigate("/resetpassword"), 1500);
    } else {
      setErrorMsg("✗ Invalid OTP");
    }
  };
  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);
  useEffect(() => {
    const id = "otp-2nd-screen-style";
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
      @keyframes toastSlide {
        from { opacity:0; transform:translateY(20px); }
        to { opacity:1; transform:translateY(0); }
      }
      html, body, #root { height:100%; }
      .main-wrapper {
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
      .content-container {
        width:100%;
        max-width:1200px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:4rem;
      }
      .left-section {
        flex:1;
        display:flex;
        flex-direction:column;
        gap:1.5rem;
      }
      .brand-header {
        display:flex;
        align-items:center;
        gap:1rem;
      }
      .brand-icon {
        width:90px;
        height:80px;
        object-fit:contain;
      }
      .brand-name {
        font-size:4.2rem;
        font-weight:700;
        color:white;
      }
      .subtext1 {
        font-size:1.4rem;
        color:white;
        font-weight:700;
      }
      .subtext2 {
        color:white;
        opacity:0.9;
        margin-top:-8px;
      }
      .right-section {
        flex:0 0 420px;
        display:flex;
        justify-content:center;
      }
      .otp-card {
        width:100%;
        padding:2.2rem;
        border-radius:28px;
        background:var(--card-bg);
        backdrop-filter:blur(20px);
        box-shadow:0 8px 32px rgba(0,0,0,0.12);
        text-align:center;
        border:1px solid rgba(255,255,255,0.5);
      }
      .otp-label {
        font-size:.95rem;
        font-weight:600;
        color:var(--muted);
        text-align:left;
        margin-bottom:.7rem;
      }
      .star {
        color:#d0342c;
        margin-left:3px;
        font-weight:700;
      }
      .otp-box-container {
        display:flex;
        justify-content:center;
        gap:1rem;
        margin-bottom:1.5rem;
      }
      .otp-box {
        width:55px;
        height:55px;
        border-radius:10px;
        text-align:center;
        font-size:1.5rem;
        border:1.5px solid #d1d5db;
        background:white;
        outline:none;
        transition:0.2s;
      }
      .otp-box:focus {
        border-color:var(--green);
        box-shadow:0 0 0 3px rgba(0,163,42,.18);
      }
      .verify-btn {
        width:100%;
        padding:0.9rem;
        border:none;
        border-radius:50px;
        font-size:1rem;
        font-weight:700;
        color:white;
        background:var(--green);
        cursor:pointer;
        margin-bottom:1rem;
        box-shadow:0 4px 12px rgba(0,163,42,.25);
      }
      .verify-btn:hover {
        background:#008c24;
      }
      .link-line, .link-line2 {
        margin-top: 12px;
        font-size: .95rem;
        color: #374151;
        text-align: center;
      }
      .link-line a,
      .link-line2 a {
        color: #3b82f6;
        font-weight: 600;
        text-decoration: none;
        margin-left: 4px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --green:#00ff66;
          --link:#60a5fa;
          --muted:#d1d5db;
          --card-bg:rgba(20,20,20,0.55);
        }
        body { background:#000 !important; }
        .main-wrapper { background-image:url("${ld}") !important; }
        .otp-box {
          background:#333;
          color:white;
          border-color:#555;
        }
@media (prefers-color-scheme: dark) {
  .link-line,
  .link-line2 {
    color: rgba(255,255,255,0.75) !important;
  }
  .link-line a,
  .link-line2 a {
    color: #3b82f6 !important;
  }
}
  }
/* ---------- TABLET (≤1024px) ---------- */
@media (max-width: 1024px) {

  .content-container {
    flex-direction: column;
    gap: 2.5rem;
    align-items: center;
    text-align: center;
  }

  .left-section {
    align-items: center;
  }

  .brand-name {
    font-size: 3rem;
  }

  .subtext1 {
    font-size: 1.2rem;
  }

  .right-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .otp-card {
    max-width: 380px;
    width: 100%;
  }

  .otp-card,
  .otp-label,
  .link-line,
  .link-line2 {
    text-align: left !important;
  }
}

/* ---------- MOBILE (≤768px) ---------- */
@media (max-width: 768px) {

  .main-wrapper {
    padding: 1.2rem;
    background-position: center top;
  }

  .brand-name {
    font-size: 2.6rem;
  }

  .otp-card {
    max-width: 330px;
    padding: 1.6rem;
  }

  .otp-box {
    width: 48px;
    height: 48px;
    font-size: 1.35rem;
  }

  .verify-btn {
    padding: 0.8rem;
  }
}

/* ---------- SMALL MOBILE (≤480px) ---------- */
@media (max-width: 480px) {

  .brand-name {
    font-size: 2.2rem;
  }

  .otp-card {
    max-width: 280px;
    padding: 1.3rem;
  }

  .otp-box {
    width: 42px;
    height: 42px;
  }

  .verify-btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}

    `;
    document.head.appendChild(style);
  }, []);
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 9999,
        }}
      >
        {errorMsg && (
          <div
            style={{
              background: "#D0342C",
              padding: "12px 24px",
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              fontWeight: "600",
              animation: "toastSlide 0.4s ease-out",
            }}
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              background: "#00a32a",
              padding: "12px 24px",
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              fontWeight: "600",
              animation: "toastSlide 0.4s ease-out",
            }}
          >
            {successMsg}
          </div>
        )}
      </div>
      <div className="main-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="brand-header">
              <img src={logoSrc} className="brand-icon" />
              <h1 className="brand-name">WasteZero</h1>
            </div>
            <p className="subtext1">Otp Send</p>
            <p className="subtext2">Enter otp sent to your email</p>
          </div>
          <div className="right-section">
            <div className="otp-card">
              <form onSubmit={handleSubmit}>
                <p className="otp-label">
                  Enter OTP <span className="star">*</span>
                </p>
                <div className="otp-box-container">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      maxLength="1"
                      className="otp-box"
                      value={v}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                    />
                  ))}
                </div>
                <button type="submit" className="verify-btn">Verify</button>
                <p className="link-line">
                  Go back to
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                    Login
                  </a>
                </p>
                <p className="link-line2">
                  Haven’t an Account?
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
                    Click Here To Register
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
