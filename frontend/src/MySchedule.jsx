import React, { useState, useEffect } from "react";
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
    Layout
} from "lucide-react";
import api from "./utils/api";

export default function MySchedule() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rescheduleData, setRescheduleData] = useState({ open: false, pickupId: null, date: "", time: "" });
    const [actionLoading, setActionLoading] = useState(false);
    const [goals, setGoals] = useState({ points: 0, hours: 0, timeLimit: 0 });
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const fetchMyPickups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pickups/my');
            setPickups(res.data.data);

            // Also fetch profile for goals
            const profileRes = await api.get('/profile');
            if (profileRes.data.user.volunteerDetails?.goals) {
                setGoals(profileRes.data.user.volunteerDetails.goals);
            }
            setUserProfile(profileRes.data.user);
        } catch (err) {
            console.error("Error fetching my schedule:", err);
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
            alert("Goals updated successfully!");
            setShowGoalModal(false);
        } catch (err) {
            alert("Failed to update goals");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel your participation in this pickup?")) return;
        try {
            setActionLoading(true);
            await api.delete(`/pickups/${id}/cancel`);
            alert("Pickup cancelled successfully.");
            fetchMyPickups();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel pickup");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            alert("Please select both date and time");
            return;
        }
        try {
            setActionLoading(true);
            const res = await api.put(`/pickups/${rescheduleData.pickupId}/reschedule-request`, {
                proposedDate: rescheduleData.date,
                proposedTime: rescheduleData.time
            });
            alert("Reschedule request sent to NGO for approval.");
            setRescheduleData({ open: false, pickupId: null, date: "", time: "" });
            fetchMyPickups();
        } catch (err) {
            console.error("Reschedule error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to send reschedule request";
            alert(`Error: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDone = async (id) => {
        if (!window.confirm("Are you sure you want to mark this pickup as done? The NGO will verify it shortly.")) return;
        try {
            setActionLoading(true);
            await api.put(`/pickups/${id}/mark-done`);
            alert("Pickup marked as done. Awaiting NGO verification.");
            fetchMyPickups();
        } catch (err) {
            console.error("Mark done error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to mark pickup as done";
            alert(`Error: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    const getMaterialIcon = (types) => {
        const primary = types[0].toLowerCase();
        if (primary.includes('plastic')) return <Milk size={28} />;
        if (primary.includes('metal') || primary.includes('can')) return <Container size={28} />;
        if (primary.includes('paper')) return <FileText size={28} />;
        if (primary.includes('electronic') || primary.includes('e-waste')) return <CircuitBoard size={28} />;
        if (primary.includes('glass')) return <Milk size={28} />;
        return <Package size={28} />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'awaiting_verification': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const stats = {
        total: pickups.length,
        inProgress: pickups.filter(p => p.status === 'in_progress').length,
        completed: pickups.filter(p => p.status === 'completed').length,
        totalPoints: pickups.reduce((acc, p) => acc + (p.points_estimated || 0), 0)
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">My Schedule</h1>
                    <p className="text-white/80 mt-1 font-medium">Track and manage your accepted waste collection tasks.</p>
                </div>
                <button
                    onClick={() => setShowGoalModal(true)}
                    className="px-6 py-3 bg-white border-2 border-[#123524] text-[#123524] rounded-2xl font-black flex items-center gap-2 hover:bg-green-50 transition-all shadow-sm"
                >
                    <Target size={20} /> Set Goals
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#123524]">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Active</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Loader size={24} className="animate-spin-slow" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.inProgress}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">In Progress</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.completed}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Completed</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <Check size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900">{stats.totalPoints}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Estimated Pts</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader className="animate-spin text-[#123524]" size={32} />
                </div>
            ) : pickups.length === 0 ? (
                <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-20 text-center">
                    <Calendar className="mx-auto text-gray-200 mb-6" size={64} />
                    <h2 className="text-2xl font-black text-gray-800">Your schedule is empty</h2>
                    <p className="text-gray-500 mt-2 font-medium">Go to "Opportunities" to find and accept waste pickups.</p>
                </div>
            ) : (
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Main Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pickups.map(pickup => (
                                <div key={pickup._id} className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#123524] group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                            {getMaterialIcon(pickup.wasteTypes)}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusColor(pickup.status)}`}>
                                                {pickup.status.replace("_", " ")}
                                            </div>
                                            {pickup.rescheduleRequest?.status === 'pending' && (
                                                <span className="text-[10px] font-black text-yellow-600 uppercase bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 italic tracking-tight">
                                                    Reschedule Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-black text-gray-900 capitalize text-xl mb-1 tracking-tight">
                                            {pickup.wasteTypes.join(", ")}
                                        </h3>
                                        <p className="text-xs text-[#123524] font-bold mb-4 flex items-center gap-1.5 opacity-80">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#123524] animate-pulse" />
                                            NGO: {pickup.user?.username || 'Eco Partner'}
                                        </p>

                                        <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <Calendar size={16} className="text-[#123524]" />
                                                <span>{pickup.scheduledDate}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <Clock size={16} className="text-[#123524]" />
                                                <span>{pickup.timeSlot}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                                <MapPin size={16} className="text-[#123524]" />
                                                <span className="truncate">{pickup.location.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">
                                            <span>Reward Estimate</span>
                                            <span className="text-[#123524] font-black">{pickup.points_estimated} Pts</span>
                                        </div>

                                        {pickup.status === 'in_progress' && (
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button
                                                    onClick={() => handleCancel(pickup._id)}
                                                    disabled={actionLoading}
                                                    className="py-2.5 px-3 bg-white border border-red-100 text-red-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-red-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                                <button
                                                    onClick={() => setRescheduleData({ ...rescheduleData, open: true, pickupId: pickup._id })}
                                                    disabled={actionLoading || pickup.rescheduleRequest?.status === 'pending'}
                                                    className="py-2.5 px-3 bg-[#123524] text-white border border-[#2bad4d] rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-[#2bad4d] transition-all shadow-md shadow-green-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    <RotateCcw size={14} /> {pickup.rescheduleRequest?.status === 'pending' ? 'Pending' : 'Edit'}
                                                </button>
                                            </div>
                                        )}
                                        {pickup.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleMarkDone(pickup._id)}
                                                disabled={actionLoading}
                                                className="w-full mt-2 py-3 bg-[#123524] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-[#2bad4d] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <CheckCircle2 size={16} /> Mark Task as Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Dynamic Info Panel */}
                    <div className="xl:w-80 flex flex-col gap-6">
                        {/* Goal Progress Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-8 -mt-8" />
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#123524] rounded-xl text-white">
                                        <Trophy size={20} />
                                    </div>
                                    <h4 className="font-black text-gray-900 text-lg">Goal Progress</h4>
                                </div>
                                <div className="space-y-6">
                                    {goals.points > 0 && (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                <span>Monthly Points</span>
                                                <span className="text-[#123524]">{stats.totalPoints} / {goals.points}</span>
                                            </div>
                                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#123524] transition-all duration-500" style={{ width: `${Math.min((stats.totalPoints / (goals.points || 1)) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    {goals.hours > 0 && (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                <span>Volunteer Hours</span>
                                                <span className="text-blue-600">0 / {goals.hours}</span>
                                            </div>
                                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: '0%' }} />
                                            </div>
                                        </div>
                                    )}
                                    {goals.timeLimit > 0 && (
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                <span>Time Limit</span>
                                                <span className="text-purple-600">{goals.timeLimit} Days</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold mt-6 italic">Keep going! You're making an impact.</p>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-[32px] p-8 border border-green-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#123524] rounded-xl text-white">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h4 className="font-black text-green-900 text-lg">Verification</h4>
                            </div>
                            <p className="text-sm text-green-800 font-medium leading-relaxed">
                                Once you've collected the waste, mark the task as done. Points will be awarded after NGO verification.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gray-400 rounded-xl text-white">
                                    <AlertCircle size={24} />
                                </div>
                                <h4 className="font-black text-gray-900 text-lg">Support</h4>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                NGOs typically verify completions within 24 hours. Points appear in your profile automatically.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative">
                        <button
                            onClick={() => setShowGoalModal(false)}
                            className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-[#123524] mx-auto mb-4">
                                <Target size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Set Your Goals</h3>
                            <p className="text-gray-500 font-medium">Define your impact targets for this month.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                                    <Zap size={14} className="text-yellow-500" /> Points Goal
                                </label>
                                <input
                                    type="number"
                                    value={goals.points}
                                    onChange={(e) => setGoals({ ...goals, points: parseInt(e.target.value) || 0 })}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-3xl font-black text-xl transition-all outline-none"
                                    placeholder="e.g. 1000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                                    <Hourglass size={14} className="text-blue-500" /> Free Hours
                                </label>
                                <input
                                    type="number"
                                    value={goals.hours}
                                    onChange={(e) => setGoals({ ...goals, hours: parseInt(e.target.value) || 0 })}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl font-black text-xl transition-all outline-none"
                                    placeholder="e.g. 20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                                    <Clock size={14} className="text-purple-500" /> Time Limit (Days/Task)
                                </label>
                                <input
                                    type="number"
                                    value={goals.timeLimit}
                                    onChange={(e) => setGoals({ ...goals, timeLimit: parseInt(e.target.value) || 0 })}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-3xl font-black text-xl transition-all outline-none"
                                    placeholder="e.g. 3"
                                />
                            </div>

                            <button
                                onClick={handleSaveGoals}
                                disabled={actionLoading}
                                className="w-full py-5 bg-[#123524] text-white rounded-3xl font-black text-lg shadow-xl shadow-green-100 hover:bg-[#2bad4d] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                <Save size={20} />
                                {actionLoading ? 'Saving...' : 'Save Objectives'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleData.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Reschedule</h3>
                            <button onClick={() => setRescheduleData({ ...rescheduleData, open: false })} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">New Date</label>
                                <input
                                    type="date"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-3xl font-bold outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">New Time Slot</label>
                                <input
                                    type="time"
                                    value={rescheduleData.time}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-3xl font-bold outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleReschedule}
                                disabled={actionLoading}
                                className="w-full py-5 bg-[#123524] text-white rounded-3xl font-black shadow-lg shadow-green-100 hover:bg-[#2bad4d] transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                <Save size={20} /> {actionLoading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
