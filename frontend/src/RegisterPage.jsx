import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "./assets/lo.png";
import bgSrc from "./assets/download.jpg";
import darkBg from "./assets/lod.png";
export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [startTimer, setStartTimer] = useState(false);
  const [username, setUsername] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    const id = "register-page-styles";
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
      .main-wrapper{
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
      .content-container{
        width:100%;
        max-width:1300px;
        display:flex;
        gap:4rem;
        align-items:center;
        justify-content:space-between;
      }
      .left-section{
        flex:1;
        display:flex;
        flex-direction:column;
        gap:2rem;
      }
      .brand-header{display:flex;align-items:center;gap:1rem}
      .brand-icon{width:91px;height:82px}
      .brand-name{font-size:4rem;font-weight:700;color:white}
      .headline{font-size:2.8rem;font-weight:700;color:white}
      .subtext{font-size:1.1rem;color:white;opacity:.95;max-width:420px}
      .right-section{flex:0 0 450px;display:flex;justify-content:center}
      .register-card{
        width:100%;
        padding:2.5rem;
        border-radius:28px;
        background:var(--card-bg);
        backdrop-filter:blur(20px);
        box-shadow:0 8px 32px rgba(0,0,0,0.12);
        border:1px solid rgba(255,255,255,0.5);
      }
      .form-wrapper{display:flex;flex-direction:column;gap:1.3rem}
      .input-group{display:flex;flex-direction:column;gap:.4rem}
      .input-label{font-size:.875rem;font-weight:600;color:var(--muted)}
      .required{color:#ef4444;margin-left:4px}
      .password-wrapper{position:relative}
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
        background:#fff;
      }
      .select-field {
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-color: #ffffff;
        border: 1.5px solid #d1d5db;
        border-radius: 50px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666666' viewBox='0 0 20 20'%3E%3Cpath d='M6 7l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: 18px;
        background-position: right 1rem center;
        padding: .9rem 2.8rem .9rem 1rem;
        color: #1f2937;
      }
      .select-field::-ms-expand {
        display: none !important;
      }
      .select-field:focus {
        border-color: var(--green);
        box-shadow: 0 0 0 3px rgba(0,163,42,.1);
      }
      .show-pass-btn{
        position:absolute;
        right:1rem;
        top:50%;
        transform:translateY(-50%);
        background:none;
        border:none;
        color:var(--link);
        font-size:.85rem;
        font-weight:600;
        cursor:pointer;
      }
      .register-btn{
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
      }
      .bottom-text{text-align:center;font-size:.9rem;color:var(--muted)}
      .bottom-link{color:var(--link);font-weight:600;cursor:pointer}
      @media (prefers-color-scheme: dark) {
        :root {
          --green:#00ff66;
          --link:#60a5fa;
          --muted:#d1d5db;
          --card-bg:rgba(20,20,20,0.55);
        }
        body { background:#000 !important; color:#f5f5f5; }
        .main-wrapper {
          background-image:url("${darkBg}") !important;
        }
        .register-card {
          background:rgba(25,25,25,0.6);
          border:1px solid rgba(255,255,255,0.1);
        }
        .input-field {
          background:#333 !important;
          color:white !important;
          border-color:#555 !important;
        }
        .show-pass-btn {
          color:#60a5fa !important;
        }
        .select-field {
          background-color:#333 !important;
          border-color:#555 !important;
          color:white !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2360a5fa' viewBox='0 0 20 20'%3E%3Cpath d='M6 7l4 4 4-4'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-size: 18px !important;
          background-position: right 1rem center !important;
        }
      }
        /* ------------------ TABLET (≤1024px) ------------------ */
@media (max-width: 1024px) {
  .content-container {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .left-section {
    align-items: center;
  }

  .brand-name {
    font-size: 3rem;
  }

  .headline {
    font-size: 2.2rem;
  }

  .subtext {
    font-size: 1rem;
  }

  .right-section {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .register-card {
    max-width: 420px;
    width: 100%;
    text-align: left !important;
  }

  .input-group,
  .input-label {
    text-align: left !important;
  }
}

/* ------------------ MOBILE (≤768px) ------------------ */
@media (max-width: 768px) {
  .main-wrapper {
    padding: 1.2rem;
    background-position: center top;
  }

  .content-container {
    gap: 1.5rem;
  }

  .brand-icon {
    width: 70px;
    height: 62px;
  }

  .brand-name {
    font-size: 2.4rem;
  }

  .headline {
    font-size: 1.9rem;
  }

  .register-card {
    padding: 2rem;
    max-width: 360px;
  }

  .input-field {
    padding: 0.8rem 1rem;
  }

  .register-btn {
    padding: 0.85rem;
    font-size: 0.95rem;
  }
}

/* ------------------ SMALL MOBILE (≤480px) ------------------ */
@media (max-width: 480px) {
  .brand-name {
    font-size: 2rem;
  }

  .headline {
    font-size: 1.6rem;
  }

  .register-card {
    max-width: 300px;
    padding: 1.4rem;
  }

  .input-field {
    font-size: 0.85rem;
  }

  .show-pass-btn {
    font-size: 0.75rem;
  }

  .register-btn {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}

    `;

    document.head.appendChild(style);
  }, []);
  useEffect(() => {
    let interval;
    if (startTimer && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [startTimer, timer]);
  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);
  const sendOtp = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      setErrorMsg("✗ Enter a valid email address");
      return;
    }
    setIsOtpSent(true);
    setStartTimer(true);
    setTimer(60);
    setSuccessMsg("✓ OTP Sent Successfully");
  };
  const verifyOtp = () => {
    if (otp === "1234") {
      setIsEmailVerified(true);
      setSuccessMsg("✓ OTP Verified Successfully");
    } else {
      setErrorMsg("✗ Incorrect OTP");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "charan") {
      setErrorMsg("✗ Username already exists");
      return;
    }
    const pass = document.getElementById("pass1").value;
    const conf = document.getElementById("pass2").value;
    if (pass !== conf) {
      setErrorMsg("✗ Passwords do not match");
      return;
    }
    setSuccessMsg("✓ Account Registered Successfully!");
    setTimeout(() => navigate("/login"), 2000);
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
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
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
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
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
            <h2 className="headline">Register Your Account</h2>
            <p className="subtext">
              For the purpose of industry regulation, your details are required.
            </p>
          </div>
          <div className="right-section">
            <div className="register-card">
              <form className="form-wrapper" onSubmit={handleSubmit}>
                {!isEmailVerified && (
                  <div className="input-group">
                    <label className="input-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {!isOtpSent && (
                      <button
                        type="button"
                        className="register-btn"
                        style={{
                          marginTop: "20px",
                          opacity: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                            ? 1
                            : 0.6
                        }}
                        disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                        onClick={sendOtp}
                      >
                        Send OTP
                      </button>
                    )}
                    {isOtpSent && !isEmailVerified && (
                      <>
                      <label className="input-label">
                      OTP<span className="required">*</span>
                    </label>
                        <input
                          className="input-field"
                          placeholder="Enter the OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          style={{ marginTop: "20px" }}
                          required
                        />

                        {timer > 0 ? (
                          <p style={{ marginTop: "10px", color: "gray" }}>
                            Time left: {timer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            className="register-btn"
                            style={{
                              marginTop: "15px",
                              background: "#0077cc"
                            }}
                            onClick={() => {
                              setTimer(60);
                              setStartTimer(true);
                              setOtp("");
                              setSuccessMsg("✓ OTP Sent Successfully");
                            }}
                          >
                            Resend OTP
                          </button>
                        )}

                        <button
                          type="button"
                          className="register-btn"
                          style={{ marginTop: "20px" }}
                          onClick={verifyOtp}
                        >
                          Verify OTP
                        </button>
                      </>
                    )}
                  </div>
                )}
                {isEmailVerified && (
                  <>
                    <div className="input-group">
                      <label className="input-label">Full name <span className="required">*</span></label>
                      <input
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Username <span className="required">*</span></label>
                      <input
                        className="input-field"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Password <span className="required">*</span></label>
                      <div className="password-wrapper">
                        <input
                          id="pass1"
                          type={showPass1 ? "text" : "password"}
                          className="input-field"
                          placeholder="Create a password"
                          required
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
                      <label className="input-label">Confirm Password <span className="required">*</span></label>
                      <div className="password-wrapper">
                        <input
                          id="pass2"
                          type={showPass2 ? "text" : "password"}
                          className="input-field"
                          placeholder="Confirm your password"
                          required
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
                      <label className="input-label">Role <span className="required">*</span></label>
                      <select className="input-field select-field" required>
                        <option value="">Select Your Role</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="ngo">NGO</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button className="register-btn">Register Account</button>
                  </>
                )}
                <p className="bottom-text">
                  Have an Account?
                  <span
                    className="bottom-link"
                    onClick={() => navigate("/login")}
                  >
                    {" "}
                    Click Here To Login
                  </span>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
