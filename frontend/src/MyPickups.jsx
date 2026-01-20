import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Loader,
    AlertCircle,
    X,
    RotateCcw,
    Save,
    Check,
    ArrowUpRight,
    Target,
    Zap,
    Hourglass,
    Trophy,
    Milk,
    Container,
    FileText,
    CircuitBoard,
    Layout,
    Mail,
    Plus,
    MoreHorizontal,
    TrendingUp,
    Map as MapIcon,
    BarChart3,
    CalendarCheck,
    Globe
} from "lucide-react";
import PageHeader from "./components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import api from "./utils/api";
import { useUI } from "./context/UIContext";
import { createPortal } from "react-dom";
import HorizontalCalendar from "./components/HorizontalCalendar";
import LoadingSpinner from "./components/LoadingSpinner";

export default function MyPickups() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rescheduleData, setRescheduleData] = useState({ open: false, pickupId: null, date: "", time: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [goals, setGoals] = useState({ points: 0, hours: 0, timeLimit: 0 });
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const { showToast, confirm } = useUI();

    const stats = {
        total: pickups.length,
        totalPoints: pickups.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.points_estimated || 0), 0),
        inProgress: pickups.filter(p => p.status === 'in_progress').length,
        completed: pickups.filter(p => p.status === 'completed').length
    };

    const fetchMyPickups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pickups/my');
            setPickups(res.data.data);

            // Fetch profile for goals and other details
            const profileRes = await api.get('/profile');
            if (profileRes.data.user.volunteerDetails?.goals) {
                setGoals(profileRes.data.user.volunteerDetails.goals);
            }
            setUserProfile(profileRes.data.user);
        } catch (err) {
            console.error("Error fetching my pickups:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPickups();
    }, []);

    const handleSaveGoals = async () => {
        try {
            setActionLoading(true);
            await api.put('/profile', { goals });
            showToast("Goals updated successfully!", "success");
            setShowGoalModal(false);
        } catch (err) {
            showToast("Failed to update goals", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id) => {
        const isConfirmed = await confirm({
            title: "Cancel Participation?",
            message: "Are you sure you want to cancel your participation in this pickup? This action cannot be undone.",
            confirmText: "Yes, Cancel",
            isDangerous: true
        });
        if (!isConfirmed) return;

        try {
            setActionLoading(true);
            await api.delete(`/pickups/${id}/cancel`);
            showToast("Pickup cancelled successfully.", "success");
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to cancel pickup", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            showToast("Please select both date and time", "error");
            return;
        }
        try {
            setActionLoading(true);
            await api.put(`/pickups/${rescheduleData.pickupId}/reschedule-request`, {
                proposedDate: rescheduleData.date,
                proposedTime: rescheduleData.time
            });
            showToast("Reschedule request submitted successfully!", "success");
            setRescheduleData({ open: false, pickupId: null, date: "", time: "" });
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to send reschedule request", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRescheduleResponse = async (id, action) => {
        try {
            setActionLoading(true);
            await api.put(`/pickups/${id}/reschedule-respond`, { action });
            showToast(`Reschedule request ${action}d successfully.`, "success");
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || `Failed to ${action} reschedule`, "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDone = async (id) => {
        const isConfirmed = await confirm({
            title: "Mark as Done?",
            message: "Are you sure you want to mark this pickup as done? The NGO will verify it shortly.",
            confirmText: "Yes, Mark Done"
        });
        if (!isConfirmed) return;

        try {
            setActionLoading(true);
            await api.put(`/pickups/${id}/mark-done`);
            showToast("Pickup marked as done. Awaiting NGO verification.", "success");
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to mark pickup as done", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerify = async (id) => {
        const isConfirmed = await confirm({
            title: "Verify Completion?",
            message: "Are you sure you want to verify this pickup? Points will be awarded to the volunteer.",
            confirmText: "Yes, Verify"
        });
        if (!isConfirmed) return;

        try {
            setActionLoading(true);
            await api.put(`/pickups/${id}/verify`);
            showToast("Pickup verified successfully! Points awarded.", "success");
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to verify pickup", "error");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <PageHeader title="My Pickups" subtitle="Manage your organized collections and commitments." />
                {role === 'volunteer' && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowGoalModal(true)}
                        className="px-6 py-3 bg-white text-[#059669] rounded-xl font-normal uppercase tracking-wider text-xs flex items-center gap-2 border border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
                    >
                        <Target size={16} /> Update Objectives
                    </motion.button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: role === 'ngo' ? "Total Postings" : "Scheduled", value: stats.total, icon: <Package size={22} />, color: "#ffffff", bg: "#123524" },
                    { label: "Points Earned", value: stats.totalPoints, icon: <Zap size={22} />, color: "#ffffff", bg: "#123524" },
                    { label: "In Progress", value: stats.inProgress, icon: <Clock size={22} />, color: "#ffffff", bg: "#123524" },
                    { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={22} />, color: "#ffffff", bg: "#123524" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-gray-50 flex flex-col gap-4 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-400 uppercase tracking-wider group-hover:bg-white group-hover:shadow-sm transition-all">
                                Summary
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">{stat.value}</div>
                            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : pickups.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="premium-card p-20 text-center"
                >
                    <Package className="mx-auto text-gray-200 mb-6" size={64} />
                    <h2 className="text-2xl font-normal text-gray-900 tracking-tight">No pickups scheduled yet</h2>
                    <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
                        {role === 'ngo' ? 'Start by posting a new opportunity.' : 'Explore available pickups and start collecting.'}
                    </p>
                    <button
                        onClick={() => navigate(role === 'ngo' ? "/opportunities" : "/available-pickups")}
                        className="mt-8 px-8 py-3 bg-[#123524] text-white rounded-xl font-normal uppercase tracking-wider text-xs hover:bg-[#0d281a] transition-all shadow-lg shadow-emerald-900/10"
                    >
                        {role === 'ngo' ? 'Create Posting' : 'Explore Opportunities'}
                    </button>
                </motion.div>
            ) : (
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left: Pickup List */}
                    <div className="flex-1 space-y-6">
                        {pickups.map(pickup => (
                            <motion.div
                                key={pickup._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col group p-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
                            >
                                <div className="p-8 pb-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${pickup.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                            pickup.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                pickup.status === 'awaiting_verification' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {pickup.status.replace("_", " ")}
                                        </span>
                                        {pickup.rescheduleRequest?.status === 'pending' && (
                                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100 animate-pulse">
                                                Reschedule Requested
                                            </span>
                                        )}
                                        <span className="text-gray-400 text-[10px] uppercase font-medium tracking-widest">
                                            ID: {pickup._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                    <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="px-8 pb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-8 capitalize group-hover:text-[#123524] transition-colors">
                                        {pickup.wasteTypes.join(", ")} Collection
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100/50">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {new Date(pickup.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100/50">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Slot</div>
                                                <div className="text-sm font-bold text-gray-900">{pickup.timeSlot}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100/50">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</div>
                                                <div className="text-sm font-bold text-gray-900 break-all truncate max-w-[200px]">{pickup.location.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto px-8 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
                                            {role === 'ngo' ? (
                                                pickup.volunteer?.avatar ? (
                                                    <img src={`http://localhost:5000${pickup.volunteer.avatar}`} className="w-full h-full object-cover" alt="Volunteer" />
                                                ) : <Layout size={20} />
                                            ) : (
                                                pickup.user?.ngoDetails?.logo ? (
                                                    <img src={`http://localhost:5000${pickup.user.ngoDetails.logo}`} className="w-full h-full object-cover" alt="NGO" />
                                                ) : <Layout size={20} />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">
                                                {role === 'ngo' ? 'Volunteer' : 'Organization'}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {role === 'ngo' ? (pickup.volunteer?.fullName || pickup.volunteer?.username || 'Waiting...') : (pickup.user?.ngoDetails?.organizationName || 'Nexus Partner')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        {role === 'ngo' && pickup.rescheduleRequest?.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRescheduleResponse(pickup._id, 'approve')}
                                                    className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm"
                                                >
                                                    Approve Reschedule
                                                </button>
                                                <button
                                                    onClick={() => handleRescheduleResponse(pickup._id, 'reject')}
                                                    className="px-4 py-3 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-50 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {role === 'ngo' && pickup.status === 'awaiting_verification' && (
                                            <button
                                                onClick={() => handleVerify(pickup._id)}
                                                className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 uppercase tracking-widest"
                                            >
                                                Verify Completion
                                            </button>
                                        )}

                                        <button
                                            onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${role === 'ngo' ? pickup.volunteer?.email : pickup.user?.email}`, '_blank')}
                                            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm uppercase tracking-widest"
                                        >
                                            Contact
                                        </button>

                                        {role === 'volunteer' && pickup.status === 'in_progress' && (
                                            <>
                                                <button
                                                    onClick={() => setRescheduleData({ open: true, pickupId: pickup._id, date: "", time: "" })}
                                                    className="px-6 py-4 bg-white border border-[#123524] text-[#123524] rounded-2xl text-[10px] font-bold hover:bg-emerald-50 transition-all uppercase tracking-widest"
                                                >
                                                    Reschedule
                                                </button>
                                                <button
                                                    onClick={() => handleMarkDone(pickup._id)}
                                                    className="px-6 py-4 bg-[#123524] text-white rounded-2xl text-[10px] font-bold hover:bg-[#0d281a] transition-all shadow-lg shadow-emerald-900/10 uppercase tracking-widest"
                                                >
                                                    Mark Done
                                                </button>
                                            </>
                                        )}
                                        {role === 'volunteer' && pickup.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleCancel(pickup._id)}
                                                className="p-4 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right: Goals Summary (Volunteer only) */}
                    {role === 'volunteer' && (
                        <div className="xl:w-80 flex flex-col gap-6">
                            <div className="premium-card p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center shadow-sm">
                                        <Trophy size={18} />
                                    </div>
                                    <h4 className="font-normal text-gray-900">Current Goals</h4>
                                </div>

                                <div className="space-y-6">
                                    {goals.points > 0 && (
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-end">
                                                <div className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Points Target</div>
                                                <div className="text-xs font-normal text-emerald-600">{stats.totalPoints} / {goals.points}</div>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((stats.totalPoints / (goals.points || 1)) * 100, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-emerald-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                                            <div className="text-[8px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Hours</div>
                                            <div className="text-sm font-normal text-gray-700">{goals.hours}h</div>
                                        </div>
                                        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                                            <div className="text-[8px] font-normal text-gray-400 uppercase tracking-widest mb-0.5">Cycle</div>
                                            <div className="text-sm font-normal text-gray-700">{goals.timeLimit}d</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Goal Resolution Modal */}
            {createPortal(
                <AnimatePresence>
                    {showGoalModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/20 backdrop-blur-md p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="premium-glass rounded-[56px] w-full max-w-lg p-12 relative border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                            >
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="absolute top-10 right-10 p-3 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                                >
                                    <X size={28} />
                                </button>

                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-[#123524] mx-auto mb-4">
                                        <Target size={32} />
                                    </div>
                                    <h3 className="text-2xl font-normal text-xs uppercase tracking-widest opacity-60 text-gray-900">Set Your Goals</h3>
                                    <p className="text-gray-500 font-medium">Define your impact targets for this month.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">
                                            <Zap size={14} className="text-yellow-500" /> Points Goal
                                        </label>
                                        <input
                                            type="number"
                                            value={goals.points}
                                            onChange={(e) => setGoals({ ...goals, points: parseInt(e.target.value) || 0 })}
                                            className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-3xl font-normal text-xs uppercase tracking-widest opacity-60 text-xl transition-all outline-none"
                                            placeholder="e.g. 1000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">
                                            <Hourglass size={14} className="text-blue-500" /> Free Hours
                                        </label>
                                        <input
                                            type="number"
                                            value={goals.hours}
                                            onChange={(e) => setGoals({ ...goals, hours: parseInt(e.target.value) || 0 })}
                                            className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl font-normal text-xs uppercase tracking-widest opacity-60 text-xl transition-all outline-none"
                                            placeholder="e.g. 20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">
                                            <Clock size={14} className="text-purple-500" /> Time Limit (Days/Task)
                                        </label>
                                        <input
                                            type="number"
                                            value={goals.timeLimit}
                                            onChange={(e) => setGoals({ ...goals, timeLimit: parseInt(e.target.value) || 0 })}
                                            className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl font-normal text-xs uppercase tracking-widest opacity-60 text-xl transition-all outline-none"
                                            placeholder="e.g. 3"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveGoals}
                                        disabled={actionLoading}
                                        className="w-full py-6 bg-emerald-500 text-white rounded-[28px] font-normal text-xs uppercase tracking-widest opacity-60 text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
                                    >
                                        <Save size={18} />
                                        {actionLoading ? 'SYCHRONIZING...' : 'Establish Objectives'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Reschedule Modal */}
            <AnimatePresence>
                {rescheduleData.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/20 backdrop-blur-md p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="premium-glass rounded-[56px] w-full max-w-md p-12 relative border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-normal text-gray-900 tracking-tight">Modify Event</h3>
                                <button
                                    onClick={() => setRescheduleData({ ...rescheduleData, open: false })}
                                    className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-2 ml-2">New Date</label>
                                    <HorizontalCalendar
                                        selectedDate={rescheduleData.date}
                                        onDateChange={(val) => setRescheduleData({ ...rescheduleData, date: val })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-2 ml-2">New Time Slot</label>
                                    <input
                                        type="time"
                                        value={rescheduleData.time}
                                        onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-3xl font-normal outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleReschedule}
                                    disabled={actionLoading}
                                    className="w-full py-6 bg-[#123524] text-white rounded-[28px] font-normal uppercase tracking-widest text-xs uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:bg-[#123524] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
                                >
                                    <Save size={18} /> {actionLoading ? 'TRANSMITTING...' : 'Propose New Time'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
