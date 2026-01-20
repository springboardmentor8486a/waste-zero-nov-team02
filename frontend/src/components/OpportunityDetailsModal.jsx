import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, TrendingUp, Calendar, MapPin, Star } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

export default function OpportunityDetailsModal({ isOpen, onClose, opportunity }) {
    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        if (isOpen && opportunity) {
            fetchDetails();
        }
    }, [isOpen, opportunity]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const oppId = opportunity._id || opportunity.id;
            const [partsRes, feedRes] = await Promise.all([
                api.get(`/applications/opportunity/${oppId}`),
                api.get(`/feedback/opportunity/${oppId}`)
            ]);

            setParticipants(partsRes.data.data || []);
            setFeedbacks(feedRes.data.data || []);
        } catch (err) {
            console.error("Error fetching opportunity details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !opportunity) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header Image/Banner */}
                    <div className="h-64 relative overflow-hidden bg-emerald-900">
                        {opportunity.cover ? (
                            <img
                                src={opportunity.cover.startsWith('http') ? opportunity.cover : `http://localhost:5000${opportunity.cover}`}
                                alt={opportunity.title}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-teal-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all z-10">
                            <X size={24} />
                        </button>

                        <div className="absolute bottom-8 left-10 right-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-tight">{opportunity.title}</h2>
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                                    <Calendar size={14} /> {opportunity.date}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-xs font-medium border border-gray-100">
                                    <MapPin size={14} /> {typeof opportunity.location === 'object' ? opportunity.location.address : opportunity.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left Column: Description & Impacts */}
                            <div className="lg:col-span-2 space-y-10">
                                <section>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Mission Brief</h3>
                                    <p className="text-gray-600 leading-relaxed">{opportunity.short || opportunity.description}</p>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Collective Impact</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-900">+{opportunity.points || 500}</div>
                                            <div className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest mt-1">Impact Points</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                                                <Users size={20} />
                                            </div>
                                            <div className="text-2xl font-bold text-blue-900">{opportunity.registered_count || 0} / {opportunity.capacity || '∞'}</div>
                                            <div className="text-[10px] font-medium text-blue-600 uppercase tracking-widest mt-1">Squad Members</div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feedbacks & Reviews</h3>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{feedbacks.length} Total</span>
                                    </div>

                                    {loading ? <LoadingSpinner /> : (
                                        <div className="space-y-4">
                                            {feedbacks.length === 0 ? (
                                                <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                    <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-400">No feedback shared yet for this mission.</p>
                                                </div>
                                            ) : (
                                                feedbacks.map((f) => (
                                                    <div key={f._id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-emerald-500 border border-emerald-50">
                                                                    {f.fromUser?.avatar ? (
                                                                        <img src={f.fromUser.avatar.startsWith('http') ? f.fromUser.avatar : `http://localhost:5000${f.fromUser.avatar}`} className="w-full h-full object-cover rounded-full" />
                                                                    ) : (f.fromUser?.username?.charAt(0) || '?')}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-gray-900">{f.fromUser?.fullName || f.fromUser?.username}</div>
                                                                    <div className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                                {[...Array(f.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 italic">"{f.content}"</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Right Column: Participants */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Enlisted Volunteers</h3>
                                    <div className="space-y-3">
                                        {loading ? <LoadingSpinner /> : (
                                            participants.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">Queue is currently empty...</p>
                                            ) : (
                                                participants.map((p) => (
                                                    <div key={p._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                                                            {p.volunteer_id?.avatar ? (
                                                                <img src={p.volunteer_id.avatar.startsWith('http') ? p.volunteer_id.avatar : `http://localhost:5000${p.volunteer_id.avatar}`} className="w-full h-full object-cover" />
                                                            ) : (p.volunteer_id?.username?.charAt(0) || '?')}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                                {p.volunteer_id?.fullName || p.volunteer_id?.username || 'Private Member'}
                                                            </div>
                                                            <div className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">
                                                                Volunteer • {p.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                </section>

                                <div className="p-6 bg-[#123524] rounded-[32px] text-white">
                                    <h4 className="text-sm font-semibold mb-2">Ready to join?</h4>
                                    <p className="text-[10px] text-emerald-100 opacity-80 leading-relaxed mb-6">Help us make a tangible difference in our ecosystem. Every hand counts!</p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-emerald-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/40"
                                    >
                                        Enlist for Mission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
