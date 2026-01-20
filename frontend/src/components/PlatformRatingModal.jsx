import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Heart } from 'lucide-react';
import api from '../utils/api';

export default function PlatformRatingModal({ isOpen, onClose, onFinish }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            await api.post('/feedback/app-rating', { rating, comment });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                if (onFinish) onFinish();
            }, 2000);
        } catch (err) {
            console.error('Failed to submit rating:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden"
                >
                    {isSuccess ? (
                        <div className="p-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Heart className="text-emerald-600 fill-emerald-600" size={40} />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                            <p className="text-gray-500">Your feedback helps us build a cleaner future together.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-[#123524] p-8 text-white relative overflow-hidden">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold mb-2">Enjoying WasteZero?</h2>
                                    <p className="text-emerald-100/70 text-sm">We'd love to hear about your experience so far!</p>
                                </div>
                                <div className="absolute -bottom-6 -right-6 opacity-10">
                                    <Star size={120} />
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={40}
                                                className={`transition-colors ${(hover || rating) >= star
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-gray-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Tell us more (Optional)
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="What do you love? What could we improve?"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none h-32"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={rating === 0 || isSubmitting}
                                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${rating > 0
                                                ? 'bg-[#123524] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#0d281a]'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit Feedback
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
