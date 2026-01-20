import React, { useState, useEffect } from "react";
import {
    MapPin,
    Search,
    Filter,
    Clock,
    Calendar,
    ArrowRight,
    TrendingUp,
    Package,
    CheckCircle2,
    Trash2,
    Map as MapIcon,
    X,
    AlertCircle,
    Loader2 as Loader
} from "lucide-react";
import PageHeader from "./components/PageHeader";
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "./utils/api";
import { useUI } from "./context/UIContext";

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
export default function AvailablePickups() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(15);
    const [urgency, setUrgency] = useState({
        urgent: true,
        flexible: false,
        scheduled: false
    });
    const [wasteType, setWasteType] = useState('All Types');
    const [viewMode, setViewMode] = useState('grid');
    const [rejectedIds, setRejectedIds] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const { showToast, confirm } = useUI();

    useEffect(() => {
        fetchPickups();
    }, []);

    const fetchPickups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pickups/available');
            setPickups(res.data.data);

            // Also fetch user profile for ownership check
            const profileRes = await api.get('/profile');
            setUserProfile(profileRes.data.user || profileRes.data);
        } catch (err) {
            console.error("Error fetching available pickups:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        const isConfirmed = await confirm({
            title: "Accept Pickup?",
            message: "Are you sure you want to accept this pickup? You will be responsible for the collection.",
            confirmText: "Yes, Accept",
            isDangerous: false
        });

        if (!isConfirmed) return;

        try {
            setActionLoading(true);
            const res = await api.put(`/pickups/${id}/accept`);
            if (res.data.success) {
                // Send Chat Request to NGO
                const pickup = res.data.data;
                const ownerId = pickup.user && (pickup.user._id || pickup.user);
                if (ownerId) {
                    try {
                        await api.post('/chat/request', { receiverId: ownerId });
                    } catch (err) {
                        console.log("Chat req auto-send info:", err.response?.data?.message);
                    }
                }

                showToast("Pickup accepted! It's now in your schedule.", "success");
                fetchPickups();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to accept pickup", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = (id) => {
        // Local hide for this session
        setRejectedIds([...rejectedIds, id]);
    };

    const filteredPickups = pickups
        .filter(p => !rejectedIds.includes(p._id))
        .filter(p => (p.user?._id || p.user) !== userProfile?._id)
        .filter(p => {
            if (wasteType === 'All Types') return true;
            return p.wasteTypes.some(type => type.toLowerCase() === wasteType.toLowerCase());
        });

    // Inline styles for the component to avoid external CSS issues
    const styles = `
    .sticky-sidebar { position: sticky; top: 1rem; }
    .pickup-card { transition: transform 0.2s, box-shadow 0.2s; }
    .pickup-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .filter-badge { cursor: pointer; transition: all 0.2s; }
    .filter-badge.active { background: #123524; color: white; border-color: #123524; }
    .btn-accept { background: #123524; color: #fff; font-weight: 400; border-radius: 12px; }
    .btn-reject { background: #fff; color: #374151; border: 1px solid #e5e7eb; font-weight: 400; border-radius: 12px; }
  `;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <PageHeader
                    title="Available Tasks"
                    subtitle="Explore and accept local waste collection opportunities."
                />

                <div className="flex items-center gap-3 relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl font-normal uppercase tracking-widest text-[10px] shadow-sm transition-all ${showFilterPanel ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Filter size={16} /> Filters
                        </button>

                        {/* Dropdown Panel */}
                        <AnimatePresence>
                            {showFilterPanel && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-4 w-80 bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 z-[999]"
                                >
                                    <div className="space-y-8">
                                        {/* Distance Slider */}
                                        <div>
                                            <div className="flex justify-between items-center mb-5">
                                                <label className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Radius</label>
                                                <span className="text-[10px] bg-emerald-50 text-[#123524] px-2 py-1 rounded-md font-medium border border-[#123524]/10">{distance} KM</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={distance}
                                                onChange={(e) => setDistance(e.target.value)}
                                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#123524]"
                                            />
                                        </div>

                                        {/* Waste Type Type Labels */}
                                        <div>
                                            <h3 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {['All Types', 'Plastic', 'Organic', 'E-Waste'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setWasteType(tag)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-normal uppercase tracking-widest border transition-all ${wasteType === tag ? 'bg-[#123524] text-white border-[#123524] shadow-md shadow-emerald-900/10' : 'bg-gray-50 text-gray-400 border-transparent hover:border-emerald-100 hover:text-[#123524]'}`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#123524] text-white rounded-xl font-normal uppercase tracking-widest text-[10px] hover:bg-[#0d281a] shadow-lg shadow-emerald-900/10 transition-all"
                    >
                        {viewMode === 'grid' ? <MapIcon size={16} /> : <Trash2 size={16} />}
                        {viewMode === 'grid' ? 'Map Mode' : 'Grid Mode'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Main Content Area */}
                <main className="w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="text-emerald-500 opacity-30 mb-4"
                            >
                                <Loader size={40} />
                            </motion.div>
                            <p className="text-[10px] text-gray-400 font-normal uppercase tracking-[0.2em]">Scanning local areas...</p>
                        </div>
                    ) : filteredPickups.length === 0 ? (
                        <div className="premium-card p-24 text-center">
                            <Trash2 className="mx-auto mb-6 text-gray-100" size={64} />
                            <div className="text-xl font-normal text-gray-900 tracking-tight">Zero pickups found</div>
                            <p className="text-gray-400 mt-2 font-medium max-w-xs mx-auto text-sm">No tasks match your current criteria. Consider expanding your radius.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPickups.map(pickup => (
                                <motion.div
                                    key={pickup._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="premium-card group flex flex-col h-full hover:shadow-xl transition-all border border-gray-50"
                                >
                                    {/* Map Snippet at top */}
                                    <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                                        <MapContainer
                                            center={pickup.location.coordinates || { lat: 47.6, lng: -122.3 }}
                                            zoom={13}
                                            zoomControl={false}
                                            attributionControl={false}
                                            dragging={false}
                                            doubleClickZoom={false}
                                            scrollWheelZoom={false}
                                            style={{ height: "100%", width: "100%" }}
                                        >
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={pickup.location.coordinates || { lat: 47.6, lng: -122.3 }} />
                                        </MapContainer>
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[9px] font-normal uppercase tracking-widest text-[#059669] rounded-lg shadow-sm border border-emerald-100 flex items-center gap-1.5">
                                                <TrendingUp size={10} /> {pickup.amount} {pickup.unit}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Package size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-normal text-gray-900 truncate uppercase tracking-tight">{pickup.user?.username || 'Partner'}</div>
                                                <div className="text-[9px] text-gray-400 font-normal uppercase tracking-widest mt-0.5">{new Date(pickup.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[#059669]">
                                                <AlertCircle size={14} />
                                                <span className="text-[9px] font-normal uppercase tracking-tighter">New Opportunity</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <Trash2 size={14} className="text-gray-300" />
                                                <span className="text-[11px] font-normal uppercase tracking-tight">{pickup.wasteTypes.join(", ")}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <Calendar size={14} className="text-gray-300" />
                                                <span className="text-[11px] font-normal uppercase tracking-tight">{pickup.scheduledDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <MapPin size={14} className="text-gray-300" />
                                                <span className="text-[11px] font-normal uppercase tracking-tight truncate">{pickup.location.address}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            <button
                                                onClick={() => handleReject(pickup._id)}
                                                className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-normal uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAccept(pickup._id)}
                                                className="flex-[2] py-3 bg-[#123524] text-white rounded-xl text-[9px] font-normal uppercase tracking-widest hover:bg-[#0d281a] shadow-sm transition-all"
                                            >
                                                Accept Mission
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="premium-card overflow-hidden h-[600px] relative">
                            <MapContainer
                                center={filteredPickups[0]?.location?.coordinates || { lat: 47.6, lng: -122.3 }}
                                zoom={11}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {filteredPickups.map(p => (
                                    <Marker key={p._id} position={p.location.coordinates || { lat: 47.6, lng: -122.3 }}>
                                        <Popup>
                                            <div className="p-3">
                                                <div className="font-normal text-gray-900 mb-1 uppercase text-[10px] tracking-widest">{p.wasteTypes.join(", ")}</div>
                                                <div className="text-[10px] text-gray-400 font-normal uppercase tracking-tight mb-4">{p.location.address}</div>
                                                <button
                                                    onClick={() => handleAccept(p._id)}
                                                    className="w-full py-2 bg-[#123524] text-white text-[9px] font-normal rounded-lg uppercase tracking-widest"
                                                >
                                                    Accept Mission
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
