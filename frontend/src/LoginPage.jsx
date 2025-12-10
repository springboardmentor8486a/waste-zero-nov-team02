import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSrc from "./assets/lo.png";
import bgSrc from "./assets/download.jpg";
import ld from "./assets/lod.png";
export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const id = "login-page-styles";
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
        max-width:1200px;
        display:flex;
        gap:4rem;
        align-items:center;
        justify-content:space-between;
      }
      .left-section{flex:1;display:flex;flex-direction:column;gap:2rem}
      .brand-header{display:flex;align-items:center;gap:1rem}
      .brand-icon{width:91px;height:82px;object-fit:contain}
      .brand-name{font-size:4.5rem;font-weight:700;color:white;letter-spacing:-0.5px}
      .text-content{display:flex;flex-direction:column;gap:1rem}
      .headline{font-size:3rem;font-weight:700;color:white;line-height:1.2}
      .subtext{font-size:1.125rem;color:white;opacity:.95;line-height:1.6;max-width:500px}
      .right-section{flex:0 0 400px;display:flex;justify-content:center}
      .login-card{
        width:100%;max-width:420px;padding:2.5rem;border-radius:28px;
        background:var(--card-bg);
        backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        box-shadow:0 8px 32px rgba(0,0,0,0.12);
        border:1px solid rgba(255,255,255,0.5);
      }
      .form-wrapper{display:flex;flex-direction:column;gap:1.5rem}
      .input-group{display:flex;flex-direction:column;gap:.5rem}
      .input-label{font-size:.875rem;font-weight:600;color:var(--muted)}
      .required-mark{color:#ef4444;margin-left:.125rem}
      .password-wrapper{position:relative}
      .input-field{
        width:100%;padding:.875rem 1rem;border:1.5px solid #d1d5db;
        border-radius:50px;font-size:.9375rem;color:#1f2937;
        background:rgba(255,255,255,0.9);outline:none;transition:.3s;
      }
      .input-field:focus{
        border-color:var(--green);
        box-shadow:0 0 0 3px rgba(0,163,42,.1);
        background:#fff;
      }
      .show-password-btn{
        position:absolute;right:1rem;top:50%;transform:translateY(-50%);
        background:none;border:none;cursor:pointer;font-size:.875rem;
        font-weight:500;color:var(--link);padding:.25rem .5rem;
    }
      .options-row{display:flex;align-items:center;justify-content:space-between;margin-top:-.5rem}
      .checkbox-container{display:flex;align-items:center;gap:.5rem}
      .checkbox-input{width:1.125rem;height:1.125rem;cursor:pointer;accent-color:var(--green)}
      .checkbox-label{font-size:.875rem;color:var(--muted);cursor:pointer}
      .forgot-link{font-size:.875rem;color:var(--link);text-decoration:none;font-weight:500;cursor:pointer}
      .forgot-link:hover{text-decoration:underline;opacity:.85}
      .login-btn{
        width:100%;padding:.95rem;border:none;border-radius:50px;
        font-size:1rem;font-weight:700;color:#fff;background:var(--green);
        cursor:pointer;transition:.3s;box-shadow:0 4px 12px rgba(0,163,42,.25);
        margin-top:.5rem;
      }
      .login-btn:hover{
        background:#008c24;transform:translateY(-2px);
        box-shadow:0 6px 16px rgba(0,163,42,.35);
      }
      .register-text{text-align:center;font-size:.875rem;color:var(--muted);margin-top:.5rem}
      .register-link{color:var(--link);font-weight:600;text-decoration:none;cursor:pointer}
      .register-link:hover{text-decoration:underline;opacity:.85}
      @media (prefers-color-scheme: dark) {
        :root {
          --green:#00ff66;
          --link:#60a5fa;
          --muted:#d1d5db;
          --card-bg:rgba(20,20,20,0.55);
        }
        body {
          background:#000 !important;
          color:#f5f5f5;
        }
        .main-wrapper {
          background-image:url("${ld}") !important;
        }
        .brand-name,
        .headline,
        .subtext {
          color:#ffffff !important;
        }
        .login-card {
          background:rgba(25,25,25,0.6);
          border:1px solid rgba(255,255,255,0.1);
        }
        .input-field {
          background:rgba(45,45,45,0.9);
          color:white;
          border-color:#555;
        }
        .input-field:focus {
          background:#222;
          border-color:var(--green);
          box-shadow:0 0 0 3px rgba(0,255,102,0.2);
        }
        .input-label,
        .checkbox-label,
        .register-text {
          color:#e5e5e5 !important;
        }
        .forgot-link,
        .register-link {
          color:#60a5fa !important;
        }
        .login-btn {
          background:var(--green);
          color:black;
        }
      }
      @keyframes slideIn { from {transform:translateX(100%);opacity:0;} to {transform:translateX(0);opacity:1;} }
      @keyframes slideOut { from {transform:translateX(0);opacity:1;} to {transform:translateX(100%);opacity:0;} }
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
@media (max-width: 768px) {
  .main-wrapper {
    padding: 1rem;
    background-position: center top;
  }

  .content-container {
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    text-align: center;
  }

  .brand-icon {
    width: 64px;
    height: 58px;
  }

  .brand-name {
    font-size: 2.6rem;
  }

  .headline {
    font-size: 2rem;
  }

  .left-section {
    align-items: center;
    text-align: center;
  }

  .right-section {
    width: 100%;
  }

  .login-card {
    width: 100%;
    max-width: 350px;
    padding: 1.8rem;
  }

  .input-field {
    padding: 0.75rem 1rem;
  }

  .login-btn {
    padding: 0.8rem;
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
@media (max-width: 480px) {
  .brand-name {
    font-size: 2.2rem;
  }

  .headline {
    font-size: 1.7rem;
  }

  .subtext {
    font-size: 0.9rem;
  }

  .login-card {
    max-width: 300px;
    padding: 1.2rem;
  }

  .input-field {
    font-size: 0.85rem;
  }

  .show-password-btn {
    font-size: 0.75rem;
  }

  /* Keep form labels aligned left */
  .login-card,
  .form-wrapper,
  .input-group,
  .input-label,
  .checkbox-label,
  .register-text {
    text-align: left !important;
  }
}


    `;
    document.head.appendChild(style);
  }, []);
  function showToast(message, bgColor = "#000") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = `
        position:fixed;
        top:20px;
        right:20px;
        display:flex;
        flex-direction:column;
        gap:10px;
        z-index:10000;
      `;
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.style.cssText = `
      background-color:${bgColor};
      color:white;
      padding:1rem 1.5rem;
      border-radius:12px;
      font-family:Inter;
      animation:slideIn .3s ease;
      min-width:200px;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideOut .3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
 const handleSubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = {
    "charan@gmail.com": {
      password: "1234",
      role: "Admin",
      name: "charan_admin",
    },
    "balaji@gmail.com": {
      password: "1234",
      role: "Volunteer",
      name: "charan_volunteer",
    },
    "charanbalaji624@gmail.com": {
      password: "1234",
      role: "NGO",
      name: "charan_ngo",
    },
  };
  if (!users[email]) {
    return showToast("✗ User not found!", "#b91c1c");
  }
  const user = users[email];
  if (user.password !== password) {
    return showToast("✗ Wrong password!", "#b91c1c");
  }
  localStorage.setItem("role", user.role);
  localStorage.setItem("name", user.name);
  showToast("✓ Login successful!", "#00A32A");
  setTimeout(() => {
    navigate("/dashboard");
  }, 800);
};
return (
    <div className="main-wrapper" role="main">
      <div className="content-container">
        <div className="left-section">
          <div className="brand-header">
            <img src={logoSrc} alt="WasteZero logo" className="brand-icon" />
            <h1 className="brand-name">WasteZero</h1>
          </div>
          <div className="text-content">
            <h2 className="headline">Login Your Account</h2>
            <p className="subtext">
              For the purpose of industry regulation, your details are required.
            </p>
          </div>
        </div>
        <div className="right-section">
          <div className="login-card" role="form">
            <form className="form-wrapper" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Email address <span className="required-mark">*</span>
                </label>
                <input id="email" type="email" className="input-field" placeholder="Enter email address" required />
              </div>
              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Password <span className="required-mark">*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter password"
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
              <div className="options-row">
                <div className="checkbox-container">
                  <input id="rememberMe" type="checkbox" className="checkbox-input" />
                  <label htmlFor="rememberMe" className="checkbox-label">Remember Me</label>
                </div>
                <a
                  href="#"
                  className="forgot-link"
                  onClick={(e) => { e.preventDefault(); navigate("/forgot"); }}
                >
                  Forget Password?
                </a>
              </div>
              <button type="submit" className="login-btn">Login Account</button>
              <p className="register-text">
                Haven't an Account?
                <a
                  href="#"
                  className="register-link"
                  onClick={(e) => { e.preventDefault(); navigate("/register"); }}
                >
                  {" "}Click Here To Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
