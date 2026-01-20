import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { SKILLS_LIST } from '../data/skills';

const OnboardingModal = ({ userProfile, onUpdate }) => {
    // Determine if onboarding is needed
    // Conditions:
    // 1. Username is missing or default (user might have "User" as name if just signed up via some methods, but mainly we want to check if they have a real username if that's the requirement. 
    //    Actually, requirement says: "if not given user name use the email to retruive his username". 
    //    Let's check if 'username' field is empty or generic, OR if skills are insufficient.
    //    Note: Backend User model has `username` required. If it's effectively "User" (from some default) or user wants to change it.
    //    Let's strictly follow: "when a new user logins in he must first be asked to give an username". 
    //    We can check if user has ever completed onboarding. For now, let's use the skills length as a proxy for "new/incomplete profile" 
    //    AND check if username is effectively a placeholder or if they want to set it.

    // Actually, let's just show this if skills < 5. That covers the "skills provided" part. 
    // For username, we'll show that step if they haven't set a custom one? 
    // Or better: Always show username step first if we are showing the modal at all, pre-filled with current username.

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Username, 2: Skills
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        skills: []
    });

    useEffect(() => {
        if (userProfile) {
            const isNgo = userProfile.role === 'ngo';
            const isVol = userProfile.role === 'volunteer';

            if (isNgo) {
                const details = userProfile.ngoDetails || {};
                // Logo is optional - only require organizationName, city, and missionStatement
                const hasDetails = details.organizationName && details.city && details.missionStatement;
                if (!hasDetails) {
                    setIsOpen(true);
                    setStep(1); // NGO: 1: Org Info, 2: Mission/Logo
                    setFormData({
                        orgName: details.organizationName || "",
                        city: details.city || "",
                        mission: details.missionStatement || "",
                        logo: null,
                        logoPreview: (details.logo && details.logo !== 'no-photo.jpg') ? `http://localhost:5000${details.logo}` : null
                    });
                }
            } else if (isVol) {
                // Relaxed condition: Only show if skills are completely empty OR username is generic "User"
                const hasSkills = userProfile.skills && userProfile.skills.length > 0;
                const hasUsername = userProfile.username && userProfile.username.toLowerCase() !== 'user' && !userProfile.username.includes('@');

                if (!hasSkills || !hasUsername) {
                    setIsOpen(true);
                    setStep(1); // Vol: 1: Username, 2: Skills
                    setFormData({
                        username: userProfile.username || userProfile.email?.split('@')[0] || "",
                        skills: userProfile.skills || []
                    });
                }
            }
        }
    }, [userProfile]);

    const handleSkillToggle = (skill) => {
        setFormData(prev => {
            const exists = prev.skills.includes(skill);
            if (exists) {
                return { ...prev, skills: prev.skills.filter(s => s !== skill) };
            } else {
                return { ...prev, skills: [...prev.skills, skill] };
            }
        });
    };

    const handleNext = () => {
        if (userProfile.role === 'ngo') {
            if (step === 1) {
                if (!formData.orgName.trim() || !formData.city.trim()) {
                    setError("All fields are required");
                    return;
                }
                setError("");
                setStep(2);
            } else {
                handleSubmit();
            }
        } else {
            if (step === 1) {
                if (!formData.username.trim()) {
                    setError("Username is required");
                    return;
                }
                setError("");
                setStep(2);
            } else {
                handleSubmit();
            }
        }
    };

    const handleSubmit = async () => {
        if (userProfile.role === 'volunteer' && formData.skills.length < 5) {
            setError(`Please select at least ${5 - formData.skills.length} more skills`);
            return;
        }

        if (userProfile.role === 'ngo' && !formData.mission.trim()) {
            setError("Mission statement is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            if (userProfile.role === 'ngo') {
                data.append('organizationName', formData.orgName);
                data.append('city', formData.city);
                data.append('missionStatement', formData.mission);
                if (formData.logo) data.append('logo', formData.logo);
            } else {
                data.append('username', formData.username);
                data.append('fullName', formData.username);
                data.append('skills', formData.skills.join(','));
            }

            await api.put("/profile", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (userProfile.role === 'volunteer') {
                localStorage.setItem("name", formData.username);
            } else {
                localStorage.setItem("orgName", formData.orgName);
            }

            if (onUpdate) onUpdate();
            setIsOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="bg-[#123524] p-8 text-white text-center">
                    <h2 className="text-3xl font-normal mb-2">Welcome to WasteZero!</h2>
                    <p className="text-emerald-100/80">Let's set up your profile to get started.</p>
                </div>

                <div className="p-8">
                    <AnimatePresence mode='wait'>
                        {/* VOLUNTEER STEPS */}
                        {userProfile.role === 'volunteer' && step === 1 && (
                            <motion.div
                                key="vol-step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose your Username</h3>
                                    <p className="text-gray-500 text-sm">This is how you'll be known in the community.</p>
                                </div>

                                <div className="max-w-xs mx-auto">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123524] focus:border-transparent outline-none transition-all font-medium text-gray-900"
                                            placeholder="Username"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1"><AlertCircle size={14} /> {error}</p>}
                                </div>
                            </motion.div>
                        )}

                        {userProfile.role === 'volunteer' && step === 2 && (
                            <motion.div
                                key="vol-step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Select your Skills</h3>
                                    <p className="text-gray-500 text-sm">
                                        Select at least <strong className="text-[#123524]">5 skills</strong> to help us match you with opportunities.
                                    </p>
                                </div>

                                <div className="max-h-60 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {SKILLS_LIST.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => handleSkillToggle(skill)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${formData.skills.includes(skill)
                                                ? 'bg-[#123524] text-white border-[#123524] shadow-md transform scale-[1.02]'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#123524] hover:text-[#123524]'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm font-medium border-t border-gray-100 pt-4">
                                    <span className={`${formData.skills.length >= 5 ? 'text-[#123524]' : 'text-orange-500'}`}>
                                        {formData.skills.length} / 5 selected
                                    </span>
                                    {error && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {error}</span>}
                                </div>
                            </motion.div>
                        )}

                        {/* NGO STEPS */}
                        {userProfile.role === 'ngo' && step === 1 && (
                            <motion.div
                                key="ngo-step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Organization Identity</h3>
                                    <p className="text-gray-500 text-sm">Fill in your NGO's basic information.</p>
                                </div>

                                <div className="space-y-4 max-w-sm mx-auto">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Organization Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123524] outline-none transition-all font-medium text-gray-900"
                                            placeholder="e.g. Green Earth Foundation"
                                            value={formData.orgName}
                                            onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">City</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123524] outline-none transition-all font-medium text-gray-900"
                                            placeholder="e.g. Mumbai"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1"><AlertCircle size={14} /> {error}</p>}
                                </div>
                            </motion.div>
                        )}

                        {userProfile.role === 'ngo' && step === 2 && (
                            <motion.div
                                key="ngo-step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mission & Logo</h3>
                                    <p className="text-gray-500 text-sm">Tell us about your cause and upload a logo.</p>
                                </div>

                                <div className="space-y-4 max-w-sm mx-auto">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Mission Statement</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#123524] outline-none transition-all font-medium text-gray-900 min-h-[100px]"
                                            placeholder="What is your organization's primary goal?"
                                            value={formData.mission}
                                            onChange={e => setFormData({ ...formData, mission: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 border border-dashed border-gray-200 p-4 rounded-xl">
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {formData.logoPreview ? (
                                                <img src={formData.logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-gray-300" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="logo-upload"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({
                                                            ...formData,
                                                            logo: file,
                                                            logoPreview: URL.createObjectURL(file)
                                                        });
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="block text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-all"
                                            >
                                                Upload Logo
                                            </label>
                                        </div>
                                    </div>
                                    {error && <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1"><AlertCircle size={14} /> {error}</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="bg-[#123524] text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:scale-105 transition-all flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : step === 1 ? <>Next <ArrowRight size={18} /></> : <>Complete Setup <Check size={18} /></>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;
