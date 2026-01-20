import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Smile, Frown, Meh } from 'lucide-react';
import api from '../utils/api';

export default function FeedbackModal({ isOpen, onClose, opportunityId, type = 'opportunity', onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setLoading(true);
        try {
            const endpoint = type === 'opportunity' ? '/feedback/opportunity' : '/feedback/app-rating';
            const payload = type === 'opportunity'
                ? { opportunityId, content: comment, rating }
                : { rating, comment };

            await api.post(endpoint, payload);
            if (onSubmitted) onSubmitted();
            onClose();
        } catch (err) {
            console.error("Feedback submission error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getEmoji = (r) => {
        if (r >= 4) return <Smile className="text-emerald-500" size={32} />;
        if (r >= 3) return <Meh className="text-amber-500" size={32} />;
        if (r >= 1) return <Frown className="text-red-500" size={32} />;
        return <Star className="text-gray-300" size={32} />;
    };

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
                    className="relative bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden p-8"
                >
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {getEmoji(hoverRating || rating)}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {type === 'opportunity' ? 'How was the Mission?' : 'Love the App?'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            {type === 'opportunity'
                                ? 'Your feedback helps us build a better environment.'
                                : 'Rate your experience with WasteZero so far!'}
                        </p>
                    </div>

                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    size={36}
                                    fill={(hoverRating || rating) >= star ? '#10b981' : 'transparent'}
                                    className={(hoverRating || rating) >= star ? 'text-emerald-500' : 'text-gray-200'}
                                />
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Comments (Optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us more about your experience..."
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-sm transition-all outline-none resize-none h-32"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="w-full py-4 bg-[#123524] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 hover:bg-[#0d281a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <Send size={18} /> Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
