import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroLight from "./assets/lod.png";
import logo from "./assets/lo.png";

const Profile = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
  );

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "Volunteer";

  useEffect(() => {
    const id = "profile-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      :root {
        --green:#00a32a;
        --muted:#374151;
        --card-light:rgba(255,255,255,0.92);
        --card-dark:rgba(18,18,18,0.82);
        --border-light:rgba(0,0,0,0.08);
        --border-dark:rgba(255,255,255,0.12);
      }
      html,body,#root{height:100%}
      .profile-shell{
        min-height:100vh;
        width:100%;
        background-image:url("${heroLight}");
        background-size:cover;
        background-position:center;
        display:flex;
        justify-content:center;
        padding:1.5rem;
      }
      .profile-card{
        width:100%;
        max-width:1100px;
        background:var(--card-light);
        border:1px solid var(--border-light);
        box-shadow:0 12px 32px rgba(0,0,0,0.12);
        border-radius:18px;
        padding:1.75rem;
        backdrop-filter:blur(14px);
      }
      .profile-header{
        display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem;
      }
      .profile-logo{width:52px;height:52px;border-radius:12px;}
      .profile-title{margin:0;font-size:1.35rem;font-weight:800;color:#0b1727;}
      .profile-sub{margin:0;color:var(--muted);}
      .pill{
        display:inline-flex;align-items:center;gap:.5rem;
        padding:.55rem 1rem;border-radius:999px;
        background:rgba(0,163,42,0.12);color:#0f5132;
        border:1px solid rgba(0,163,42,0.2);font-weight:700;
      }
      .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;}
      .field{display:flex;flex-direction:column;gap:.35rem;}
      .label{font-weight:700;color:#111827;}
      .input{
        padding:.85rem 1rem;border-radius:12px;border:1px solid var(--border-light);
        background:rgba(255,255,255,0.75);font-size:.95rem;
      }
      .input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 3px rgba(0,163,42,0.18);}
      .btn-row{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem;}
      .btn{
        padding:0.9rem 1.4rem;border-radius:12px;font-weight:700;
        border:none;cursor:pointer;transition:.2s;text-decoration:none;
      }
      .btn.primary{background:var(--green);color:#fff;box-shadow:0 10px 26px rgba(0,163,42,0.26);}
      .btn.primary:hover{background:#008c24;transform:translateY(-2px);}
      .btn.ghost{
        background:rgba(255,255,255,0.5);
        border:1px solid rgba(0,0,0,0.08);
        color:#0b1727;
      }
      .btn.ghost:hover{background:rgba(255,255,255,0.65);}
      .profile-dark .profile-card{
        background:var(--card-dark);
        border:1px solid var(--border-dark);
        box-shadow:0 14px 32px rgba(0,0,0,0.4);
      }
      .profile-dark .profile-title,
      .profile-dark .label{color:#f8fafc;}
      .profile-dark .profile-sub,
      .profile-dark .pill,
      .profile-dark p{color:#d1d5db;}
      .profile-dark .input{
        background:rgba(26,26,26,0.9);
        border-color:var(--border-dark);
        color:#e5e7eb;
      }
      .profile-dark .input:focus{border-color:#00ff66;box-shadow:0 0 0 3px rgba(0,255,102,0.22);}
      .profile-dark .btn.ghost{
        background:rgba(255,255,255,0.08);
        border:1px solid rgba(255,255,255,0.2);
        color:#f8fafc;
      }
      @media(max-width:640px){
        .profile-shell{padding:1rem;}
        .btn{width:100%;text-align:center;}
      }
    `;
    document.head.appendChild(style);
  }, []);

  const modeClass = isDarkMode ? "profile-dark" : "profile-light";

  return (
    <div className={`profile-shell ${modeClass}`}>
      <div className="profile-card">
        <div className="profile-header">
          <img src={logo} alt="WasteZero" className="profile-logo" />
          <div>
            <p className="profile-title">My Profile</p>
            <p className="profile-sub">Manage your account information and settings</p>
          </div>
          <div className="pill" style={{ marginLeft: "auto" }}>{role}</div>
        </div>

        <div className="btn-row" style={{ marginTop: 0, marginBottom: "1rem" }}>
          <Link to="/dashboard" className="btn ghost" style={{ textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: "1.25rem", display: "flex", gap: ".6rem" }}>
          <button className="btn ghost" style={{ borderRadius: 10 }}>Profile</button>
          <button className="btn ghost" style={{ borderRadius: 10, opacity: 0.85 }}>Password</button>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="label">First Name</label>
            <input className="input" type="text" defaultValue={name.split(" ")[0] || name} />
          </div>
          <div className="field">
            <label className="label">Last Name</label>
            <input className="input" type="text" defaultValue={name.split(" ")[1] || ""} />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label className="label">Location</label>
            <input className="input" type="text" placeholder="City, Country" />
          </div>
          <div className="field">
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="Enter current password" />
          </div>
          <div className="field">
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Enter new password" />
          </div>
          <div className="field">
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Re-enter new password" />
          </div>
        </div>

        <div className="btn-row">
          <button className="btn primary">Save Changes</button>
          <button
            className="btn ghost"
            onClick={() => {
              const next = !isDarkMode;
              setIsDarkMode(next);
              localStorage.setItem("darkMode", String(next));
            }}
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

