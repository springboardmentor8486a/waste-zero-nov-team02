import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    ShoppingCart,
    ChevronDown,
    Truck,
    User,
    Settings,
    LogOut
} from "lucide-react";
import NotificationBell from "./notifications/NotificationBell";
import ProfileEditModal from "./ProfileEditModal";

export default function Header({ userProfile, onUpdate }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    const name = localStorage.getItem("name") || localStorage.getItem("fullName") || "User";
    const email = localStorage.getItem("userEmail") || "user@example.com";
    const role = localStorage.getItem("role") || "Member";
    const location = "Coimbatore 641041";

    const getProfileImage = () => {
        if (!userProfile) return null;

        const userRole = userProfile.role || role; // Use profile role if available

        // Prioritize unified avatar field for all roles (Admin, NGO, Volunteer)
        if (userProfile.avatar && userProfile.avatar !== 'no-photo.jpg') {
            const avatarPath = userProfile.avatar;
            return avatarPath.startsWith('http') ? avatarPath : `http://localhost:5000${avatarPath}`;
        }

        // Fallbacks for legacy profile fields or Google/Default
        if (userRole === 'ngo' && userProfile.ngoDetails?.logo && userProfile.ngoDetails.logo !== 'no-photo.jpg') {
            return `http://localhost:5000${userProfile.ngoDetails.logo}`;
        }
        if (userRole === 'volunteer' && userProfile.volunteerDetails?.avatar && userProfile.volunteerDetails.avatar !== 'no-photo.jpg') {
            const avatarPath = userProfile.volunteerDetails.avatar;
            return avatarPath.startsWith('http') ? avatarPath : `http://localhost:5000${avatarPath}`;
        }
        if (userProfile.googleProfilePic) return userProfile.googleProfilePic;
        return null;
    };

    const avatarUrl = getProfileImage();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setShowDropdown(false);
        window.location.href = '/login';
    };

    return (
        <>
            <header className="flex flex-col w-full z-50 shadow-sm border-b">
                {/* Top Bar */}
                <div className="bg-white h-16 flex items-center px-6 gap-6 text-gray-900">
                    {/* Logo */}
                    {role === 'admin' ? (
                        <div className="flex items-center gap-2 px-2 py-1 shrink-0">
                            <img src="/waste-truck.png" alt="WasteZero" className="w-9 h-9 object-contain rounded-full" />
                            <span className="text-xl font-normal tracking-tight text-[#123524]">WasteZero</span>
                        </div>
                    ) : (
                        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1 transition-all group shrink-0">
                            <img src="/waste-truck.png" alt="WasteZero" className="w-9 h-9 object-contain rounded-full group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-normal tracking-tight text-[#123524]">WasteZero</span>
                        </Link>
                    )}

                    {/* Account & Lists - MOVED TO RIGHT */}
                    <div className="flex items-center gap-4 ml-auto">
                        <NotificationBell />

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                            >
                                <div className="w-9 h-9 rounded-full bg-[#123524] text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-white overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col items-start mr-1">
                                    <span className="text-sm font-medium text-gray-900 leading-none">{name.split(' ')[0]}</span>
                                    <span className="text-[10px] text-gray-500 font-medium capitalize mt-0.5">{role}</span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 ring-1 ring-black/5"
                                    >
                                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                            <h4 className="font-semibold text-gray-900">{name}</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{email}</p>
                                        </div>

                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileModalOpen(true);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-[#123524] group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                    <User size={16} />
                                                </div>
                                                Edit Profile
                                            </button>

                                            <Link
                                                to="/settings"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-[#123524] group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                    <Settings size={16} />
                                                </div>
                                                Settings
                                            </Link>

                                            <div className="h-px bg-gray-50 my-1 mx-2" />

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-rose-100">
                                                    <LogOut size={16} />
                                                </div>
                                                Log out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userProfile={userProfile}
                onUpdate={onUpdate}
            />
        </>
    );
}
