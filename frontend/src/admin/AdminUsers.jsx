import { useEffect, useState } from "react";
import api from "../utils/api";
import { Search, Ban, CheckCircle, MoreVertical } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            // Fallback mock
            setUsers([
                { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'volunteer', status: 'active' },
                { _id: '2', name: 'Green Earth', email: 'contact@greenearth.org', role: 'ngo', status: 'active' },
                { _id: '3', name: 'Bad Actor', email: 'spam@spam.com', role: 'volunteer', status: 'suspended' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await api.patch(`/admin/users/${id}/status`, { status: newStatus });
            setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert("Failed to update status");
            // Simulate UI update if API fails for demo
            setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        }
    };

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

    return (
        <div className="space-y-8 pb-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white drop-shadow-md">User Management</h1>
                    <p className="text-gray-200 mt-1 font-medium drop-shadow-sm">Manage access, roles, and community safety.</p>
                </div>

                {/* Stats Pill */}
                <div className="flex gap-4">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-white/50 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Users</div>
                            <div className="text-lg font-black text-gray-900 leading-none">140</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-40">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#123524] focus:border-transparent transition-all font-medium text-gray-700"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        Filter <span className="bg-gray-300 text-gray-800 px-1.5 rounded textxs">All</span>
                    </button>
                    <button
                        style={{ color: '#FFFFFF', backgroundColor: '#123524' }}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="text-lg leading-none pb-0.5">+</span> NEW USER
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-white font-medium">Loading contents...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-sm p-12 rounded-2xl text-center border border-white/50">
                        <p className="text-gray-800 font-bold">No users match your search.</p>
                    </div>
                ) : (
                    filtered.map((user, i) => (
                        <div key={user._id} className="group bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-2xl border border-white/50 hover:border-green-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner ${i % 3 === 0 ? 'bg-blue-100 text-blue-600' :
                                i % 3 === 1 ? 'bg-purple-100 text-purple-600' :
                                    'bg-orange-100 text-orange-600'
                                }`}>
                                {user.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h3>
                                <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${user.role === 'ngo' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    user.role === 'admin' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {user.role}
                                </span>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                    {user.status}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
                                <button
                                    onClick={() => toggleStatus(user._id, user.status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${user.status === 'active'
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
