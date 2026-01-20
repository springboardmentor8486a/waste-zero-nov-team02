import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation, useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Leaf,
  MessageSquare,
  BarChart3,
  User,
  Users,
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
  Home,
  Briefcase,
  FileText,
  CircuitBoard,
  Edit,
  Shield,
  ArrowLeft,
  MapPin,
  Droplets,
  Target,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import "./App.css";

import ChatAssistant from "./components/ChatAssistant";
import CalendarView from "./components/CalendarView";
import LoadingSpinner from "./components/LoadingSpinner";
import api from "./utils/api";
import Header from "./components/Header";
import OnboardingModal from "./components/OnboardingModal";
import AdminDashboardView from "./pages/admin/AdminDashboardView";
import FeedbackModal from "./components/FeedbackModal";
import PlatformRatingModal from "./components/PlatformRatingModal";

const logo = "/waste-truck.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messagesCount, setMessagesCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('opportunity'); // 'opportunity' or 'app'
  const [targetOppId, setTargetOppId] = useState(null);
  const [showPlatformRating, setShowPlatformRating] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const name = localStorage.getItem("fullName") || localStorage.getItem("name") || "User";
  const role = (localStorage.getItem("role") || "volunteer").toLowerCase();
  const email = localStorage.getItem("userEmail") || "";

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(Array.isArray(res.data?.data) ? res.data.data : []);
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

    // Fetch user profile + check for feedback/rating
    api.get("/profile")
      .then(res => {
        if (!mounted) return;
        const user = res.data?.user || null;
        setUserProfile(user);

        // DEBUGGING LOGS
        console.log("DEBUG [Feedback]: User loginCount:", user?.loginCount);
        console.log("DEBUG [Feedback]: User role:", user?.role);

        // Check for App Rating (1st login session and beyond, excluding admins)
        if (user && user.role !== 'admin' && (user.loginCount >= 1 || user.loginCount === 0)) {
          const hasShownThisSession = sessionStorage.getItem('hasShownAppRating');
          console.log("DEBUG [Feedback]: Has shown this session:", hasShownThisSession);

          if (!hasShownThisSession) {
            api.get('/feedback/app-rating/status').then(rStatus => {
              console.log("DEBUG [Feedback]: Rating status from backend:", rStatus.data);
              if (!rStatus.data.hasRated) {
                setTimeout(() => {
                  if (mounted) {
                    console.log("DEBUG [Feedback]: Triggering Modal");
                    setShowPlatformRating(true);
                    sessionStorage.setItem('hasShownAppRating', 'true');
                  }
                }, 2000);
              }
            }).catch(err => console.error("Rating status check failed", err));
          }
        }

        // Check for completed opportunities without feedback
        if (user && (user.role === 'volunteer' || user.role === 'ngo')) {
          api.get('/opportunities/completed-pending-feedback').then(oppRes => {
            const pendingOpps = oppRes.data?.data || [];
            if (pendingOpps.length > 0) {
              setTargetOppId(pendingOpps[0]._id);
              setFeedbackType('opportunity');
              setShowFeedbackModal(true);
            }
          });
        }
      })
      .catch(err => console.error("Error fetching profile:", err));

    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
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

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  useEffect(() => {
    const id = "dashboard-inline-styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      .dash-shell{height:100vh;display:flex;flex-direction:column;color:#111827;overflow:hidden; font-family: 'Inter', sans-serif;}
      .dash-overlay{flex:1;display:flex;background:rgba(255,255,255,0.05); backdrop-filter: blur(5px); overflow:hidden;}
      .dash-sidebar{width:260px;background:#ffffff; border-right:1px solid #e5e7eb;padding:1.5rem 1rem;display:flex;flex-direction:column;gap:.5rem;transition:all .25s ease;overflow-y:auto;overflow-x:hidden;height:100%;z-index:100;}
      .dash-main{flex:1;padding:2.5rem 3rem;overflow-y:auto;height:100%; scroll-behavior: smooth; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);}
      
      .premium-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        transition: all 0.2s ease;
      }
      .premium-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      }
      
      .stat-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 1.5rem;
        transition: all 0.2s ease;
      }
      .stat-card:hover { border-color: #059669; box-shadow: 0 10px 30px -10px rgba(5, 150, 105, 0.1); }
      .table-row-premium:hover { background: #f9fafb; }
    `;
  }, []);

  const getNavItems = () => {
    let items = role === 'ngo' ? [
      { name: "Schedule Pickup", icon: <CalendarCheck size={18} />, path: "/schedule" },
      { name: "My Pickups", icon: <Package size={18} />, path: "/my-pickups" },
      { name: "My Postings", icon: <Leaf size={18} />, path: "/opportunities" },
      { name: "My Impact", icon: <BarChart3 size={18} />, path: "/impact" },
      { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" }
    ] : [
      { name: "My Pickups", icon: <Package size={18} />, path: "/my-pickups" },
      { name: "Impact Reports", icon: <BarChart3 size={18} />, path: "/impact" },
      { name: "Waste Pickups", icon: <Trash2 size={18} />, path: "/available-pickups" },
      { name: "Opportunities", icon: <Leaf size={18} />, path: "/opportunities" },
      { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" }
    ];

    if (role === 'admin') {
      items = [
        { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
        { name: "Users", icon: <Users size={18} />, path: "/admin/users" },
        { name: "Audit Logs", icon: <FileText size={18} />, path: "/admin/logs" }
      ];
    }
    return items;
  };

  const navItems = [
    ...getNavItems()
  ];

  return (
    <div className="dash-shell">
      <Header
        userProfile={userProfile}
        onUpdate={() => {
          api.get("/profile").then(res => setUserProfile(res.data?.user || null));
        }}
      />
      <div className="dash-overlay">
        <motion.aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          animate={{ width: isSidebarHovered ? 260 : 80 }}
          className="hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 z-40 overflow-hidden"
        >
          <nav className="flex-1 px-4 space-y-1.5 mt-8">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${active ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  <div className={`${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"} shrink-0`}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {isSidebarHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-normal whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full" />}
                </Link>
              );
            })}
          </nav>
        </motion.aside>

        <main className="dash-main">
          <Outlet context={{ userProfile }} />
        </main>

        {location.pathname !== '/messages' && <ChatAssistant />}
      </div>

      {toast.show && (
        <div className="fixed bottom-10 right-10 z-[10000] animate-bounce-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-[#0d281a] text-white border-green-500' : 'bg-red-600 text-white border-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-normal">{toast.message}</span>
          </div>
        </div>
      )}

      <OnboardingModal
        userProfile={userProfile}
        onUpdate={() => {
          api.get("/profile").then(res => setUserProfile(res.data?.user || null));
        }}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        type={feedbackType}
        opportunityId={targetOppId}
      />

      <PlatformRatingModal
        isOpen={showPlatformRating}
        onClose={() => setShowPlatformRating(false)}
      />
    </div>
  );
}

/* ================= DASHBOARD OVERVIEW ================= */

export function Overview() {
  const context = useOutletContext();
  const userProfile = context?.userProfile || null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const navigate = useNavigate();

  const role = (localStorage.getItem("role") || "volunteer").toLowerCase();

  if (role === 'admin') {
    return <AdminDashboardView />;
  }

  const defaultName = localStorage.getItem("fullName") || localStorage.getItem("name") || "Volunteer";
  const displayName = (role === 'ngo' && userProfile?.ngoDetails?.organizationName)
    ? userProfile.ngoDetails.organizationName
    : defaultName;

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
        const pData = pickupRes.data?.data;
        setPickups(Array.isArray(pData) ? pData.slice(0, 3) : []);
      } catch (err) {
        console.error("Overview fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner message="Loading your impact details..." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl lg:text-3xl font-normal text-gray-900 tracking-tight">
          Welcome back, <span className="text-[#059669]">{displayName}!</span>
        </h1>
        <p className="text-sm text-gray-500 font-normal">Here's a look at your sustainability footprint.</p>
      </motion.div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-normal text-gray-900 tracking-tight">Upcoming Collections</h2>
                <p className="text-xs text-gray-400 font-normal mt-0.5">Your next scheduled events</p>
              </div>
              <button
                onClick={() => navigate("/my-pickups")}
                className="px-4 py-2 bg-[#123524] text-white rounded-xl text-xs font-normal hover:bg-[#0d281a] transition-all"
              >
                View All
              </button>
            </div>

            {pickups.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                  <CalendarCheck size={40} className="text-slate-200" />
                </div>
                <p className="text-gray-900 font-bold text-xl tracking-tight">Schedule is clear!</p>
                <p className="text-gray-400 text-sm mt-1 mb-8">Ready to take on a new challenge?</p>
                <button
                  onClick={() => navigate("/available-pickups")}
                  className="px-8 py-3 bg-white border border-slate-200 text-[#123524] text-xs font-black uppercase tracking-widest rounded-2xl hover:border-[#123524] transition-all"
                >
                  Explore Opportunities
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="text-left pb-6 pl-2">Event Type</th>
                      <th className="text-left pb-6">When</th>
                      <th className="text-left pb-6">Where</th>
                      <th className="text-right pb-6 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pickups.map(p => (
                      <tr key={p._id} className="table-row-premium cursor-pointer group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Package size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 capitalize">{(p.wasteTypes || []).join(", ")}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Materials</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-semibold text-gray-700">{p.scheduledDate}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">{p.timeSlot}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm text-gray-500 font-medium line-clamp-1 flex items-center gap-1">
                            <MapPin size={12} className="text-gray-300" /> {p.location?.address || 'Target Location'}
                          </p>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.status === 'in_progress' ? 'bg-sky-50 text-sky-600' :
                            p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                            {(p.status || 'Scheduled').replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8">
          <CalendarView />
        </div>
      </div>
    </div>
  );
}

