import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Leaf,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Menu,
  Moon,
  Sun,
  LogOut,
  Bell,
  Trash2,
  Package,
  CheckCircle2,
  Clock,
  Bot,
  RotateCcw,
  X,
  Save,
  AlertCircle,
  Check,
  Milk,
  Container,
  FileText,
  CircuitBoard,
  Edit
} from "lucide-react";
import "./App.css";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import ActivityFeed from "./components/ActivityFeed";
import ChatAssistant from "./components/ChatAssistant";
import api from "./utils/api";
import io from "socket.io-client";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const logo = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // sidebar expands on hover via CSS

  const [messagesCount, setMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const name = localStorage.getItem("fullName") || localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role") || "volunteer";
  const email = localStorage.getItem("userEmail") || "";
  const firstLetter = name.charAt(0).toUpperCase();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      console.log('🔔 Notifications fetched:', res.data.data);
      setNotifications(res.data.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Fetch summary
    api.get("/dashboard/summary")
      .then((res) => {
        if (!mounted) return;
        const payload = res.data?.data ?? res.data ?? null;
        setMessagesCount(payload?.messages ?? 0);
      })
      .catch(() => {
        if (!mounted) return;
        setMessagesCount(0);
      });

    fetchNotifications();

    // Fetch user profile for avatar
    api.get("/profile")
      .then(res => {
        if (!mounted) return;
        setUserProfile(res.data.user);
      })
      .catch(err => console.error("Error fetching profile:", err));

    // Polling for notifications (optional, but good for demo/updates)
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle outside clicks to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Profile Dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      // Notification Dropdown
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showProfileDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotifications]);

  const handleRescheduleRespond = async (pickupId, action, notificationId) => {
    try {
      setLoadingAction(pickupId);
      await api.put(`/pickups/${pickupId}/reschedule-respond`, { action });
      await api.patch(`/notifications/${notificationId}/read`);

      fetchNotifications();
      showToast(`Request ${action}ed successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to respond to request", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put("/profile", { fullName: editedName, email: editedEmail, phoneNumber: editedPhone });
      // Update localStorage
      localStorage.setItem("fullName", editedName);
      // Update state
      setUserProfile(prev => prev ? { ...prev, fullName: editedName } : null);
      setIsEditingProfile(false);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getProfileImage = () => {
    if (!userProfile) return null;

    // 1. Custom local uploads (User's explicit choice)
    if (role === 'ngo' && userProfile.ngoDetails?.logo && userProfile.ngoDetails.logo !== 'no-photo.jpg') {
      return `http://localhost:5000${userProfile.ngoDetails.logo}`;
    }
    if (role === 'volunteer' && userProfile.volunteerDetails?.avatar && userProfile.volunteerDetails.avatar !== 'no-photo.jpg') {
      return `http://localhost:5000${userProfile.volunteerDetails.avatar}`;
    }

    // 2. Google Profile Picture (The "By Default" source)
    if (userProfile.googleProfilePic) {
      return userProfile.googleProfilePic;
    }

    return null;
  };

  const profileImg = getProfileImage();

  const handleDeleteNotification = async (id) => {
    try {
      console.log('🗑️ Attempting to delete notification:', id);
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      showToast("Notification removed");
    } catch (err) {
      console.error("❌ Error deleting notification:", err.response?.data || err.message);
      showToast("Failed to delete notification", "error");
    }
  };

  useEffect(() => {
    const id = "dashboard-inline-styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      .dash-shell{height:100vh;display:flex;color:#111827;background:url("/image.png") center/cover no-repeat fixed;overflow:hidden;}
      .dash-overlay{flex:1;display:flex;background:transparent;height:100%;}
      .dash-sidebar{width:72px;background:#fff;border-right:1px solid #e5e7eb;padding:1rem;display:flex;flex-direction:column;gap:.9rem;transition:width .18s;overflow-y:auto;overflow-x:hidden;height:100%;z-index:100;}
      .dash-sidebar:hover{width:220px}
      .dash-sidebar::-webkit-scrollbar { width: 4px; }
      .dash-sidebar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      .dash-brand{display:flex;gap:.6rem;align-items:center;}
      .dash-brand img{width:34px;height:32px;}
      .dash-role{font-size:.85rem;opacity:.7;}
      .dash-section{font-size:.7rem;text-transform:uppercase;opacity:.6;margin:.6rem .3rem .2rem;}
      .dash-item{display:flex;align-items:center;gap:.6rem;padding:.6rem .75rem;border-radius:10px;cursor:pointer;}
      .dash-item:hover{background:#f3f4f6;}
      .dash-item.active{background:rgba(18, 53, 36, 0.1);color:#123524;}
      .dash-main{flex:1;padding:1.5rem 1.8rem;overflow-y:auto;height:100%;}
      .dash-top{display:flex;gap:1rem;align-items:center;margin-bottom:1.2rem;justify-content: flex-end;}
      .avatar{width:36px;height:36px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;overflow:hidden;cursor:pointer;}
      .avatar img{width:100%;height:100%;object-fit:cover;}
      .notification-dot{position:absolute;top:-6px;right:-6px;background:red;color:white;border-radius:50%;fontSize:10px;padding:2px 6px;lineHeight:1;minWidth:18;textAlign:center;boxSizing:border-box;}
      .dash-footer{margin-top:auto;font-size:.75rem;opacity:.6;}
      
      /* hide labels by default; show on sidebar hover */
      .dash-sidebar .label{display:none}
      .dash-sidebar:hover .label{display:inline}
      .dash-sidebar .dash-role{display:none}
      .dash-sidebar:hover .dash-role{display:block}
      .dash-sidebar .dash-brand div{display:none}
      .dash-sidebar:hover .dash-brand div{display:block}
      .dash-sidebar .dash-section{display:none}
      .dash-sidebar:hover .dash-section{display:block}

      @keyframes bounce-in {
        0% { transform: translateY(100px); opacity: 0; }
        60% { transform: translateY(-10px); opacity: 1; }
        100% { transform: translateY(0); }
      }
      .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    `;
  }, []);

  const isActive = (path) => location.pathname === path;

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Socket connection
    const token = localStorage.getItem("token");
    if (token) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000", {
        auth: { token }
      });
      setSocket(newSocket);

      newSocket.on("notification", (notif) => {
        setNotifications(prev => [notif, ...prev]);
        showToast(notif.message, "info");
      });

      return () => newSocket.close();
    }
  }, []);

  const navMain = role === 'admin' ? [
    { name: "Admin Overview", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
    { name: "User Management", icon: <User size={18} />, path: "/admin/users" },
    { name: "Opportunity Control", icon: <Leaf size={18} />, path: "/admin/opportunities" },
    { name: "Analytics & Reports", icon: <BarChart3 size={18} />, path: "/admin/analytics" },
    { name: "System Logs", icon: <FileText size={18} />, path: "/admin/logs" }
  ] : role === 'ngo' ? [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Schedule Pickup", icon: <CalendarCheck size={18} />, path: "/schedule" },
    { name: "My Pickups", icon: <Package size={18} />, path: "/my-pickups" },
    { name: "My Postings", icon: <Leaf size={18} />, path: "/opportunities" },
    { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" },
    { name: "My Impact", icon: <BarChart3 size={18} />, path: "/impact" }
  ] : [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Match Suggestions", icon: <CheckCircle2 size={18} />, path: "/suggested-matches" },
    { name: "My Schedule", icon: <CalendarCheck size={18} />, path: "/my-schedule" },
    { name: "Impact Reports", icon: <BarChart3 size={18} />, path: "/impact" },
    { name: "Waste Pickups", icon: <Trash2 size={18} />, path: "/available-pickups" },
    { name: "Opportunities", icon: <Leaf size={18} />, path: "/opportunities" }
  ];

  const navSettings = [
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" }
  ];

  return (
    <div className="dash-shell">
      <div className="dash-overlay">
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <img src={logo} alt="logo" />
            <div>
              <b>WasteWise</b>
              <div className="dash-role" style={{ fontSize: '.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {role === 'admin' ? 'Administrator' : role}
              </div>
            </div>
          </div>

          <div className="dash-section">Main Menu</div>
          {navMain.map(i => (
            <div
              key={i.name}
              className={`dash-item ${isActive(i.path) ? "active" : ""}`}
              onClick={() => navigate(i.path)}
            >
              <span className="icon-only">{i.icon}</span>
              <span className="label">{i.name}</span>
            </div>
          ))}

          <div className="dash-section">Settings</div>
          {navSettings.map(i => (
            <div
              key={i.name}
              className={`dash-item ${isActive(i.path) ? "active" : ""}`}
              onClick={() => navigate(i.path)}
            >
              <span className="icon-only">{i.icon}</span>
              <span className="label">{i.name}</span>
            </div>
          ))}

          <div className="dash-item" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            <span className="icon-only"><LogOut size={18} /></span>
            <span className="label">Logout</span>
          </div>
        </aside>

        <main className="dash-main">
          {/* ... existing header and notification code ... */}
          {/* Note: In the view_file above we see <Outlet /> inside <main class="dash-main">. 
              The layout is dash-sidebar + dash-main inside dash-overlay.
              The ChatAssistant should likely be outside dash-main or absolute positioned.
              Since it is fixed position, it can be anywhere, but let's put it at the end of dash-overlay.
           */}
          <div className="dash-top">
            {/* ... header code ... */}
            <div style={{ position: "relative" }}>
              {/* ... notification bell ... */}
              <div
                ref={bellRef}
                className="cursor-pointer text-gray-400 hover:text-[#123524] transition-colors p-2"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-dot">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Tray */}
              {showNotifications && (
                <div
                  ref={notificationRef}
                  className="absolute top-12 right-0 w-80 max-h-[450px] bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200"
                >
                  {/* ... notification content ... */}
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-300">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">Quiet for now</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-green-50/30' : ''}`}>
                          {/* ... item ... */}
                          <div className="flex gap-3 pr-6">
                            <div className="mt-1">
                              {n.type === 'reschedule_request' ? <RotateCcw size={16} className="text-[#123524]" /> : <AlertCircle size={16} className="text-orange-500" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-800 leading-normal font-medium">{n.message}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{new Date(n.createdAt).toLocaleString()}</p>

                              {n.type === 'reschedule_request' && !n.isRead && role === 'ngo' && n.pickup && (
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => handleRescheduleRespond(n.pickup?._id || n.pickup, 'approve', n._id)}
                                    className="flex-1 py-1.5 bg-[#123524] text-white text-[10px] font-black rounded-lg hover:bg-[#0d281a] transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Check size={10} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleRescheduleRespond(n.pickup?._id || n.pickup, 'reject', n._id)}
                                    className="flex-1 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {!n.isRead && (n.type !== 'reschedule_request' || role !== 'ngo') && (
                                <button onClick={() => markAsRead(n._id)} className="text-[10px] text-[#123524] font-bold mt-2 uppercase tracking-widest">Mark as read</button>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n._id); }}
                            className="absolute top-4 right-2 text-gray-300 hover:text-red-500 opacity-40 group-hover:opacity-100 transition-all p-2"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ... avatar ... */}
            <div className="avatar ml-4" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              {profileImg ? (
                <img src={profileImg} alt="Avatar" />
              ) : (
                firstLetter
              )}
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-12 right-0 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden animate-in slide-in-from-top-2 duration-200"
              >
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#059669] flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {profileImg ? (
                        <img src={profileImg} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        firstLetter
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {isEditingProfile ? (
                        <div>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full mb-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            placeholder="Name"
                          />
                          <input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            placeholder="Email"
                          />
                          <div className="mb-3">
                            <PhoneInput
                              country={'in'}
                              value={editedPhone}
                              onChange={phone => setEditedPhone(phone)}
                              inputClass="w-full !w-full"
                              containerClass="!w-full"
                              buttonClass="!bg-transparent"
                              inputStyle={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveProfile}
                              className="px-4 py-1.5 bg-[#123524] !text-white text-xs font-bold rounded-lg hover:bg-[#0d281a] transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingProfile(false)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-900">{name}</p>
                          <p className="text-sm text-gray-500">{email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => { setIsEditingProfile(true); setEditedName(name); setEditedEmail(email); setEditedPhone(userProfile?.phoneNumber || ""); }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <Outlet context={{ userProfile }} />
        </main>

        <ChatAssistant />
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-10 right-10 z-[10000] animate-bounce-in`}>
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-[#0d281a] text-white border-green-500'
            : 'bg-red-600 text-white border-red-500'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= DASHBOARD OVERVIEW (fetches summary + shows activity) ================= */

export function Overview() {
  const { userProfile } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "volunteer";
  const defaultName = localStorage.getItem("fullName") || localStorage.getItem("name") || "Volunteer";

  // Custom name logic: Show NGO Org Name if applicable
  const getDisplayName = () => {
    if (role === 'ngo' && userProfile?.ngoDetails?.organizationName) {
      return userProfile.ngoDetails.organizationName;
    }
    return defaultName;
  };

  const displayName = getDisplayName();

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
      <div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {displayName}!</h1>
          <p className="text-white/80 font-medium mt-1">Here is your impact summary for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Waste Collected */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
              <Trash2 size={28} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Waste Collected</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{data?.waste_kg || 125}</span>
              <span className="text-xl font-bold text-gray-400">kg</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                <BarChart3 size={12} />
                +12%
              </span>
              <span className="text-[10px] font-semibold text-gray-400">from last month</span>
            </div>
          </div>
        </div>

        {/* Pickups Completed */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
              <CheckCircle2 size={28} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickups Completed</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{data?.pickups || 14}</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                <CalendarCheck size={12} />
                +2
              </span>
              <span className="text-[10px] font-semibold text-gray-400">this week</span>
            </div>
          </div>
        </div>

        {/* Hours Volunteered */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
              <Clock size={28} />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hours Volunteered</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{data?.hours || 28}</span>
              <span className="text-xl font-bold text-gray-400">hrs</span>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-200">
                Target: 30
              </span>
              <span className="text-[10px] font-semibold text-gray-400">hrs/mo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Upcoming Pickups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Upcoming Scheduled Pickups</h2>
              <button
                onClick={() => navigate("/my-schedule")}
                className="text-xs font-black text-[#123524] uppercase tracking-widest hover:text-[#123524] transition-colors"
              >
                View All
              </button>
            </div>

            {pickups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-green-50 to-white rounded-3xl border border-green-100">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
                  <CalendarCheck size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">No upcoming pickups</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 text-center max-w-xs">You haven't scheduled any pickups yet. Start making an impact today!</p>
                <button
                  onClick={() => navigate("/schedule")}
                  className="px-6 py-3 bg-green-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                >
                  Schedule Pickup <span className="text-lg leading-none mb-0.5">→</span>
                </button>
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
                    {pickups.map(p => {
                      const getMaterialIcon = (types) => {
                        const primary = types[0].toLowerCase();
                        if (primary.includes('plastic')) return <Milk size={20} />;
                        if (primary.includes('metal') || primary.includes('can')) return <Container size={20} />;
                        if (primary.includes('paper')) return <FileText size={20} />;
                        if (primary.includes('electronic') || primary.includes('e-waste')) return <CircuitBoard size={20} />;
                        if (primary.includes('glass')) return <Milk size={20} />;
                        return <Package size={20} />;
                      };
                      return (
                        <tr key={p._id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                {getMaterialIcon(p.wasteTypes)}
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
                              p.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                              }`}>
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar content: Activity Feed & Trends */}
        <div className="space-y-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Contribution Trends</h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Wk 1', val: 30 },
                  { name: 'Wk 2', val: 50 },
                  { name: 'Wk 3', val: 40 },
                  { name: 'Wk 4', val: 70 },
                  { name: 'Wk 5', val: 55 },
                  { name: 'Wk 6', val: 85 }
                ]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase tracking-widest">Last 30 Days Activity</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Recent Activity</h2>
            <ActivityFeed limit={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
