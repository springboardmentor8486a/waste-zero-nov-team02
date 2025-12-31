import React, { useState, useRef, useEffect } from "react";
import { Edit2, Camera, X, Check, Plus, Trash2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Reusable Profile Section Component
 * Handles display and inline editing of user profile details.
 * 
 * @param {Object} userData - The user object (name, email, avatar, etc.)
 * @param {String} role - 'volunteer' or 'ngo'
 * @param {Function} onUpdate - Callback function (updatedData) => Promise<void>
 * @param {Boolean} loading - Loading state for save operations
 */
const ProfileSection = ({ userData, role, onUpdate, loading = false }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    // Local state for form fields
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        location: "",
        skills: [], // For volunteers: skills/interests. For NGO: maybe tags/causes
        avatar: null, // Preview URL
        avatarFile: null // Actual file object
    });

    const fileInputRef = useRef(null);

    // Initialize form data from props
    useEffect(() => {
        if (userData) {
            const name = role === 'ngo' ? (userData.ngoDetails?.organizationName || userData.fullName) : (userData.volunteerDetails?.displayName || userData.fullName);
            const location = userData.location || userData.ngoDetails?.address || userData.volunteerDetails?.address || "";
            const website = role === 'ngo' ? userData.ngoDetails?.website : "";
            const about = role === 'ngo' ? userData.ngoDetails?.missionStatement : userData.volunteerDetails?.bio;

            // Skills logic: try to unify 'skills' vs 'interests' vs 'wasteTypes' if needed. 
            // For now, assume 'skills' on User model or 'interests' on VolunteerProfile.
            // Merging for display:
            let initialSkills = [];
            if (userData.skills && userData.skills.length > 0) initialSkills = userData.skills;
            if (role === 'volunteer' && userData.volunteerDetails?.interests) {
                // Merge unique if desired, or prioritize one. Let's use User.skills as primary or Vol Interests.
                // Based on existing Profile.jsx, it uses userData.skills.
                if (initialSkills.length === 0) initialSkills = userData.volunteerDetails.interests || [];
            }

            setFormData({
                name: name || "",
                email: userData.email || "",
                location: location,
                website: website || "",
                about: about || "",
                skills: initialSkills || [],
                avatar: getProfileImage(userData, role),
                avatarFile: null
            });
        }
    }, [userData, role]);

    const getProfileImage = (user, role) => {
        if (!user) return null;
        if (role === 'ngo' && user.ngoDetails?.logo && user.ngoDetails.logo !== 'no-photo.jpg') {
            return `http://localhost:5000${user.ngoDetails.logo}`;
        }
        if (role === 'volunteer' && user.volunteerDetails?.avatar && user.volunteerDetails.avatar !== 'no-photo.jpg') {
            const avatarPath = user.volunteerDetails.avatar;
            return avatarPath.startsWith('http') ? avatarPath : `http://localhost:5000${avatarPath}`;
        }
        if (user.googleProfilePic) return user.googleProfilePic;
        return null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                avatar: previewUrl,
                avatarFile: file
            }));
            // Auto-enable edit mode if image is changed, or just save immediately?
            // Requirement: "Place a small edit/upload button... directly"
            // We can let the user click "Save" to persist the image change along with text.
            setIsEditing(true);
        }
    };

    const handleSkillAdd = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val && !formData.skills.includes(val)) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                e.target.value = "";
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const handleSave = async () => {
        // Prepare payload
        // onUpdate expect FormData or JSON? 
        // Since we handle file upload, we might need to let the parent handle FormData construction or do it here.
        // Let's pass the raw data and let parent handle API specifics or pass FormData object.
        // Given Profile.jsx uses JSON usually, but new requirement involves Image.
        // It's cleaner to pass the collected modifications.

        await onUpdate({
            ...formData,
            // differentiate fields if needed by backend
            fullName: formData.name,
            logo: formData.avatarFile, // for NGO
            avatar: formData.avatarFile // for Volunteer
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Revert to original
        // (useEffect will trigger again if userData didn't change? No, we need to reset manually or depend on parent to not update props yet)
        // Simpler: just re-run the init logic or refresh from props.
        if (userData) {
            const name = role === 'ngo' ? (userData.ngoDetails?.organizationName || userData.fullName) : (userData.volunteerDetails?.displayName || userData.fullName);
            const location = userData.location || userData.ngoDetails?.address || userData.volunteerDetails?.address || "";
            const initialSkills = userData.skills || (role === 'volunteer' ? userData.volunteerDetails?.interests : []) || [];

            setFormData({
                name: name || "",
                email: userData.email || "",
                location: location,
                skills: initialSkills,
                avatar: getProfileImage(userData, role),
                avatarFile: null
            });
        }
    };

    const initials = formData.name ? formData.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="bg-white/95 rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto backdrop-blur-md">

            {/* Header Section: Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:items-start">

                {/* Avatar Circle */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>

                    {/* Edit/Upload Button */}
                    <button
                        className="absolute bottom-1 right-1 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change Profile Picture"
                    >
                        <Camera size={18} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Info & Inputs */}
                <div className="flex-1 w-full text-center md:text-left space-y-4">

                    {/* Name Field */}
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-3">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="text-3xl font-black text-gray-900 !text-gray-900 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-lg px-3 py-1 w-full md:w-auto transition-all outline-none"
                                placeholder="Your Name"
                            />
                        ) : (
                            <h1 className="text-3xl font-black text-gray-900 !text-gray-900">{formData.name}</h1>
                        )}

                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                                <Edit2 size={18} />
                            </button>
                        )}
                    </div>

                    {/* Email Field - Read Only */}
                    <div className="flex items-center gap-3 text-gray-500 !text-gray-500 font-medium">
                        <span>{formData.email}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 !text-gray-400 font-bold uppercase tracking-widest">
                        {isEditing ? (
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 text-gray-900 !text-gray-900 border border-transparent focus:border-indigo-500 rounded-lg px-2 py-0.5 transition-all outline-none w-48"
                                    placeholder="Location"
                                />
                                {role === 'ngo' && (
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 text-gray-900 !text-gray-900 border border-transparent focus:border-indigo-500 rounded-lg px-2 py-0.5 transition-all outline-none w-48"
                                        placeholder="Website URL"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center md:items-start">
                                <span>{formData.location || "Location not set"}</span>
                                {role === 'ngo' && formData.website && (
                                    <a href={formData.website} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline lowercase normal-case tracking-normal">
                                        {formData.website}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <hr className="my-8 border-gray-100" />

            {/* About Section (Bio or Mission) */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 !text-gray-900">
                        {role === 'ngo' ? 'Mission Statement' : 'About Me'}
                    </h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 size={12} /> Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full bg-gray-50 text-gray-900 !text-gray-900 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder={role === 'ngo' ? "Describe your organization's mission..." : "Tell us a bit about yourself..."}
                    />
                ) : (
                    <p className="text-gray-600 !text-gray-600 leading-relaxed whitespace-pre-line">
                        {formData.about || (role === 'ngo' ? "No mission statement added." : "No bio added.")}
                    </p>
                )}
            </div>

            {/* Skills / Interests Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 !text-gray-900">
                        {role === 'ngo' ? 'Focus Areas & Tags' : 'Skills & Interests'}
                    </h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                            <Edit2 size={12} /> Edit Skills
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {skill}
                            {isEditing && (
                                <button onClick={() => removeSkill(skill)} className="ml-2 text-indigo-400 hover:text-red-500 transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </span>
                    ))}

                    {/* Add New Skill Input */}
                    {isEditing && (
                        <div className="inline-flex items-center">
                            <input
                                type="text"
                                placeholder="Type & Enter..."
                                className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-transparent text-gray-900 !text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-32"
                                onKeyDown={handleSkillAdd}
                            />
                        </div>
                    )}

                    {!isEditing && formData.skills.length === 0 && (
                        <span className="text-gray-400 italic text-sm">No skills added yet.</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
                <div className="mt-8 flex items-center justify-end gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            )}

            {!isEditing && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
                    >
                        <Lock size={16} /> Reset Password
                    </button>
                </div>
            )}

        </div>
    );
};

export default ProfileSection;
