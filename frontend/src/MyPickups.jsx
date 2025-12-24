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
    CalendarCheck
} from "lucide-react";
import api from "./utils/api";

export default function MyPickups() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchMyPickups();
    }, []);

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
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">My Pickup Requests</h1>
                <p className="text-gray-500 mt-1">Manage and track your scheduled waste collections.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <Package size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Requests</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">In Progress</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.scheduled}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unassigned</div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader className="animate-spin text-green-500" size={32} />
                </div>
            ) : pickups.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
                    <Package className="mx-auto text-gray-200 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">No pickups scheduled yet</h2>
                    <p className="text-gray-500 mt-2">Start by scheduling a new pickup from the sidebar.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {pickups.map(pickup => (
                        <div key={pickup._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">

                                {/* Info Section */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyle(pickup.status)}`}>
                                            {pickup.status.replace("_", " ")}
                                        </div>
                                        <span className="text-sm text-gray-400 font-medium">Requested on {new Date(pickup.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">{pickup.wasteTypes.join(", ")} Pickup</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Calendar size={18} className="text-green-500" />
                                            <span className="text-sm font-medium">{pickup.scheduledDate}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Clock size={18} className="text-green-500" />
                                            <span className="text-sm font-medium">{pickup.timeSlot}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 col-span-full">
                                            <MapPin size={18} className="text-green-500" />
                                            <span className="text-sm font-medium">{pickup.location.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Volunteer Details Section */}
                                <div className="lg:w-80 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Volunteer Assigned</h4>
                                    {pickup.volunteer ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-600">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{pickup.volunteer.fullName || 'Anonymous Volunteer'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold">Verified Volunteer</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="truncate">{pickup.volunteer.email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4 text-center">
                                            <div className="w-10 h-10 rounded-full bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-300 mb-2">
                                                <Clock size={20} />
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium italic">Waiting for a volunteer to accept this pickup...</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
