import { useEffect, useState } from "react";
import api from "../utils/api";
import { Search, Trash2, Eye } from "lucide-react";

export default function AdminOpportunities() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await api.get("/admin/opportunities"); // or /opportunities
            setItems(res.data.opportunities || res.data); // flexible
        } catch (err) {
            setItems([
                { _id: '1', title: 'Beach Cleanup', ngo: 'Green Earth', location: 'Brighton', status: 'Open' },
                { _id: '2', title: 'Park Recycling', ngo: 'Urban Eco', location: 'Central Park', status: 'Closed' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
        try {
            await api.delete(`/admin/opportunities/${id}`);
            setItems(items.filter(i => i._id !== id));
        } catch (err) {
            alert("Failed to delete");
            setItems(items.filter(i => i._id !== id)); // optimistic
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white drop-shadow-md">Manage Opportunities</h1>
                    <p className="text-gray-200 mt-1 font-medium drop-shadow-sm">Review volunteering events and campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-[#123524] font-bold text-xs uppercase shadow hover:shadow-lg transition-all">
                        Active ({items.filter(i => i.status === 'Open').length})
                    </button>
                    <button
                        style={{ color: '#FFFFFF', backgroundColor: '#123524' }}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase shadow hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <span className="text-sm">+</span> NEW EVENT
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length === 0 && !loading ? (
                    <div className="col-span-full text-center py-12 text-white/50 font-bold text-xl">No opportunities found.</div>
                ) : (
                    items.map(item => (
                        <div key={item._id} className="group relative bg-white/90 backdrop-blur rounded-2xl border border-white/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            {/* Card Top Border/Tag */}
                            <div className={`h-1.5 w-full ${item.status === 'Open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {item.status}
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#123524] transition-colors">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-[#123524] transition-colors">{item.title}</h3>

                                <div className="space-y-3 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="text-[10px] font-bold">NG</span>
                                        </div>
                                        <span className="font-medium">{item.ngoName || item.ngo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <span className="text-[10px] font-bold">LO</span>
                                        </div>
                                        <span>{item.location}</span>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-xs font-bold uppercase text-gray-500 hover:border-[#123524] hover:text-[#123524] hover:bg-green-50 transition-all">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
