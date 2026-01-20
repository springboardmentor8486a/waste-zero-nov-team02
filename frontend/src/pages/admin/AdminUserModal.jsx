import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Save, Key, UserCheck, ShieldAlert } from 'lucide-react';

const AdminUserModal = ({ isOpen, onClose, onSave, user = null }) => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'volunteer',
        orgName: '',
        website: '',
        phoneNumber: '',
        address: '',
        sendEmail: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                email: user.email || '',
                password: '', // Don't show password for editing
                role: user.role || 'volunteer',
                orgName: user.ngoDetails?.organizationName || '',
                website: user.ngoDetails?.website || '',
                phoneNumber: user.ngoDetails?.phoneNumber || '',
                address: user.ngoDetails?.address || '',
                sendEmail: false
            });
        } else {
            setFormData({
                username: '',
                fullName: '',
                email: '',
                password: '',
                role: 'volunteer',
                orgName: '',
                website: '',
                phoneNumber: '',
                address: '',
                sendEmail: false
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData, user?._id);
        setLoading(false);
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
                    className="absolute inset-0 bg-white/20 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="relative bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-white px-10 py-8 text-gray-900 flex justify-between items-center border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{user ? 'Modify Agent' : 'Create New Agent'}</h2>
                            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Platform Governance Protocol</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Alias / Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="nexus_agent_01"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Full Identity</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Secure Email Liaison</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="agent@wastezero.org"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        {!user && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Access Cipher (Password)</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="********"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Jurisdiction (Role)</label>
                            <div className="flex gap-4">
                                {['volunteer', 'ngo', 'admin'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r })}
                                        className={`flex-1 py-3 rounded-xl border-2 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${formData.role === r ? 'bg-[#123524] border-[#123524] text-white' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        {r === 'volunteer' && <UserCheck size={14} />}
                                        {r === 'ngo' && <Shield size={14} />}
                                        {r === 'admin' && <ShieldAlert size={14} />}
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.role === 'ngo' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 pt-4 border-t border-gray-100"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Organization Name</label>
                                        <input
                                            type="text"
                                            placeholder="Waste Collectors Intl"
                                            value={formData.orgName}
                                            onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Website</label>
                                        <input
                                            type="text"
                                            placeholder="https://ngo.org"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Phone Personnel</label>
                                        <input
                                            type="text"
                                            placeholder="+1 234 567 890"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Global Location (Address)</label>
                                        <input
                                            type="text"
                                            placeholder="123 Eco St, Green City"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}



                        {!user && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={formData.sendEmail}
                                    onChange={e => setFormData({ ...formData, sendEmail: e.target.checked })}
                                    className="w-5 h-5 text-[#123524] rounded border-gray-300 focus:ring-[#123524]"
                                />
                                <label htmlFor="sendEmail" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                                    Send login credentials to execution identity (user email)
                                </label>
                            </div>
                        )}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#123524] text-white rounded-[28px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/40 hover:bg-[#0d281a] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Save size={20} />
                                {loading ? 'EXECUTING...' : 'Authorize Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div >
            </div >
        </AnimatePresence >
    );
};

export default AdminUserModal;
