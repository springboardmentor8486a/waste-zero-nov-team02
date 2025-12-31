import { useEffect, useState } from "react";
import api from "../utils/api";
import { Clock, ShieldAlert, UserX, Trash2, LogIn, UserPlus, Filter } from "lucide-react";

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Fetch logs (mock for now or real API)
        setLogs([
            { id: 1, type: "suspend", action: "User Suspended", detail: "Admin suspended user 'Bad Actor'", time: "2 mins ago", user: "Admin" },
            { id: 2, type: "delete", action: "Opportunity Deleted", detail: "Admin removed 'Invalid Post'", time: "1 hour ago", user: "Admin" },
            { id: 3, type: "login", action: "System Login", detail: "Admin logged in via IP 192.168.1.1", time: "3 hours ago", user: "System" },
            { id: 4, type: "register", action: "New Registration", detail: "New NGO 'OceanCleanup' registered", time: "5 hours ago", user: "OceanCleanup" },
            { id: 5, type: "alert", action: "High Traffic", detail: "Server load peaked at 85%", time: "12 hours ago", user: "System" },
        ]);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'suspend': return <UserX size={16} className="text-red-600" />;
            case 'delete': return <Trash2 size={16} className="text-orange-600" />;
            case 'login': return <LogIn size={16} className="text-blue-600" />;
            case 'register': return <UserPlus size={16} className="text-green-600" />;
            default: return <ShieldAlert size={16} className="text-gray-600" />;
        }
    };

    const getBadgeColor = (type) => {
        switch (type) {
            case 'suspend': return 'bg-red-100 border-red-200';
            case 'delete': return 'bg-orange-100 border-orange-200';
            case 'login': return 'bg-blue-100 border-blue-200';
            case 'register': return 'bg-green-100 border-green-200';
            default: return 'bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white drop-shadow-md">System Activity Logs</h1>
                    <p className="text-gray-200 mt-1 font-medium drop-shadow-sm">Audit trail and security events.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-[#123524] text-xs font-bold uppercase shadow hover:shadow-lg transition-all border border-white/50">
                    <Filter size={14} /> Filter Logs
                </button>
            </div>

            {/* Timeline Container */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl overflow-hidden p-6 md:p-8">
                <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-8">
                    {logs.map((log, i) => (
                        <div key={log.id} className="relative pl-8 md:pl-12 group">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md flex items-center justify-center ${i === 0 ? 'bg-[#123524] scale-110' : 'bg-gray-300'
                                }`}></div>

                            {/* Card Content */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    {log.time}
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeColor(log.type)}`}>
                                        {getIcon(log.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm md:text-base">{log.action}</h3>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">{log.detail}</p>
                                        <div className="mt-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                            By: {log.user}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#123524] transition-colors border-b border-dashed border-gray-300 hover:border-[#123524] pb-1">
                        Load Older Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
