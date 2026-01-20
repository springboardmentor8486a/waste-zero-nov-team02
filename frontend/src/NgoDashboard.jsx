import React, { useEffect, useState } from "react";
import api from "./utils/api";
import {
  Bell,
  Check,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  RotateCcw,
  AlertCircle
} from "lucide-react";

export default function NgoDashboard() {
  const [orgName, setOrgName] = useState(localStorage.getItem("orgName") || "Green Earth");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [pickups, setPickups] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data.success) {
          setUserProfile(res.data.user);
          const ngo = res.data.user.ngoDetails || {};
          if (ngo.organizationName) {
            setOrgName(ngo.organizationName);
            localStorage.setItem("orgName", ngo.organizationName);
          }
        }
      } catch (err) {
        console.error("Error fetching NGO profile:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    const fetchPickups = async () => {
      try {
        const res = await api.get("/pickups/my");
        setPickups(res.data.data);
      } catch (err) {
        console.error("Error fetching pickups:", err);
      }
    };

    fetchProfile();
    fetchNotifications();
    fetchPickups();
  }, []);

  const handleVerifyPickup = async (id) => {
    try {
      setLoadingAction(id);
      await api.put(`/pickups/${id}/verify`);
      showToast("Pickup verified! Points awarded to volunteer.");
      const res = await api.get("/pickups/my");
      setPickups(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRescheduleRespond = async (pickupId, action, notificationId) => {
    try {
      setLoadingAction(pickupId);
      await api.put(`/pickups/${pickupId}/reschedule-respond`, { action });
      await api.patch(`/notifications/${notificationId}/read`);
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
      showToast(`Request ${action}ed successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to respond to request", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      showToast("Notification removed");
    } catch (err) {
      showToast("Failed to delete notification", "error");
    }
  };

  const getProfileImage = () => {
    if (!userProfile) return null;
    if (userProfile.ngoDetails?.logo && userProfile.ngoDetails.logo !== 'no-photo.jpg') {
      return `http://localhost:5000${userProfile.ngoDetails.logo}`;
    }
    if (userProfile.googleProfilePic) return userProfile.googleProfilePic;
    return null;
  };

  const profileImg = getProfileImage();
  const firstLetter = (userProfile?.fullName || userProfile?.username || "O").charAt(0).toUpperCase();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img src="/waste-truck.png" alt="WasteZero" className="w-10 h-10 object-contain" />
              <h1 className="text-3xl font-normal text-gray-900 tracking-tight">WasteZero Portal: {orgName}</h1>
            </div>
            <p className="text-[11px] text-gray-400 font-normal uppercase tracking-widest mt-2">
              Performance & Impact Analytics • Real-time Data
            </p>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => navigate("/messages")}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm group"
            >
              <MessageSquare size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center relative hover:bg-gray-50 transition-all shadow-sm group"
            >
              <Bell size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#123524] text-white text-[9px] font-normal rounded-lg flex items-center justify-center border-2 border-white ring-4 ring-emerald-50 transition-all scale-animation">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-14 right-0 w-96 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col p-4 animate-in fade-in slide-in-from-top-2">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Inbox</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-300 hover:text-gray-900 transition-all"><X size={16} /></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-200">
                      <Bell size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-[10px] font-normal uppercase tracking-widest">Quiet Day</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className={`p-5 rounded-2xl border transition-all relative group ${!n.isRead ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'reschedule_request' ? 'bg-emerald-500 text-white' : 'bg-orange-50 text-orange-500'}`}>
                            {n.type === 'reschedule_request' ? <RotateCcw size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-normal text-gray-800 leading-normal">{n.message}</p>
                            <p className="text-[9px] text-gray-400 font-normal mt-2 uppercase tracking-tight">{new Date(n.createdAt).toLocaleString()}</p>

                            {n.type === 'reschedule_request' && !n.isRead && n.pickup && (
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRescheduleRespond(n.pickup._id, 'approve', n._id);
                                  }}
                                  className="flex-1 py-2 bg-[#123524] text-white text-[9px] font-normal uppercase tracking-widest rounded-lg hover:bg-[#0d281a] shadow-lg shadow-emerald-900/10"
                                  disabled={!n.pickup._id || loadingAction === n.pickup._id}
                                >
                                  {loadingAction === n.pickup._id ? '...' : 'Approve'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRescheduleRespond(n.pickup._id, 'reject', n._id);
                                  }}
                                  className="flex-1 py-2 bg-white text-gray-400 text-[9px] font-normal uppercase tracking-widest rounded-lg border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                  disabled={!n.pickup._id || loadingAction === n.pickup._id}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n._id); }}
                          className="absolute top-4 right-4 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-normal text-lg shadow-lg shadow-emerald-900/20 border-2 border-white ring-4 ring-emerald-50 overflow-hidden">
              {profileImg ? (
                <img src={profileImg} alt="NGO" className="w-full h-full object-cover" />
              ) : (
                firstLetter
              )}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Requests", val: "12", icon: <AlertCircle size={18} />, color: "emerald" },
            { label: "Volunteers", val: "1.2k", icon: <CheckCircle2 size={18} />, color: "blue" },
            { label: "Impact (kg)", val: "5,420", icon: <Trash2 size={18} />, color: "orange" },
            { label: "Health Score", val: "94%", icon: <Bell size={18} />, color: "purple" }
          ].map((stat, i) => (
            <div key={i} className="premium-card p-6 border border-gray-50 hover:shadow-xl transition-all cursor-default group">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-normal text-gray-900 mt-2">{stat.val}</p>
            </div>
          ))}
        </section>

        <section className="premium-card bg-white border border-gray-50 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <h3 className="text-sm font-normal text-gray-900 uppercase tracking-tight">Pickup Registry</h3>
              <p className="text-[10px] text-gray-400 font-normal uppercase tracking-widest mt-1">Lifecycle management for waste collections</p>
            </div>
            <span className="text-[9px] font-normal text-emerald-700 bg-emerald-50 px-4 py-2 rounded-[10px] uppercase tracking-widest border border-emerald-100">
              {pickups.length} Records Detected
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[9px] uppercase text-gray-400 border-b border-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left font-normal tracking-widest">Details</th>
                  <th className="px-8 py-5 text-left font-normal tracking-widest">Assignee</th>
                  <th className="px-8 py-5 text-left font-normal tracking-widest">Schedule</th>
                  <th className="px-8 py-5 text-left font-normal tracking-widest">Status</th>
                  <th className="px-8 py-5 text-center font-normal tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pickups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Calendar className="text-gray-100" size={48} />
                        <p className="text-[10px] font-normal text-gray-300 uppercase tracking-[0.2em]">Queue is currently empty</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pickups.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-emerald-500">
                            <Trash2 size={14} />
                          </div>
                          <span className="font-normal text-gray-800 capitalize">{p.wasteTypes.join(", ")}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {p.volunteer ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-normal text-[10px]">
                              {p.volunteer.fullName?.charAt(0) || p.volunteer.username?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-normal text-gray-800 text-xs">{p.volunteer.fullName || p.volunteer.username}</span>
                              <span className="text-[9px] text-gray-400 font-medium">{p.volunteer.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-normal uppercase tracking-widest">Available</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-normal text-gray-800">{p.scheduledDate}</span>
                          <span className="text-[9px] text-gray-400 font-normal uppercase tracking-tighter mt-0.5">{p.timeSlot}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-normal uppercase tracking-widest border ${p.status === 'awaiting_verification' ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' :
                          p.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            p.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {p.status === 'awaiting_verification' && (
                          <button
                            onClick={() => handleVerifyPickup(p._id)}
                            disabled={loadingAction === p._id}
                            className="w-full py-2.5 bg-[#123524] text-white rounded-xl text-[9px] font-normal uppercase tracking-widest hover:bg-[#0d281a] shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center gap-2"
                          >
                            {loadingAction === p._id ? (
                              <div className="spinner-wrapper !w-3.5 !h-3.5">
                                <div className="spinner-outer !border-2"></div>
                                <div className="spinner-inner !border-2 !border-t-white"></div>
                              </div>
                            ) : <CheckCircle2 size={12} />}
                            Verify
                          </button>
                        )}
                        {p.status === 'completed' && (
                          <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-[10px] font-normal uppercase tracking-widest">
                            <Check size={14} /> Mission Clear
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes scale-animation {
                    0% { transform: scale(0.9); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .scale-animation { animation: scale-animation 2s infinite ease-in-out; }
            `}} />

      {toast.show && (
        <div className="fixed bottom-10 right-10 z-[120] animate-bounce-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-[#123524] text-white border-[#123524]'
            : 'bg-red-600 text-white border-red-500'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-normal">{toast.message}</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes bounce-in {
                    0% { transform: translateY(100px); opacity: 0; }
                    60% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); }
                }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}} />
    </div>
  );
}
