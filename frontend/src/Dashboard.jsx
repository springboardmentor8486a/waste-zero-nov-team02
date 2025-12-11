import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroLight from "./assets/lod.png";
import logo from "./assets/lo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
  );

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "Volunteer";

  useEffect(() => {
    const id = "dashboard-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      :root { 
        --green:#00a32a; 
        --muted:#374151; 
        --card-light:rgba(255,255,255,0.92);
        --card-dark:rgba(18,18,18,0.8);
        --border-light:rgba(0,0,0,0.08);
        --border-dark:rgba(255,255,255,0.12);
      }
      html,body,#root{height:100%}
      .dash-shell{
        min-height:100vh;
        width:100%;
        background-image:url("${heroLight}");
        background-size:cover;
        background-position:center;
        display:flex;
        justify-content:center;
        padding:1.5rem;
      }
      .dash-layout{
        width:100%;
        max-width:1200px;
        display:grid;
        grid-template-columns:260px 1fr;
        gap:1.25rem;
        align-items:start;
      }
      .dash-panel{
        background:var(--card-light);
        border:1px solid var(--border-light);
        box-shadow:0 8px 26px rgba(0,0,0,0.12);
        border-radius:18px;
        padding:1.25rem;
        backdrop-filter:blur(14px);
      }
      .dash-main{
        background:var(--card-light);
        border:1px solid var(--border-light);
        box-shadow:0 12px 32px rgba(0,0,0,0.12);
        border-radius:18px;
        padding:1.5rem;
        backdrop-filter:blur(14px);
      }
      .dash-header{
        display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem;
      }
      .dash-logo{width:42px;height:42px;border-radius:10px;}
      .dash-title{margin:0;font-size:1.1rem;font-weight:800;color:#0b1727;}
      .dash-sub{margin:0;font-size:.9rem;color:var(--muted);}
      .nav-list{list-style:none;padding:0;margin:1rem 0;display:flex;flex-direction:column;gap:.35rem;}
      .nav-btn{
        width:100%;text-align:left;border:none;background:transparent;
        padding:.75rem .9rem;border-radius:12px;font-weight:600;
        color:#111827;cursor:pointer;transition:.2s;
        display:flex;align-items:center;gap:.6rem;
      }
      .nav-btn:hover{background:rgba(0,163,42,0.08);transform:translateX(2px);}
      .nav-btn.active{background:rgba(0,163,42,0.14);color:#0a6b1d;border:1px solid rgba(0,163,42,0.2);}
      .tag-pill{
        display:inline-flex;align-items:center;gap:.5rem;
        padding:.55rem 1rem;border-radius:999px;
        background:rgba(0,163,42,0.12);color:#0f5132;font-weight:700;
        border:1px solid rgba(0,163,42,0.2);width:max-content;
      }
      .hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem;}
      .btn{
        padding:0.85rem 1.3rem;border-radius:12px;font-weight:700;
        border:none;cursor:pointer;transition:.2s;text-decoration:none;display:inline-flex;align-items:center;gap:.4rem;
      }
      .btn.primary{background:var(--green);color:white;box-shadow:0 10px 26px rgba(0,163,42,0.26);}
      .btn.primary:hover{background:#008c24;transform:translateY(-2px);}
      .btn.ghost{
        background:rgba(255,255,255,0.4);
        border:1px solid rgba(0,0,0,0.08);
        color:#0b1727;
      }
      .btn.ghost:hover{background:rgba(255,255,255,0.6);}
      .panel-title{margin:0 0 .2rem;font-size:1.3rem;font-weight:800;color:#0b1727;}
      .panel-sub{margin:0 0 1.2rem;color:var(--muted);}
      .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;}
      .field{display:flex;flex-direction:column;gap:.35rem;}
      .label{font-weight:700;color:#111827;}
      .input{
        padding:.85rem 1rem;border-radius:12px;border:1px solid var(--border-light);
        background:rgba(255,255,255,0.7);font-size:.95rem;
      }
      .input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 3px rgba(0,163,42,0.18);}
      .mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
      .mini-card{
        padding:1rem;border-radius:14px;
        background:rgba(255,255,255,0.75);
        border:1px solid var(--border-light);
        box-shadow:0 6px 18px rgba(0,0,0,0.08);
        text-decoration:none;
      }
      .mini-card h4{margin:0 0 .35rem;color:#0b1727;}
      .mini-card p{margin:0;color:var(--muted);}
      .dash-dark .dash-panel,
      .dash-dark .dash-main{
        background:var(--card-dark);
        border:1px solid var(--border-dark);
        box-shadow:0 14px 32px rgba(0,0,0,0.4);
      }
      .dash-dark .dash-title,
      .dash-dark .panel-title,
      .dash-dark .label,
      .dash-dark h4{color:#f8fafc;}
      .dash-dark .dash-sub,
      .dash-dark .panel-sub,
      .dash-dark p,
      .dash-dark .mini-card p,
      .dash-dark .nav-btn{color:#d1d5db;}
      .dash-dark .btn.ghost{
        background:rgba(255,255,255,0.08);
        border:1px solid rgba(255,255,255,0.2);
        color:#f8fafc;
      }
      .dash-dark .mini-card{
        background:rgba(30,30,30,0.9);
        border-color:var(--border-dark);
      }
      .dash-dark .input{
        background:rgba(28,28,28,0.9);
        border-color:var(--border-dark);
        color:#e5e7eb;
      }
      .dash-dark .input:focus{border-color:#00ff66;box-shadow:0 0 0 3px rgba(0,255,102,0.22);}
      @media(max-width:960px){
        .dash-layout{grid-template-columns:1fr;}
      }
      @media(max-width:640px){
        .dash-shell{padding:1rem;}
        .btn{width:100%;justify-content:center;}
      }
    `;
    document.head.appendChild(style);
  }, []);

  const modeClass = isDarkMode ? "dash-dark" : "dash-light";

  return (
    <div className={`dash-shell ${modeClass}`}>
      <div className="dash-layout">
        <aside className="dash-panel">
          <div className="dash-header">
            <img src={logo} alt="logo" className="dash-logo" />
            <div>
              <p className="dash-title">WasteZero</p>
              <p className="dash-sub">{role}</p>
            </div>
          </div>
          <ul className="nav-list">
            <li><button className="nav-btn active">Dashboard</button></li>
            <li><button className="nav-btn">Schedule Pickup</button></li>
            <li><button className="nav-btn">Opportunities</button></li>
            <li><button className="nav-btn">Messages</button></li>
            <li><button className="nav-btn">My Impact</button></li>
          </ul>
          <p className="dash-sub" style={{ marginTop: "1rem", marginBottom: ".35rem", fontWeight: 700 }}>Settings</p>
          <ul className="nav-list" style={{ marginTop: 0 }}>
            <li><button className="nav-btn" onClick={() => navigate("/profile")}>My Profile</button></li>
            <li><button className="nav-btn">Settings</button></li>
            <li><button className="nav-btn">Help & Support</button></li>
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginTop: "1rem" }}>
            <span className="dash-sub" style={{ fontWeight: 700 }}>Dark Mode</span>
            <label className="switch" style={{ position: "relative", width: "44px", height: "24px" }}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIsDarkMode(next);
                  localStorage.setItem("darkMode", String(next));
                }}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: isDarkMode ? "#00ff66" : "#d1d5db",
                  borderRadius: "999px",
                  transition: ".2s"
                }}
              />
              <span
                style={{
                  position: "absolute",
                  height: "18px",
                  width: "18px",
                  left: isDarkMode ? "22px" : "4px",
                  bottom: "3px",
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  transition: ".2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
                }}
              />
            </label>
          </div>
        </aside>

        <main className="dash-main">
          <div className="tag-pill">
            <span role="img" aria-label="leaf">🍃</span>
            {role}
          </div>
          <div style={{ marginTop: ".75rem" }}>
            <h2 className="panel-title" style={{ marginBottom: ".4rem" }}>Hello, {name}</h2>
            <p className="panel-sub">
              Manage your account information and settings. Toggle dark mode above to match your preference.
            </p>
          </div>

          <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
            <section style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }} className={modeClass}>
              <div style={{ display: "flex", gap: ".75rem", marginBottom: "1rem" }}>
                <button className="btn ghost" style={{ borderRadius: 10 }}>Profile</button>
                <button className="btn ghost" style={{ borderRadius: 10, opacity: 0.85 }}>Password</button>
              </div>
              <div className="form-grid">
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
              <div style={{ marginTop: "1rem" }}>
                <button className="btn primary">Change Password</button>
              </div>
            </section>

            <section>
              <h3 className="panel-title" style={{ fontSize: "1.1rem" }}>Quick Links</h3>
              <div className="mini-grid">
                <Link to="/messages" className="mini-card">
                  <h4>Messages</h4>
                  <p>Check updates from your team and NGOs.</p>
                </Link>
                <Link to="/impact" className="mini-card">
                  <h4>Impact</h4>
                  <p>View your environmental footprint.</p>
                </Link>
                <Link to="/opportunities" className="mini-card">
                  <h4>Volunteer</h4>
                  <p>Find nearby opportunities to help.</p>
                </Link>
                <Link to="/settings" className="mini-card">
                  <h4>Settings</h4>
                  <p>Tweak preferences and alerts.</p>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
