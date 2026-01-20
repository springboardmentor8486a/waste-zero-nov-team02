import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, User, Award, Shield, Check, Lock, ChevronDown, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { SKILLS_LIST } from '../data/skills';

// Predefined set of avatars (Dicebear styles)
const AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Trouble',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight'
];

export default function ProfileEditModal({ isOpen, onClose, userProfile, onUpdate }) {
    const [formData, setFormData] = useState({
        fullName: userProfile?.fullName || userProfile?.username || localStorage.getItem('fullName') || '',
        email: userProfile?.email || localStorage.getItem('userEmail') || '',
        skills: userProfile?.skills || userProfile?.volunteerDetails?.skills || [], // Ensure array
        organizationName: userProfile?.ngoDetails?.organizationName || userProfile?.fullName || '', // For NGOs
        contactNumber: userProfile?.ngoDetails?.phoneNumber || '',
        address: userProfile?.ngoDetails?.address || userProfile?.location || '',
        city: userProfile?.ngoDetails?.city || '',
        avatar: '', // URL string for selected avatar
        avatarFile: null, // File object for uploaded image
        otpStep: 'request', // request | verify | reset
        otp: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('details'); // details, password, organization, skills
    const fileInputRef = useRef(null);

    // Sync formData with userProfile when it changes or modal opens
    useEffect(() => {
        if (isOpen && userProfile) {
            setFormData(prev => ({
                ...prev,
                fullName: userProfile.fullName || userProfile.username || localStorage.getItem('fullName') || '',
                email: userProfile.email || localStorage.getItem('userEmail') || '',
                skills: userProfile.skills || userProfile.volunteerDetails?.skills || [],
                organizationName: userProfile.ngoDetails?.organizationName || userProfile.fullName || '',
                contactNumber: userProfile.ngoDetails?.phoneNumber || '',
                address: userProfile.ngoDetails?.address || userProfile.location || '',
                city: userProfile.ngoDetails?.city || '',
                // Keep password fields and avatar file as is unless we want to reset them
            }));
        }
    }, [isOpen, userProfile]);

    const role = localStorage.getItem('role') || 'volunteer';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarSelect = (url) => {
        setFormData(prev => ({
            ...prev,
            avatar: url,
            avatarFile: null // Reset file if URL selected
        }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            avatar: previewUrl,
            avatarFile: file
        }));
    };

    const toggleSkill = (skill) => {
        const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
        if (currentSkills.includes(skill)) {
            setFormData({ ...formData, skills: currentSkills.filter(s => s !== skill) });
        } else {
            setFormData({ ...formData, skills: [...currentSkills, skill] });
        }
    };

    const handlePasswordResetRequest = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await api.post('/auth/forgot-password', { email: formData.email });
            setSuccessMsg('OTP sent to your email.');
            setFormData(prev => ({ ...prev, otpStep: 'verify' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { email: formData.email, otp: formData.otp });
            setSuccessMsg('OTP Verified! Set your new password.');
            setFormData(prev => ({ ...prev, otpStep: 'reset' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError('');
        try {
            if (formData.newPassword !== formData.confirmNewPassword) {
                throw new Error("Passwords do not match");
            }
            await api.post('/auth/reset-password', {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmNewPassword
            });
            setSuccessMsg('Password updated successfully! Please re-login.');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const form = new FormData();

            if (activeTab === 'details') {
                form.append('fullName', formData.fullName);

                // NGO Specifics
                if (role === 'ngo') {
                    if (formData.organizationName) form.append('organizationName', formData.organizationName);
                    if (formData.contactNumber) form.append('phoneNumber', formData.contactNumber);
                    if (formData.address) form.append('address', formData.address);
                    if (formData.city) form.append('city', formData.city);
                }

                if (formData.avatarFile) {
                    form.append('avatar', formData.avatarFile);
                } else if (formData.avatar && formData.avatar.startsWith('http')) {
                    form.append('avatarUrl', formData.avatar);
                }
            }

            if (activeTab === 'skills' || role === 'volunteer') {
                form.append('skills', Array.isArray(formData.skills) ? formData.skills.join(',') : formData.skills);
            }

            if (activeTab === 'password') {
                setLoading(false);
                return;
            }

            await api.put('/profile', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local storage if name changed
            if (formData.fullName) {
                localStorage.setItem('fullName', formData.fullName);
                localStorage.setItem('name', formData.fullName);
            }

            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render current avatar preview
    const getAvatarPreview = () => {
        if (formData.avatarFile) return URL.createObjectURL(formData.avatarFile);
        if (formData.avatar) return formData.avatar;
        // Fallback to existing profile
        if (role === 'ngo' && userProfile?.ngoDetails?.logo && userProfile.ngoDetails.logo !== 'no-photo.jpg') {
            return `http://localhost:5000${userProfile.ngoDetails.logo}`;
        }
        if (role === 'volunteer' && userProfile?.volunteerDetails?.avatar && userProfile.volunteerDetails.avatar !== 'no-photo.jpg') {
            const av = userProfile.volunteerDetails.avatar;
            return av.startsWith('http') ? av : `http://localhost:5000${av}`;
        }
        return `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-white/30 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 space-y-2 hidden md:block">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white text-[#123524] shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                            >
                                <User size={18} />
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'password' ? 'bg-white text-[#123524] shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                            >
                                <Shield size={18} />
                                Security
                            </button>
                            {role === 'volunteer' && (
                                <button
                                    onClick={() => setActiveTab('skills')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'skills' ? 'bg-white text-[#123524] shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                                >
                                    <Award size={18} />
                                    Skills
                                </button>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-8">

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {activeTab === 'details' && (
                                    <>
                                        <div className="flex flex-col items-center gap-6 mb-8">
                                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                                <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-300">
                                                    <img src={getAvatarPreview()} alt="Profile" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="text-white" size={24} />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                            </div>

                                            {/* Avatar Selection List */}
                                            <div className="flex flex-col items-center gap-2 w-full">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or choose an avatar</span>
                                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                                    {AVATARS.map((url, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => handleAvatarSelect(url)}
                                                            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${formData.avatar === url ? 'border-[#123524] ring-2 ring-[#123524]/20' : 'border-gray-200 hover:border-emerald-100'}`}
                                                        >
                                                            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/20 focus:border-[#123524] transition-all outline-none"
                                                />
                                            </div>
                                            {role === 'ngo' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                                        <input
                                                            type="text"
                                                            name="organizationName"
                                                            value={formData.organizationName}
                                                            onChange={handleChange}
                                                            placeholder="Official Organization Name"
                                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/20 focus:border-[#123524] transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                                        <input
                                                            type="tel"
                                                            name="contactNumber"
                                                            value={formData.contactNumber || ''}
                                                            onChange={handleChange}
                                                            placeholder="+91 98765 43210"
                                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/20 focus:border-[#123524] transition-all outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                            <input
                                                                type="text"
                                                                name="city"
                                                                value={formData.city || ''}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/20 focus:border-[#123524] transition-all outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                            <input
                                                                type="text"
                                                                name="address"
                                                                value={formData.address || ''}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#123524]/20 focus:border-[#123524] transition-all outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500 border-transparent cursor-not-allowed outline-none"
                                                    disabled
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'password' && (
                                    <div className="space-y-6 text-center py-8">
                                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 max-w-sm mx-auto">
                                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Lock size={24} />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Password Change</h3>

                                            {/* STEP 1: REQUEST OTP */}
                                            {formData.otpStep === 'request' && (
                                                <>
                                                    <p className="text-sm text-gray-500 mb-6">
                                                        To protect your account, we will send an OTP to your email.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handlePasswordResetRequest}
                                                        disabled={loading}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        {loading ? 'Sending...' : (
                                                            <>
                                                                <RefreshCw size={18} /> Request OTP
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}

                                            {/* STEP 2: ENTER OTP */}
                                            {formData.otpStep === 'verify' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                    <p className="text-sm text-gray-500 mb-2">Enter the OTP sent to {formData.email}</p>
                                                    <input
                                                        type="text"
                                                        value={formData.otp || ''}
                                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                                        placeholder="Enter 6-digit OTP"
                                                        maxLength={6}
                                                        className="w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyOTP}
                                                        disabled={loading}
                                                        className="w-full px-4 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
                                                    >
                                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                                    </button>
                                                    <button
                                                        onClick={() => setFormData({ ...formData, otpStep: 'request' })}
                                                        className="text-xs text-gray-400 underline hover:text-gray-600"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                </div>
                                            )}

                                            {/* STEP 3: NEW PASSWORD */}
                                            {formData.otpStep === 'reset' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                    <p className="text-sm text-gray-500 mb-2">Set your new password</p>
                                                    <input
                                                        type="password"
                                                        value={formData.newPassword || ''}
                                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                        placeholder="New Password"
                                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 outline-none"
                                                    />
                                                    <input
                                                        type="password"
                                                        value={formData.confirmNewPassword || ''}
                                                        onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                                                        placeholder="Confirm Password"
                                                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleResetPassword}
                                                        disabled={loading}
                                                        className="w-full px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                                    >
                                                        {loading ? 'Updating...' : 'Update Password'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {successMsg && (
                                            <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 animate-in fade-in zoom-in">
                                                <Check size={18} />
                                                <span className="text-sm font-medium">{successMsg}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'skills' && (
                                    <div className="space-y-6">
                                        <div className="bg-[#123524]/5 p-4 rounded-2xl border border-[#123524]/10">
                                            <h3 className="text-sm font-semibold text-[#123524] mb-3 flex items-center justify-between">
                                                <span>Your Skills</span>
                                                <span className="text-xs bg-[#123524] text-white px-2 py-0.5 rounded-full">
                                                    {Array.isArray(formData.skills) ? formData.skills.length : 0}
                                                </span>
                                            </h3>

                                            {(!formData.skills || formData.skills.length === 0) ? (
                                                <p className="text-sm text-gray-500 italic text-center py-2 opacity-70">No skills selected yet.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.skills.map((skill, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#123524]/20 text-[#123524] text-sm font-medium shadow-sm animate-in fade-in zoom-in duration-200">
                                                            {skill}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSkill(skill)}
                                                                className="hover:bg-[#123524]/10 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <label className="block text-sm font-medium text-gray-700">Add Skills</label>
                                            </div>

                                            {/* Custom Skill Input */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type a custom skill..."
                                                    id="customSkillInput"
                                                    className="flex-1 px-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-[#123524] rounded-xl text-sm outline-none transition-all"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim();
                                                            if (val && !formData.skills.includes(val)) {
                                                                setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById('customSkillInput');
                                                        const val = input.value.trim();
                                                        if (val && !formData.skills.includes(val)) {
                                                            setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-[#123524] text-white rounded-xl text-sm font-medium hover:bg-[#0d281a] transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-4 mb-2">Suggested Skills</div>

                                            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {SKILLS_LIST.filter(s => !formData.skills.includes(s)).map((skill) => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => toggleSkill(skill)}
                                                        className="px-3 py-2 rounded-xl text-sm font-medium transition-all border border-gray-100 bg-white text-gray-600 hover:border-[#123524]/40 hover:bg-[#123524]/5 hover:text-[#123524] text-left"
                                                    >
                                                        + {skill}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                        <Shield size={16} /> {error}
                                    </div>
                                )}

                                {activeTab !== 'password' && (
                                    <div className="pt-4 flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-[#123524] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0d281a] transition-all shadow-lg shadow-[#123524]/20 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
                                            Save
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
