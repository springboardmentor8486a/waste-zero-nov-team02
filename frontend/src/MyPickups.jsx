import React, { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Loader,
    AlertCircle,
    User,
    Mail,
    BarChart3,
    CalendarCheck,
    X,
    MessageSquare,
    Save,
    RotateCcw
} from "lucide-react";
import api from "./utils/api";

export default function MyPickups() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rescheduleData, setRescheduleData] = useState({ open: false, pickupId: null, date: "", time: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [confirmModal, setConfirmModal] = useState({ open: false, pickupId: null, message: "", onConfirm: null });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    };

    const role = localStorage.getItem('role') || 'volunteer';

    const fetchMyPickups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pickups/my');
            setPickups(res.data.data);
        } catch (err) {
            console.error("Error fetching my pickups:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPickups();

        // Task 1: Real-time update via polling
        const interval = setInterval(() => {
            fetchMyPickups();
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, []);

    const handleCancel = (id) => {
        setConfirmModal({
            open: true,
            pickupId: id,
            message: "Are you sure you want to cancel your participation in this pickup?",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await api.delete(`/pickups/${id}/cancel`);
                    showToast("Pickup cancelled successfully.");
                    fetchMyPickups();
                } catch (err) {
                    showToast(err.response?.data?.message || "Failed to cancel pickup", "error");
                } finally {
                    setActionLoading(false);
                    setConfirmModal({ open: false, pickupId: null, message: "", onConfirm: null });
                }
            }
        });
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            alert("Please select both date and time");
            return;
        }
        try {
            setActionLoading(true);
            await api.put(`/pickups/${rescheduleData.pickupId}/reschedule-request`, {
                proposedDate: rescheduleData.date,
                proposedTime: rescheduleData.time
            });
            showToast("Reschedule request submitted successfully!");
            setRescheduleData({ open: false, pickupId: null, date: "", time: "" });
            fetchMyPickups();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to send reschedule request", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const stats = {
        total: pickups.length,
        completed: pickups.filter(p => p.status === 'completed').length,
        inProgress: pickups.filter(p => p.status === 'in_progress').length,
        scheduled: pickups.filter(p => p.status === 'scheduled').length
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-10 relative z-10">
                <h1 className="text-3xl font-bold drop-shadow-md tracking-tight" style={{ color: '#FFFFFF' }}>My Pickup Requests</h1>
                <p className="font-medium mt-1 text-base drop-shadow-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Manage and track your scheduled waste collections.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {/* Minimalist Premium Stat Cards */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] border border-white/50 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 mb-4 shadow-sm group-hover:bg-gray-200 transition-colors">
                            <Package size={24} />
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Requests</div>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">{stats.total}</div>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] border border-white/50 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</div>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">{stats.completed}</div>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] border border-white/50 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
                            <CalendarCheck size={24} />
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress</div>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">{stats.inProgress}</div>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] border border-white/50 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
                            <Clock size={24} />
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unassigned</div>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">{stats.scheduled}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20 bg-white/50 backdrop-blur-md rounded-3xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                        <p className="text-white font-bold text-sm uppercase tracking-widest animate-pulse">Loading Pickups...</p>
                    </div>
                </div>
            ) : pickups.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-xl p-16 text-center flex flex-col items-center justify-center group hover:bg-white/95 transition-all">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Package className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No pickups scheduled yet</h2>
                    <p className="text-gray-500 font-medium mb-8 max-w-sm">Ready to make an impact? Schedule your first waste pickup and contribute to a cleaner environment.</p>
                    <a href="/schedule" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2 transform hover:-translate-y-1">
                        <CalendarCheck size={18} />
                        Schedule Now
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {pickups.map(pickup => (
                        <div key={pickup._id} className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white/50 p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />

                            <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                                {/* Info Section */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(pickup.status)}`}>
                                            {pickup.status.replace("_", " ")}
                                        </div>
                                        {pickup.rescheduleRequest?.status === 'pending' && (
                                            <div className="px-4 py-1.5 rounded-full text-[10px] font-black border border-yellow-200 bg-yellow-50 text-yellow-700 uppercase tracking-widest flex items-center gap-1">
                                                <RotateCcw size={12} /> Reschedule Pending
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-auto lg:ml-0">
                                            <Clock size={12} />
                                            Requested: {new Date(pickup.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 capitalize mb-4 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                                            <Package size={20} />
                                        </span>
                                        {pickup.wasteTypes.join(", ")} Pickup
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                                            <div className="mt-1 text-green-600"><Calendar size={18} /></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Date</div>
                                                <div className="text-sm font-bold text-gray-900">{pickup.scheduledDate}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                                            <div className="mt-1 text-green-600"><Clock size={18} /></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Slot</div>
                                                <div className="text-sm font-bold text-gray-900">{pickup.timeSlot}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 sm:col-span-2">
                                            <div className="mt-1 text-green-600"><MapPin size={18} /></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup Location</div>
                                                <div className="text-sm font-bold text-gray-900">{pickup.location.address}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Volunteer */}
                                    {role === 'volunteer' && pickup.status === 'in_progress' && (
                                        <div className="flex gap-4 mt-8">
                                            <button
                                                onClick={() => handleCancel(pickup._id)}
                                                disabled={actionLoading}
                                                className="px-6 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <X size={16} /> Cancel Pickup
                                            </button>
                                            <button
                                                onClick={() => setRescheduleData({ ...rescheduleData, open: true, pickupId: pickup._id })}
                                                disabled={actionLoading || pickup.rescheduleRequest?.status === 'pending'}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
                                            >
                                                <RotateCcw size={16} /> {pickup.rescheduleRequest?.status === 'pending' ? 'Reschedule Pending' : 'Reschedule'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Volunteer/NGO Details Section */}
                                <div className="lg:w-80 bg-gray-50/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 flex flex-col justify-center">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">
                                        {role === 'volunteer' ? 'NGO Information' : 'Volunteer Assigned'}
                                    </h4>
                                    {(role === 'volunteer' ? pickup.user : pickup.volunteer) ? (
                                        <div className="space-y-6">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-white border-4 border-green-50 flex items-center justify-center text-green-600 shadow-sm mb-3">
                                                    <User size={32} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-gray-900">
                                                        {(role === 'volunteer' ? pickup.user.username : pickup.volunteer.fullName) || 'Anonymous'}
                                                    </div>
                                                    <div className="text-[10px] text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full mt-1 inline-block border border-green-100">
                                                        Verified {role === 'volunteer' ? 'Partner' : 'Member'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="truncate font-medium">{(role === 'volunteer' ? pickup.user.email : pickup.volunteer.email)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 text-center">
                                            <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                                                <Clock size={32} />
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                {role === 'ngo' ? 'Waiting for volunteer...' : 'Matching with NGO...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleData.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Reschedule Request</h3>
                            <button onClick={() => setRescheduleData({ ...rescheduleData, open: false })} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Proposed Date</label>
                                <input
                                    type="text"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                                    placeholder="e.g. Oct 15"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Proposed Time Slot</label>
                                <input
                                    type="text"
                                    value={rescheduleData.time}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                                    placeholder="e.g. 10:00 AM - 12:00 PM"
                                />
                            </div>
                            <button
                                onClick={handleReschedule}
                                disabled={actionLoading}
                                className="w-full py-4 bg-[#123524] text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-[#0d281a] transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> {actionLoading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl scale-in-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Are you sure?</h3>
                            <p className="text-gray-500 font-medium mb-8">{confirmModal.message}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmModal({ open: false, pickupId: null, message: "", onConfirm: null })}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader className="animate-spin" size={18} /> : "Yes, Proceed"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* In-website Float Message (Toast) */}
            {toast.show && (
                <div className={`fixed bottom-10 right-10 z-[9999] animate-bounce-in`}>
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
                        ? 'bg-green-600 text-white border-green-500'
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
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
                @keyframes scale-in-center {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </div>
    );
}
