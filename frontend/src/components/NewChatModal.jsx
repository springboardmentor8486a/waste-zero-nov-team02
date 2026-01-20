import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, CheckCircle, User } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

export default function NewChatModal({ isOpen, onClose, onSendRequest }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSearch = async (val) => {
        setSearchTerm(val);
        setError(null);
        const trimmed = val.trim();
        if (trimmed.length < 2) {
            setUsers([]);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/users/search?q=${trimmed}`);
            setUsers(res.data.data);
            if (res.data.data.length === 0) setError("No users found");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to search users");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSend = () => {
        if (!selectedUser) return;
        setSentRequests([...sentRequests, selectedUser.id]);
        if (onSendRequest) {
            onSendRequest(selectedUser, message);
        }
        setSelectedUser(null);
        setMessage('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-white/20 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">New Connection</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-50">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, username or email..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/10 rounded-xl text-sm outline-none transition-all placeholder-gray-400"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
                        {loading ? (
                            <LoadingSpinner />
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                {error ? (
                                    <p className="text-sm text-red-500">{error}</p>
                                ) : (
                                    <p className="text-sm">{searchTerm.length < 2 ? "Type at least 2 characters to search" : "No users found"}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm overflow-hidden border border-gray-200">
                                                {user.avatar && user.avatar !== 'no-photo.jpg' ? (
                                                    <img
                                                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    user.name ? user.name.charAt(0).toUpperCase() : '?'
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                                                <p className="text-[11px] text-gray-500 capitalize">{user.role} • {user.email}</p>
                                            </div>
                                        </div>

                                        {sentRequests.includes(user.id) ? (
                                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                                <CheckCircle size={14} />
                                                Sent
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className={`p-2 rounded-lg transition-all shadow-sm ${selectedUser?.id === user.id ? 'bg-[#123524] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                title="Select User"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview Message Section */}
                    {selectedUser && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-6 bg-emerald-50/50 border-t border-emerald-100 shadow-inner"
                        >
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Initial Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi ${selectedUser.name}, I'd like to connect...`}
                                    className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-24 shadow-sm"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="flex-1 py-2.5 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all border border-gray-100"
                                    >Cancel</button>
                                    <button
                                        onClick={handleConfirmSend}
                                        className="flex-[2] py-2.5 bg-[#123524] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#0d281a] transition-all shadow-lg shadow-emerald-900/10"
                                    >Send Request</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
