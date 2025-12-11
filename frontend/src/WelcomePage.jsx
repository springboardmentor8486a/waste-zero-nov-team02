import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "./assets/download.jpg";
import logoImage from "./assets/lo.png";
import ld from "./assets/lod.png";

export default function WelcomePage() {
  useEffect(() => {
    const id = "welcome-page-styles";
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
      .welcome-wrapper{
        min-height:100vh;
        width:100%;
        background-image:url("${heroImage}");
        background-size:cover;
        background-position:center;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:2rem;
      }
      .welcome-container{
        width:100%;
        max-width:1200px;
        display:flex;
        gap:4rem;
        align-items:center;
        justify-content:space-between;
      }
      .welcome-left{flex:1;display:flex;flex-direction:column;gap:2rem}
      .welcome-brand{display:flex;align-items:center;gap:1rem}
      .welcome-logo{width:91px;height:82px;object-fit:contain}
      .welcome-name{font-size:4.5rem;font-weight:700;color:white;letter-spacing:-0.5px}
      .welcome-headline{font-size:3rem;font-weight:700;color:white;line-height:1.2}
      .welcome-subtext{font-size:1.125rem;color:white;opacity:.95;line-height:1.6;max-width:520px}
      .welcome-actions{display:flex;gap:1rem;flex-wrap:wrap}
      .welcome-btn{
        padding:0.95rem 1.5rem;border:none;border-radius:50px;
        font-size:1rem;font-weight:700;cursor:pointer;transition:.3s;
        text-decoration:none;
      }
      .welcome-btn.primary{background:var(--green);color:#fff;box-shadow:0 6px 18px rgba(0,163,42,.3);}
      .welcome-btn.primary:hover{background:#008c24;transform:translateY(-2px);}
      .welcome-btn.ghost{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.35);}
      .welcome-btn.ghost:hover{background:rgba(255,255,255,0.25);transform:translateY(-2px);}
      .welcome-card{
        flex:0 0 420px;
        padding:2.5rem;
        border-radius:28px;
        background:rgba(255,255,255,0.78);
        backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        box-shadow:0 8px 32px rgba(0,0,0,0.12);
        border:1px solid rgba(255,255,255,0.6);
        display:flex;
        flex-direction:column;
        gap:1.25rem;
      }
      .welcome-card h3{margin:0;font-size:1.5rem;font-weight:700;color:#0b1727;}
      .welcome-card p{margin:0;font-size:1rem;color:#1f2937;line-height:1.5;}
      .welcome-links{display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem;}
      .welcome-link{color:var(--link);font-weight:600;text-decoration:none;cursor:pointer;}
      .welcome-link:hover{text-decoration:underline;opacity:.85;}
      .welcome-link-btn{
        padding:0.65rem 1rem;
        border-radius:14px;
        background:rgba(255,255,255,0.12);
        border:1px solid rgba(255,255,255,0.7);
        color:#ffffff;
        font-weight:700;
        text-decoration:none;
        transition:.25s ease;
        display:inline-block;
      }
      .welcome-link-btn:hover{
        background:rgba(255,255,255,0.22);
        transform:translateY(-1px);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --green:#00ff66;
          --link:#60a5fa;
          --muted:#d1d5db;
          --card-bg:rgba(20,20,20,0.55);
        }
        body { background:#000 !important; color:#f5f5f5; }
        .welcome-wrapper { background-image:url("${ld}") !important; }
        .welcome-name,.welcome-headline,.welcome-subtext { color:#ffffff !important; }
        .welcome-card { background:rgba(25,25,25,0.68); border:1px solid rgba(255,255,255,0.1); }
        .welcome-card h3 { color:#f8fafc; }
        .welcome-card p { color:#d1d5db; }
        .welcome-btn.ghost { color:#fff; border-color:rgba(255,255,255,0.3); }
      }
      @media (max-width: 1024px) {
        .welcome-container {
          flex-direction: column;
          gap: 2rem;
          text-align: center;
          padding: 1rem;
        }
        .welcome-left {
          justify-content: center;
          align-items: center;
        }
        .welcome-headline { font-size: 2.5rem; }
        .welcome-name { font-size: 3.5rem; }
        .welcome-subtext { font-size: 1rem; }
        .welcome-card { width:100%; max-width: 460px; }
      }
      @media (max-width: 640px) {
        .welcome-wrapper { padding:1.25rem; }
        .welcome-name { font-size: 2.6rem; }
        .welcome-headline { font-size: 2rem; }
        .welcome-card { padding: 1.8rem; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="welcome-wrapper" role="main">
      <div className="welcome-container">
        <div className="welcome-left">
          <div className="welcome-brand">
            <img src={logoImage} alt="WasteZero logo" className="welcome-logo" />
            <h1 className="welcome-name">WasteZero</h1>
          </div>
          <div>
            <h2 className="welcome-headline">Together for a Cleaner Tomorrow</h2>
            <p className="welcome-subtext">
              Log in or create your account to schedule pickups, track messages, and keep your info up to date.
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/register" className="welcome-btn primary">
              Get Started
            </Link>
            <Link to="/login" className="welcome-btn ghost">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="welcome-card" aria-label="Quick links">
          <h3>Pick up where you left off</h3>
          <p>Jump into your account or create one in a couple of clicks.</p>
          <div className="welcome-links">
            <Link to="/login" className="welcome-link-btn">Login</Link>
            <Link to="/register" className="welcome-link-btn">Register</Link>
            <Link to="/forgot" className="welcome-link-btn">Forgot password</Link>
          </div>
          <p style={{ marginTop: "0.5rem" }}>
            Need help? <Link to="/help" className="welcome-link">Visit support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
