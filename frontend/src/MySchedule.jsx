import React, { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Loader,
    AlertCircle
} from "lucide-react";
import api from "./utils/api";

export default function MySchedule() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPickups = async () => {
            try {
                setLoading(true);
                const res = await api.get('/pickups/my');
                setPickups(res.data.data);
            } catch (err) {
                console.error("Error fetching my schedule:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPickups();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-500 mt-1">Track and manage your accepted waste collection tasks.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader className="animate-spin text-green-500" size={32} />
                </div>
            ) : pickups.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
                    <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">Your schedule is empty</h2>
                    <p className="text-gray-500 mt-2">Go to "Opportunities" to find and accept waste pickups.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pickups.map(pickup => (
                        <div key={pickup._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <div>
                                        <div className="font-bold text-gray-900 capitalize">{pickup.wasteTypes.join(", ")} Collection</div>
                                        <div className="text-xs text-green-600 font-bold mt-0.5 mb-1 flex items-center gap-1">
                                            NGO: {pickup.user?.username || 'Eco Partner'} • {pickup.user?.email}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {pickup.scheduledDate}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {pickup.timeSlot}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-gray-900">{pickup.location.address}</div>
                                    <div className="text-xs text-gray-400 font-medium">Estimated: {pickup.points_estimated} Pts</div>
                                </div>

                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(pickup.status)}`}>
                                    {pickup.status.replace("_", " ")}
                                </div>

                                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                                    <AlertCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
