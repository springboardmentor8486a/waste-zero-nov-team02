import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, ShieldCheck, Heart, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

export default function PlatformImpactModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('missions');
    const [impactData, setImpactData] = useState({ feedbacks: [], ratings: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [feedRes, rateRes] = await Promise.all([
                        api.get('/feedback/opportunity-latest'),
                        api.get('/feedback/app-rating/all')
                    ]);
                    setImpactData({
                        feedbacks: feedRes.data.data || [],
                        ratings: rateRes.data.data || []
                    });
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-[#123524] px-8 py-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp size={120} />
                    </div>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Our Collective Impact</h2>
                        <p className="text-emerald-100/80 font-medium">Real stories from our dedicated community</p>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setActiveTab('missions')}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'missions' ? 'bg-white text-[#123524]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Past Missions
                        </button>
                        <button
                            onClick={() => setActiveTab('ratings')}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ratings' ? 'bg-white text-[#123524]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Platform Trust
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeTab === 'missions' ? (
                                impactData.feedbacks.length > 0 ? (
                                    impactData.feedbacks.map((fb, idx) => (
                                        <motion.div
                                            key={fb._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={fb.fromUser?.volunteerDetails?.avatar || fb.fromUser?.ngoDetails?.logo || `https://ui-avatars.com/api/?name=${fb.fromUser?.fullName || 'User'}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{fb.fromUser?.fullName || fb.fromUser?.username}</h4>
                                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">on {fb.opportunityId?.title || 'Mission'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < fb.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 italic flex-1">"{fb.content}"</p>
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
                                                {new Date(fb.createdAt).toLocaleDateString()}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : <div className="col-span-2 text-center py-12 text-gray-400">No mission feedback yet. Be the first!</div>
                            ) : (
                                impactData.ratings.length > 0 ? (
                                    impactData.ratings.map((rate, idx) => (
                                        <motion.div
                                            key={rate._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={rate.user?.volunteerDetails?.avatar || rate.user?.ngoDetails?.logo || `https://ui-avatars.com/api/?name=${rate.user?.fullName || 'User'}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{rate.user?.fullName || rate.user?.username}</h4>
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Verified User</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < rate.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 italic flex-1">"{rate.comment}"</p>
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-medium">
                                                {new Date(rate.createdAt).toLocaleDateString()}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : <div className="col-span-2 text-center py-12 text-gray-400">No platform ratings yet.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="bg-gray-50 p-6 flex justify-around border-t border-gray-100">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#123524]">500+</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickups</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#123524]">1.2k</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#123524]">4.9/5</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Rating</div>
                    </div>
                </div>
            </motion.div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(18, 53, 36, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
