import React, { useEffect, useState } from "react";
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
  Bell,
  Trash2,
  Package,
  CheckCircle2,
  Clock
} from "lucide-react";
import "./App.css";

import ActivityFeed from "./components/ActivityFeed";
import api from "./utils/api";

const logo = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(
    localStorage.getItem("dashDark") === "true"
  );

  const [messagesCount, setMessagesCount] = useState(0);

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "volunteer";
  const firstLetter = name.charAt(0).toUpperCase();

  useEffect(() => {
    let mounted = true;

    // Fetch only the summary/messages count for the top bar badge
    api
      .get("/dashboard/summary")
      .then((res) => {
        if (!mounted) return;
        const payload = res.data?.data ?? res.data ?? null;
        setMessagesCount(payload?.messages ?? 0);
      })
      .catch(() => {
        if (!mounted) return;
        setMessagesCount(0);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  const navMain = role === 'ngo' ? [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Schedule Pickup", icon: <CalendarCheck size={18} />, path: "/schedule" },
    { name: "My Pickups", icon: <Package size={18} />, path: "/my-pickups" },
    { name: "My Postings", icon: <Leaf size={18} />, path: "/opportunities" },
    { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" },
    { name: "My Impact", icon: <BarChart3 size={18} />, path: "/impact" }
  ] : [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "My Schedule", icon: <CalendarCheck size={18} />, path: "/my-schedule" },
    { name: "Impact Reports", icon: <BarChart3 size={18} />, path: "/impact" },
    { name: "Waste Pickups", icon: <Trash2 size={18} />, path: "/available-pickups" },
    { name: "Opportunities", icon: <Leaf size={18} />, path: "/opportunities" },
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

          <div className="mt-auto border-t border-gray-100 pt-4 px-2">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => navigate("/profile")}>
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                {firstLetter}
              </div>
              <div className="label overflow-hidden">
                <div className="text-sm font-bold text-gray-900 truncate">{name}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{role}</div>
              </div>
            </div>
          </div>
          <div className="dash-footer">© 2025 WasteZero</div>
        </aside>

        <main className="dash-main">
          <div className="dash-top">
            <input className="search" placeholder="Search pickups, opportunities..." />

            {/* Notification bell with badge */}
            <div style={{ position: "relative" }}>
              <Bell size={18} />
              {messagesCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "10px",
                  padding: "2px 6px",
                  lineHeight: 1,
                  minWidth: 18,
                  textAlign: "center",
                  boxSizing: "border-box"
                }}>
                  {messagesCount}
                </span>
              )}
            </div>

            <div className="avatar" onClick={() => navigate("/profile")}>{firstLetter}</div>
            <div className="avatar">{firstLetter}</div>
          </div>

          {/* REMOVED THE DUPLICATE RENDER - ONLY KEEP Outlet */}
          {/* Your router already renders Overview via Outlet when path is /dashboard */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ================= DASHBOARD OVERVIEW (fetches summary + shows activity) ================= */

export function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Volunteer";

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [sumRes, pickupRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/pickups/my")
        ]);
        if (!mounted) return;
        setData(sumRes.data?.data ?? sumRes.data);
        setPickups(pickupRes.data?.data?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading your impact...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {name}!</h1>
          <p className="text-gray-500 font-medium mt-1">Here is your impact summary for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
        </div>
        <button
          onClick={() => navigate("/available-pickups")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
        >
          <CalendarCheck size={20} />
          <span>Report Pickup</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-green-100 transition-colors" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-4 ring-8 ring-green-50/50">
              <Trash2 size={24} />
            </div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Waste Collected</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{data?.waste_kg || 125}</span>
              <span className="text-xl font-bold text-gray-500">kg</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
              <BarChart3 size={12} />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 ring-8 ring-blue-50/50">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Pickups Completed</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{data?.pickups || 14}</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
              <CalendarCheck size={12} />
              <span>+2 this week</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-yellow-100 transition-colors" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4 ring-8 ring-yellow-50/50">
              <Clock size={24} />
            </div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Hours Volunteered</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">{data?.hours || 28}</span>
              <span className="text-xl font-bold text-gray-500">hrs</span>
            </div>
            <div className="mt-4 text-[10px] font-bold text-gray-400 italic">Target: 30 hrs/mo</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Upcoming Pickups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Upcoming Scheduled Pickups</h2>
              <button
                onClick={() => navigate("/my-schedule")}
                className="text-xs font-black text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors"
              >
                View All
              </button>
            </div>

            {pickups.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <CalendarCheck size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold">No upcoming pickups.</p>
                <button onClick={() => navigate("/available-pickups")} className="text-green-600 text-sm font-bold mt-2">Find a pickup opportunity →</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                      <th className="text-left pb-4">Event</th>
                      <th className="text-left pb-4">Date & Time</th>
                      <th className="text-left pb-4">Location</th>
                      <th className="text-right pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pickups.map(p => (
                      <tr key={p._id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                              <Package size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 capitalize">{p.wasteTypes.join(", ")}</div>
                              <div className="text-[10px] text-gray-400 font-bold">Waste Collection</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-gray-600 text-sm">
                          <div>{p.scheduledDate}</div>
                          <div className="text-[10px] text-gray-400">{p.timeSlot}</div>
                        </td>
                        <td className="py-4 text-sm text-gray-500 font-medium">{p.location?.address}</td>
                        <td className="py-4 text-right">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${p.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                            p.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                            }`}>
                            {p.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar content: Activity Feed & Trends */}
        <div className="space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Contribution Trends</h2>
            <div className="h-48 flex items-end justify-between gap-1">
              {[40, 70, 45, 90].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-full bg-green-50 rounded-t-xl group relative">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full bg-green-500 rounded-t-xl hover:bg-green-600 transition-all cursor-pointer"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">WK {i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase tracking-widest">Last 30 Days Activity</p>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Recent Activity</h2>
            <ActivityFeed limit={4} />
          </div>
        </div>
      </div>
    </div>
  );
}