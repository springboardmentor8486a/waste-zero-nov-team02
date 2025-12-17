import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Leaf,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Bell
} from "lucide-react";
import "./App.css";

const logo = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(
    localStorage.getItem("dashDark") === "true"
  );

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "volunteer";
  const firstLetter = name.charAt(0).toUpperCase();

  useEffect(() => {
    const id = "dashboard-inline-styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }

    style.textContent = `
      .dash-shell{min-height:100vh;display:flex;color:${isDark ? "#e5e7eb" : "#111827"};background:url("/image.png") center/cover no-repeat fixed;}
      .dash-overlay{flex:1;display:flex;background:${isDark ? "rgba(17,24,39,0.86)" : "rgba(255,255,255,0.9)"};}
      .dash-sidebar{width:220px;background:${isDark ? "#0f172a" : "#fff"};border-right:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};padding:1rem;display:flex;flex-direction:column;gap:.9rem;}
      .dash-brand{display:flex;gap:.6rem;align-items:center;}
      .dash-brand img{width:34px;height:32px;}
      .dash-role{font-size:.85rem;opacity:.7;}
      .dash-section{font-size:.7rem;text-transform:uppercase;opacity:.6;margin:.6rem .3rem .2rem;}
      .dash-item{display:flex;align-items:center;gap:.6rem;padding:.6rem .75rem;border-radius:10px;cursor:pointer;}
      .dash-item:hover{background:${isDark ? "#1f2937" : "#f3f4f6"};}
      .dash-item.active{background:${isDark ? "#065f46" : "#e8f5ee"};color:${isDark ? "#fff" : "#065f46"};}
      .dash-main{flex:1;padding:1.5rem 1.8rem;overflow:auto;}
      .dash-top{display:flex;gap:1rem;align-items:center;margin-bottom:1.2rem;}
      .search{flex:1;padding:.7rem 1rem;border-radius:12px;border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};background:${isDark ? "#0f172a" : "#fff"};}
      .avatar{width:36px;height:36px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;}
      .mode-toggle{display:flex;gap:.5rem;align-items:center;padding:.55rem .75rem;border-radius:10px;cursor:pointer;background:${isDark ? "#1f2937" : "#f3f4f6"};}
      .dash-footer{margin-top:auto;font-size:.75rem;opacity:.6;}
      .card{padding:1rem;border-radius:12px;border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};background:${isDark ? "#0b1220" : "#fff"};}
      .card-title{font-weight:700;margin-bottom:.4rem;}
      .muted{opacity:.65;font-size:.9rem;}
    `;
  }, [isDark]);

  const isActive = (path) => location.pathname === path;

  const navMain = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Schedule Pickup", icon: <CalendarCheck size={18} />, path: "/schedule" },
    { name: "Opportunities", icon: <Leaf size={18} />, path: "/opportunities" },
    { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" },
    { name: "My Impact", icon: <BarChart3 size={18} />, path: "/impact" }
  ];

  const navSettings = [
    { name: "My Profile", icon: <User size={18} />, path: "/profile" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
    { name: "Help & Support", icon: <HelpCircle size={18} />, path: "/help" }
  ];

  return (
    <div className="dash-shell">
      <div className="dash-overlay">
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <img src={logo} alt="logo" />
            <div>
              <b>WasteZero</b>
              <div className="dash-role">{role}</div>
            </div>
          </div>

          <div className="dash-section">Main Menu</div>
          {navMain.map(i => (
            <div
              key={i.name}
              className={`dash-item ${isActive(i.path) ? "active" : ""}`}
              onClick={() => navigate(i.path)}
            >
              {i.icon} {i.name}
            </div>
          ))}

          <div className="dash-section">Settings</div>
          {navSettings.map(i => (
            <div
              key={i.name}
              className={`dash-item ${isActive(i.path) ? "active" : ""}`}
              onClick={() => navigate(i.path)}
            >
              {i.icon} {i.name}
            </div>
          ))}

          <div
            className="mode-toggle"
            onClick={() => {
              const v = !isDark;
              setIsDark(v);
              localStorage.setItem("dashDark", String(v));
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </div>

          <div
            className="dash-item"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            <LogOut size={18} /> Logout
          </div>

          <div className="dash-footer">© 2025 WasteZero</div>
        </aside>

        <main className="dash-main">
          <div className="dash-top">
            <input className="search" placeholder="Search pickups, opportunities..." />
            <Bell size={18} />
            <div className="avatar">{firstLetter}</div>
          </div>

          {/* ✅ SHOW OVERVIEW ONLY ON /dashboard */}
          {location.pathname === "/dashboard" && <Overview />}

          {/* Other pages */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ================= HONEST OVERVIEW ================= */

export function Overview() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div className="card">
        <div className="card-title">Account Overview</div>
        <p className="muted">
          This dashboard displays real data only. No activity has been recorded yet.
        </p>
      </div>

      <div className="card">
        <div className="card-title">Current Status</div>
        <ul className="muted" style={{ lineHeight: 1.8 }}>
          <li>• Pickups: none scheduled</li>
          <li>• Opportunities: none joined / posted</li>
          <li>• Messages: none</li>
          <li>• Impact: not calculated</li>
        </ul>
      </div>

      <div className="card">
        <div className="card-title">What you can do next</div>
        <p className="muted">
          Use the menu on the left to begin scheduling pickups, exploring opportunities,
          or updating your profile.
        </p>
      </div>
    </div>
  );
}
