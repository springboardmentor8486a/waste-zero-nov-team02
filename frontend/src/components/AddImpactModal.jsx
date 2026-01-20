import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Scale, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function AddImpactModal({ isOpen, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'plastic',
        weight: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');

    const categories = [
        { id: 'plastic', label: 'Plastic', icon: '🥤' },
        { id: 'paper', label: 'Paper', icon: '📄' },
        { id: 'ewaste', label: 'E-Waste', icon: '💻' },
        { id: 'metal', label: 'Metal', icon: '🥫' },
        { id: 'glass', label: 'Glass', icon: '🧴' },
        { id: 'organic', label: 'Organic', icon: '🍎' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.weight || formData.weight <= 0) {
                throw new Error("Please enter a valid weight");
            }

            await api.post('/impact/stats', formData);
            if (onUpdate) onUpdate();
            onClose();
            // Reset form
            setFormData({
                category: 'plastic',
                weight: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to save impact");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/20 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#123524] p-8 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Scale size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Log New Impact</h2>
                                    <p className="text-xs text-white/60">Record your waste collection data</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Category Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    Waste Category
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.category === cat.id
                                                ? 'border-[#123524] bg-emerald-50 text-[#123524]'
                                                : 'border-gray-50 bg-gray-50 hover:border-emerald-100 hover:bg-white'
                                                }`}
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Weight Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    Weight (in Kilograms)
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#123524] transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full pl-14 pr-8 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl text-lg font-semibold text-gray-900 outline-none transition-all placeholder:font-normal"
                                        placeholder="0.0"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                                        KG
                                    </div>
                                </div>
                            </div>

                            {/* Date Input */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    Collection Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl font-semibold text-gray-900 outline-none transition-all"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-in fade-in zoom-in">
                                    <AlertCircle size={18} />
                                    <p className="text-xs font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#123524] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-[#0d281a] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Confirm Log Entry
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
