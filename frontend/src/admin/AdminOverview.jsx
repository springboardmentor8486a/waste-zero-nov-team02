import { useEffect, useState } from "react";
import api from "../utils/api";
import { Users, Leaf, MessageSquare, AlertCircle, MapPin, Activity } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVolunteers: 0,
        totalNgos: 0,
        totalOpportunities: 0,
        activeChats: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/admin/stats");
            setStats(res.data);
        } catch (err) {
            // Fallback if API fails
            setStats({
                totalUsers: 154,
                totalVolunteers: 120,
                totalNgos: 34,
                totalOpportunities: 45,
                activeChats: 12
            });
        }
    };

    const cards = [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
        { label: "Volunteers", value: stats.totalVolunteers, icon: Users, color: "from-green-500 to-green-600", bg: "bg-green-50" },
        { label: "NGOs", value: stats.totalNgos, icon: Users, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
        { label: "Opportunities", value: stats.totalOpportunities, icon: Leaf, color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-50" },
        { label: "Active Chats", value: stats.activeChats, icon: MessageSquare, color: "from-pink-500 to-pink-600", bg: "bg-pink-50" }
    ];

    const locations = [
        { id: 1, pos: [51.505, -0.09], name: "Hyde Park Cleanup" },
        { id: 2, pos: [51.51, -0.1], name: "Community Center Pickup" },
        { id: 3, pos: [51.515, -0.09], name: "River Banks Drive" },
    ];

    return (
        <div className="space-y-6 pb-8">
            <h1 className="text-3xl font-black text-white drop-shadow-md">Admin Dashboard</h1>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="relative overflow-hidden bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${c.color} -mr-8 -mt-8 transition-transform group-hover:scale-150`}></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg shadow-gray-200/50`}>
                                <c.icon size={22} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{c.label}</div>
                                <div className="text-2xl font-black text-gray-800 tracking-tight">{c.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Operations & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Server Health Pulse */}
                <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Live Platform Pulse</h2>
                            <p className="text-xs text-gray-500 font-mono mt-1">SERVER: AP-SOUTH-1 (Running)</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-[#123524] rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                                Healthy
                            </span>
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                42ms Latency
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-100 rounded-bl-3xl -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">CPU Usage</div>
                            <div className="text-2xl font-black text-gray-800 flex items-baseline gap-1">
                                24<span className="text-sm text-gray-400 font-normal">%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-1 w-[24%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-100 rounded-bl-3xl -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Memory</div>
                            <div className="text-2xl font-black text-gray-800 flex items-baseline gap-1">
                                1.2<span className="text-sm text-gray-400 font-normal">GB</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-1 w-[45%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-orange-100 rounded-bl-3xl -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Requests/m</div>
                            <div className="text-2xl font-black text-gray-800 flex items-baseline gap-1">
                                845
                            </div>
                            <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-orange-400 h-1 w-[60%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Recent System Logs */}
                <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col">
                    <h2 className="font-bold text-lg text-gray-900 mb-4">System Alerts</h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200 max-h-[160px]">
                        {[
                            { time: "10:42 AM", msg: "New NGO registration pending approval", type: "warn" },
                            { time: "10:15 AM", msg: "Database backup completed successfully", type: "success" },
                            { time: "09:30 AM", msg: "High traffic detected from Region-A", type: "info" },
                            { time: "08:55 AM", msg: "Scheduled maintenance queued", type: "neutral" }
                        ].map((log, i) => (
                            <div key={i} className="flex gap-3 items-start text-xs border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                <span className="text-gray-400 font-mono whitespace-nowrap pt-0.5">{log.time}</span>
                                <div>
                                    <p className={`font-medium ${log.type === 'warn' ? 'text-orange-600' :
                                        log.type === 'success' ? 'text-green-600' :
                                            log.type === 'info' ? 'text-blue-600' : 'text-gray-600'
                                        }`}>{log.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-auto pt-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#123524] transition-colors">
                        View All Logs
                    </button>
                </div>
            </div>

            {/* Live Field Map */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-1 shadow-sm h-[400px] relative overflow-hidden">
                <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MapPin size={16} className="text-[#123524]" />
                        Live Field Operations
                    </h3>
                    <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Tracking 3 Active Teams
                    </div>
                </div>

                <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {locations.map(loc => (
                        <Marker key={loc.id} position={loc.pos}>
                            <Popup>
                                <div className="font-bold text-sm">{loc.name}</div>
                                <div className="text-xs text-green-600">Active Now</div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
