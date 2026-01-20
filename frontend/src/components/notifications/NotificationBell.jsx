import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, X, User, AlertCircle } from 'lucide-react';
import socketService from '../../services/socket';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const socket = socketService.connect();

    useEffect(() => {
        fetchNotifications();

        // Join user's room for notifications
        const userId = getCurrentUserId();
        if (userId && socket) {
            socket.emit('join', userId);
            console.log('🔔 Joined notification room for user:', userId);
        }

        const handleNewNotification = (newNotif) => {
            console.log('🔔 New notification received:', newNotif);
            // Add new notification with animation trigger
            setNotifications(prev => {
                // Check if notification already exists to avoid duplicates
                const exists = prev.some(n => n._id === newNotif._id);
                if (exists) return prev;
                return [newNotif, ...prev];
            });
            // Auto-open dropdown when new notification arrives
            setIsOpen(prev => {
                if (!prev) {
                    return true; // Auto-open if closed
                }
                return prev;
            });
        };

        socket.on('notification', handleNewNotification);

        // Close on click outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Listen for manual refresh events
        const handleRefresh = () => {
            console.log('🔄 Manually refreshing notifications...');
            fetchNotifications();
        };
        window.addEventListener('refreshNotifications', handleRefresh);

        return () => {
            socket.off('notification', handleNewNotification);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('refreshNotifications', handleRefresh);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setNotifications([]);
        }
    };

    const markAsRead = async (id) => {
        try {
            if (id === 'all') {
                await api.put('/notifications/read-all');
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } else {
                await api.patch(`/notifications/${id}/read`);
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
            // Local update for responsiveness
            setNotifications(prev => prev.filter(n => n._id !== id));
        }
    };

    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all focus:outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-normal text-white border-2 border-white ring-2 ring-emerald-100"
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl z-50 ring-1 ring-slate-200"
                    >
                        <div className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-50">
                            <h3 className="text-lg font-normal text-slate-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead('all')}
                                    className="text-xs font-normal text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide py-2">
                            {Array.isArray(notifications) && notifications.length > 0 ? (
                                <AnimatePresence>
                                    {notifications.map((notif, index) => (
                                        <motion.div
                                            key={notif._id}
                                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{ 
                                                duration: 0.3,
                                                delay: index === 0 ? 0.1 : 0
                                            }}
                                            className={`relative flex items-start gap-4 px-5 py-4 transition-all hover:bg-slate-50 border-b border-slate-50/50 last:border-0 ${!notif.isRead ? 'bg-emerald-50/20' : ''}`}
                                        >
                                        <div className={`mt-1 flex-shrink-0 rounded-xl p-2 ${notif.type === 'new_registration' ? 'bg-blue-100 text-blue-600' :
                                            notif.type === 'admin_alert' ? 'bg-red-100 text-red-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            {notif.type === 'new_registration' ? <User size={18} /> :
                                                notif.type === 'admin_alert' ? <AlertCircle size={18} /> :
                                                    <CheckCircle size={18} />}
                                        </div>

                                        <div className="flex-1 pr-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                                                    {notif.type === 'new_registration' ? 'New Registration' :
                                                        notif.type === 'admin_alert' ? 'Admin Alert' : 'Notification'}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notif.message}</p>

                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="mt-2 text-[10px] font-normal text-emerald-600 hover:underline"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="text-slate-300 hover:text-red-400 p-1 rounded-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                        {!notif.isRead && (
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full"
                                            ></motion.div>
                                        )}
                                    </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <div className="mb-3 rounded-full bg-slate-50 p-4">
                                        <Bell size={32} opacity={0.3} />
                                    </div>
                                    <p className="text-sm font-medium">All caught up!</p>
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
