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
        console.log("📬 Fetched notifications:", res.data.data);
        console.log("📊 Total notifications:", res.data.data.length);
        console.log("🔔 Unread notifications:", res.data.data.filter(n => !n.isRead).length);
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
      // Refresh pickups
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
      console.log("🔄 Responding to reschedule request:", { pickupId, action, notificationId });
      setLoadingAction(pickupId);
      await api.put(`/pickups/${pickupId}/reschedule-respond`, { action });
      await api.patch(`/notifications/${notificationId}/read`);

      // Refresh notifications
      const res = await api.get("/notifications");
      setNotifications(res.data.data);

      showToast(`Request ${action}ed successfully`);
      console.log("✅ Reschedule response completed successfully");
    } catch (err) {
      console.error("❌ Reschedule response error:", err);
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

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      showToast("Notification removed");
    } catch (err) {
      console.error("Error deleting notification:", err);
      showToast("Failed to delete notification", "error");
    }
  };

  const getProfileImage = () => {
    if (!userProfile) return null;
    // 1. Custom Upload
    if (userProfile.ngoDetails?.logo && userProfile.ngoDetails.logo !== 'no-photo.jpg') {
      return `http://localhost:5000${userProfile.ngoDetails.logo}`;
    }
    // 2. Google Fallback
    if (userProfile.googleProfilePic) return userProfile.googleProfilePic;
    return null;
  };

  const profileImg = getProfileImage();
  const firstLetter = (userProfile?.fullName || userProfile?.username || "O").charAt(0).toUpperCase();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-background-light dark:bg-background-dark text-black font-display min-h-screen transition-colors">
      <div className="flex h-screen overflow-hidden">
        {/* Main Content only */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">Welcome Org, {orgName}</h1>
                <p className="text-[#61896f] dark:text-gray-400">
                  Here is your impact overview for today.
                </p>
              </div>
              <div className="flex items-center gap-4 relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="size-10 rounded-full bg-white dark:bg-surface-dark border flex items-center justify-center relative hover:bg-gray-50 transition-colors"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 max-h-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Bell size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} className={`p-4 border-b last:border-0 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-green-50/30' : ''}`}>
                            <div className="flex gap-3 pr-8">
                              <div className="mt-1">
                                {n.type === 'reschedule_request' ? <RotateCcw size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-orange-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">{new Date(n.createdAt).toLocaleString()}</p>

                                {n.type === 'reschedule_request' && !n.isRead && n.pickup && (
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('🟢 Approve clicked for pickup:', n.pickup._id);
                                        handleRescheduleRespond(n.pickup._id, 'approve', n._id);
                                      }}
                                      className="flex-1 py-1.5 bg-[#123524] text-white text-[10px] font-black rounded-lg hover:bg-[#0d281a] transition-colors"
                                      disabled={!n.pickup._id || loadingAction === n.pickup._id}
                                    >
                                      {loadingAction === n.pickup._id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('🔴 Reject clicked for pickup:', n.pickup._id);
                                        handleRescheduleRespond(n.pickup._id, 'reject', n._id);
                                      }}
                                      className="flex-1 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
                                      disabled={!n.pickup._id || loadingAction === n.pickup._id}
                                    >
                                      {loadingAction === n.pickup._id ? 'Processing...' : 'Reject'}
                                    </button>
                                  </div>
                                )}
                                {n.type === 'reschedule_request' && !n.isRead && !n.pickup && (
                                  <div className="text-[10px] text-red-500 mt-2 italic">
                                    Error: Pickup data missing. Please refresh the page.
                                  </div>
                                )}
                                {!n.isRead && n.type !== 'reschedule_request' && (
                                  <button onClick={() => markAsRead(n._id)} className="text-[10px] text-green-600 font-bold mt-2">Mark as read</button>
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

                <div
                  className="size-10 rounded-full bg-[#123524] text-white flex items-center justify-center font-bold text-lg border overflow-hidden"
                >
                  {profileImg ? (
                    <img src={profileImg} alt="NGO" className="w-full h-full object-cover" />
                  ) : (
                    firstLetter
                  )}
                </div>
              </div>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Active Opportunities", "Total Volunteers", "Waste Collected (kg)", "Upcoming Events"].map(
                (title, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl bg-surface-light dark:bg-surface-dark border shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold mt-2">{[12, "1,245", "5,420", 3][i]}</p>
                  </div>
                )
              )}
            </section>

            {/* Table */}
            <section className="bg-surface-light dark:bg-surface-dark rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">My Managed Pickups</h3>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  {pickups.length} Pickups Total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-background-dark text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4 text-left">Waste Types</th>
                      <th className="px-6 py-4 text-left">Volunteer</th>
                      <th className="px-6 py-4 text-left">Scheduled</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pickups.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">
                          No pickups scheduled yet.
                        </td>
                      </tr>
                    ) : (
                      pickups.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold capitalize">{p.wasteTypes.join(", ")}</td>
                          <td className="px-6 py-4">
                            {p.volunteer ? (
                              <div className="flex flex-col">
                                <span className="font-bold">{p.volunteer.fullName || p.volunteer.username}</span>
                                <span className="text-[10px] text-gray-400">{p.volunteer.email}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{p.scheduledDate}</span>
                              <span className="text-[10px] text-gray-400">{p.timeSlot}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.status === 'awaiting_verification' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 animate-pulse' :
                              p.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                                p.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  'bg-gray-50 text-gray-400 border-gray-200'
                              }`}>
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {p.status === 'awaiting_verification' && (
                              <button
                                onClick={() => handleVerifyPickup(p._id)}
                                disabled={loadingAction === p._id}
                                className="px-4 py-2 bg-[#123524] text-white rounded-lg text-xs font-black hover:bg-[#0d281a] transition-all shadow-md shadow-green-100 flex items-center gap-2 mx-auto"
                              >
                                {loadingAction === p._id ? <RotateCcw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                Verify Done
                              </button>
                            )}
                            {p.status === 'completed' && (
                              <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-black">
                                <Check size={14} /> Points Awarded
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
        </main>
      </div>

      {/* In-website Float Message (Toast) */}
      {toast.show && (
        <div className={`fixed bottom-10 right-10 z-[120] animate-bounce-in`}>
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-[#123524] text-white border-[#123524]'
            : 'bg-red-600 text-white border-red-500'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{toast.message}</span>
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
