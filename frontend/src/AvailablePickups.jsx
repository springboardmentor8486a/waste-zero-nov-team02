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
    X
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "./utils/api";

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

    useEffect(() => {
        fetchPickups();
    }, []);

    const fetchPickups = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pickups/available');
            setPickups(res.data.data);
        } catch (err) {
            console.error("Error fetching available pickups:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!window.confirm("Are you sure you want to accept this pickup? You will be responsible for the collection.")) return;
        try {
            const res = await api.put(`/pickups/${id}/accept`);
            if (res.data.success) {
                alert("Pickup accepted! It's now in your schedule.");
                fetchPickups(); // Refresh list
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to accept pickup");
        }
    };

    const handleReject = (id) => {
        // Local hide for this session
        setRejectedIds([...rejectedIds, id]);
    };

    const filteredPickups = pickups
        .filter(p => !rejectedIds.includes(p._id))
        .filter(p => wasteType === 'All Types' || p.wasteTypes.includes(wasteType.toLowerCase()));

    // Inline styles for the component to avoid external CSS issues
    const styles = `
    .sticky-sidebar { position: sticky; top: 1rem; }
    .pickup-card { transition: transform 0.2s, box-shadow 0.2s; }
    .pickup-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .filter-badge { cursor: pointer; transition: all 0.2s; }
    .filter-badge.active { background: #059669; color: white; border-color: #059669; }
    .btn-accept { background: #00ea61; color: #000; font-weight: 700; border-radius: 12px; }
    .btn-reject { background: #fff; color: #374151; border: 1px solid #e5e7eb; font-weight: 600; border-radius: 12px; }
  `;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <style>{styles}</style>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Pickup Opportunities</h1>
                    <p className="mt-2 text-lg text-gray-500 font-medium">Browse and manage waste collection tasks from local NGOs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 font-semibold shadow-sm text-gray-700">
                        <Filter size={18} /> Filters
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl hover:bg-green-800 font-bold shadow-md shadow-green-200"
                    >
                        {viewMode === 'grid' ? <MapIcon size={18} /> : <Trash2 size={18} />}
                        {viewMode === 'grid' ? 'Map View' : 'Grid View'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Filters */}
                <aside className="lg:col-span-1 space-y-6 sticky-sidebar">
                    {/* Distance Slider */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-gray-800">Distance</label>
                            <span className="text-sm border bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-bold">{distance} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold">
                            <span>1km</span>
                            <span>50km</span>
                        </div>
                    </div>

                    {/* Urgency Filter */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Urgency</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={urgency.urgent} onChange={() => setUrgency({ ...urgency, urgent: !urgency.urgent })} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <div>
                                    <div className="text-sm font-bold text-gray-700">Urgent</div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-green-500 transition-colors">Within 24 hours</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={urgency.flexible} onChange={() => setUrgency({ ...urgency, flexible: !urgency.flexible })} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <div>
                                    <div className="text-sm font-bold text-gray-700">Flexible</div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-green-500 transition-colors">Anytime this week</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={urgency.scheduled} onChange={() => setUrgency({ ...urgency, scheduled: !urgency.scheduled })} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <div>
                                    <div className="text-sm font-bold text-gray-700">Scheduled</div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-green-500 transition-colors">Specific time slots</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Waste Type Type Labels */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Waste Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {['All Types', 'Plastic', 'Organic', 'E-Waste', 'Metal'].map(tag => (
                                <span
                                    key={tag}
                                    onClick={() => setWasteType(tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border filter-badge ${wasteType === tag ? 'active' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600'}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Pickup Opportunities Grid */}
                <main className="lg:col-span-3">
                    {loading ? (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center animate-pulse">
                            <Package className="mx-auto mb-4 text-gray-300" size={48} />
                            <div className="text-gray-400 font-bold">Fetching local opportunities...</div>
                        </div>
                    ) : filteredPickups.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                            <Trash2 className="mx-auto mb-4 text-gray-300" size={48} />
                            <div className="text-gray-900 font-bold text-xl">No pickups available right now</div>
                            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredPickups.map(pickup => (
                                <div key={pickup._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pickup-card flex flex-col">
                                    {/* Card Header: NGO Info */}
                                    <div className="p-5 flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 overflow-hidden">
                                                {/* Placeholder NGO Logo */}
                                                <TrendingUp className="text-green-600" size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{pickup.user?.username || 'Partner NGO'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Posted {new Date(pickup.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg">Urgent</span>
                                    </div>

                                    {/* Body: Specs */}
                                    <div className="px-5 pb-5 grid grid-cols-2 gap-y-4">
                                        <div className="flex items-center gap-2">
                                            <Trash2 size={16} className="text-green-500" />
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold">Waste Type</div>
                                                <div className="text-sm font-bold text-gray-800 capitalize leading-tight">{pickup.wasteTypes.join(", ")}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-green-500" />
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold">Quantity</div>
                                                <div className="text-sm font-bold text-gray-800 leading-tight">{pickup.amount} {pickup.unit.includes("kg") ? "kg" : "bags"}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-green-500" />
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold">Date & Time</div>
                                                <div className="text-sm font-bold text-gray-800 leading-tight">{pickup.scheduledDate}, {pickup.timeSlot.split(" - ")[0]}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-green-500" />
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold">Location</div>
                                                <div className="text-sm font-bold text-gray-800 leading-tight text-ellipsis overflow-hidden whitespace-nowrap w-24">{pickup.location.address}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map Snippet */}
                                    <div className="h-40 w-full relative group">
                                        <div className="absolute inset-0 z-10 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none"></div>
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
                                    </div>

                                    {/* Footer: Actions */}
                                    <div className="p-4 flex gap-3 mt-auto">
                                        <button
                                            onClick={() => handleReject(pickup._id)}
                                            className="flex-1 py-3 btn-reject hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAccept(pickup._id)}
                                            className="flex-[1.5] py-3 btn-accept hover:shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2"
                                        >
                                            Accept Pickup
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}
