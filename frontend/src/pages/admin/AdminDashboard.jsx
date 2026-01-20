import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Briefcase, Shield, Search, Edit, Trash2, MapPin, Award, Globe, Activity, MoreHorizontal, ShieldBan, FileText, CheckCircle, Download, BarChart3, Eye, Home, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import { getCurrentUserId } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import AdminUserModal from './AdminUserModal';
import { useUI } from '../../context/UIContext';

const AdminDashboard = ({ initialTab }) => {
    const { showToast, confirm } = useUI();

    const [stats, setStats] = useState({
        totalUsers: 0,
        volunteers: 0,
        ngos: 0,
        opportunities: 0,
        activeChats: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'volunteer');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [expandedSkills, setExpandedSkills] = useState(null);

    // Blocking & Logging
    const [logs, setLogs] = useState([]);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockTargetId, setBlockTargetId] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

    // Overview & Opportunities
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [oppFilter, setOppFilter] = useState({ status: '', ngo: '', location: '', search: '' });
    const [expandedOpportunity, setExpandedOpportunity] = useState(null);
    const [editingOpportunity, setEditingOpportunity] = useState(null);
    const [showOppModal, setShowOppModal] = useState(false);
    const [ngoList, setNgoList] = useState([]);
    const [oppFormData, setOppFormData] = useState({
        title: '',
        short: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        category: '',
        required_skills: [],
        duration: '',
        capacity: '',
        ngo_id: '',
        status: 'open'
    });
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchNgos();
    }, []);

    const fetchNgos = async () => {
        try {
            const response = await api.get('/admin/users');
            if (response.data && response.data.success) {
                const ngoUsers = response.data.data.filter(u => u.role === 'ngo');
                setNgoList(ngoUsers);
            }
        } catch (err) {
            console.error("Fetch NGOs error:", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
            const interval = setInterval(fetchLogs, 30000);
            return () => clearInterval(interval);
        } else if (activeTab === 'opportunities') {
            fetchOpportunities();
        } else if (activeTab === 'overview') {
            fetchOverviewData();
            const interval = setInterval(fetchOverviewData, 30000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'opportunities') {
            fetchOpportunities();
        }
    }, [oppFilter, activeTab]);

    useEffect(() => {
        setActiveTab(initialTab || 'volunteer');
    }, [initialTab]);

    const fetchOverviewData = async () => {
        try {
            const res = await api.get('/admin/overview');
            if (res.data && res.data.success) {
                setRecentActivity(res.data.recentActivity || []);
                setRecentRegistrations(res.data.recentRegistrations || []);
            }
        } catch (err) {
            console.error("Fetch overview error", err);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/logs');
            setLogs(res.data.data || []);
        } catch (err) {
            console.error("Fetch logs error", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockClick = (e, id) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setModalPos({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX - 400 // Offset to left to fit
        });
        setBlockTargetId(id);
        setBlockReason('');
        setShowBlockModal(true);
    };

    const submitBlock = async () => {
        if (!blockReason.trim()) {
            showToast("Reason is required", "error");
            return;
        }
        try {
            await api.post(`/admin/users/${blockTargetId}/block`, { reason: blockReason });
            setShowBlockModal(false);
            setBlockTargetId(null);
            setBlockReason('');
            showToast("User blocked successfully", "success");
            fetchUsers(); // Refresh list to show blocked status
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to block user", "error");
        }
    };

    const handleUnblock = async (id) => {
        const confirmed = await confirm({
            title: "Unblock User",
            message: "Are you sure you want to unblock this user?",
            confirmText: "Unblock",
            cancelText: "Cancel",
            isDangerous: false
        });

        if (!confirmed) return;

        try {
            await api.post(`/admin/users/${id}/unblock`);
            showToast("User unblocked successfully", "success");
            fetchUsers();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to unblock", "error");
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            if (res.data && res.data.success) {
                setUsers(res.data.data || []);
            } else {
                console.error("[ADMIN] Unexpected response format:", res.data);
                setUsers([]);
            }
        } catch (err) {
            console.error("[ADMIN] Fetch failure:", err.response?.data || err.message);
            setUsers([]);
            showToast(err.response?.data?.message || "Failed to fetch users. Please check your connection and try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            if (response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error("Stats fetch error:", err.response?.data || err.message);
        }
    };



    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (oppFilter.status) params.append('status', oppFilter.status);
            if (oppFilter.ngo) params.append('ngo', oppFilter.ngo);
            if (oppFilter.location) params.append('location', oppFilter.location);
            if (oppFilter.search) params.append('search', oppFilter.search);

            const response = await api.get(`/admin/opportunities?${params.toString()}`);
            if (response.data && response.data.success) {
                setOpportunities(response.data.data || []);
            }
        } catch (err) {
            console.error("Opportunities fetch error:", err.response?.data || err.message);
            showToast("Failed to fetch opportunities", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOpportunity = async (id) => {
        const confirmed = await confirm({
            title: "Delete Opportunity",
            message: "Are you sure you want to delete this opportunity? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            isDangerous: true
        });

        if (!confirmed) return;

        try {
            await api.delete(`/admin/opportunities/${id}`);
            showToast("Opportunity deleted successfully", "success");
            fetchOpportunities();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete opportunity", "error");
        }
    };

    const handleEditOpportunity = (opp) => {
        setEditingOpportunity(opp);
        setOppFormData({
            title: opp.title || '',
            short: opp.short || '',
            description: opp.description || '',
            date: opp.date || '',
            time: opp.time || '',
            endTime: opp.endTime || '',
            location: opp.location || '',
            category: opp.category || '',
            required_skills: opp.required_skills || [],
            duration: opp.duration || '',
            capacity: opp.capacity || '',
            ngo_id: opp.ngo_id?._id || opp.ngo_id || '',
            status: opp.status || 'open'
        });
        setShowOppModal(true);
    };

    const handleSaveOpportunity = async () => {
        try {
            if (!oppFormData.title || !oppFormData.ngo_id) {
                showToast("Title and NGO are required", "error");
                return;
            }

            const data = {
                ...oppFormData,
                capacity: oppFormData.capacity ? parseInt(oppFormData.capacity) : null
            };

            if (editingOpportunity) {
                await api.put(`/admin/opportunities/${editingOpportunity._id}`, data);
                showToast("Opportunity updated successfully", "success");
            } else {
                await api.post('/admin/opportunities', data);
                showToast("Opportunity created successfully", "success");
            }

            setShowOppModal(false);
            setEditingOpportunity(null);
            setOppFormData({
                title: '', short: '', description: '', date: '', time: '', endTime: '',
                location: '', category: '', required_skills: [], duration: '', capacity: '', ngo_id: '', status: 'open'
            });
            fetchOpportunities();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to save opportunity", "error");
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !oppFormData.required_skills.includes(skillInput.trim())) {
            setOppFormData({
                ...oppFormData,
                required_skills: [...oppFormData.required_skills, skillInput.trim()]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => {
        setOppFormData({
            ...oppFormData,
            required_skills: oppFormData.required_skills.filter(s => s !== skill)
        });
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: "Delete User",
            message: "Are you sure you want to delete this user? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            isDangerous: true
        });

        if (!confirmed) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setSelectedUsers(prev => prev.filter(uid => uid !== id));
            showToast("User deleted successfully", "success");
            await fetchUsers();
            await fetchStats();
        } catch (err) {
            console.error("Delete user error:", err.response?.data || err.message);
            showToast(err.response?.data?.message || "Failed to delete user. Please try again.", "error");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;

        try {
            // Check today's deletion count
            const deletionCountRes = await api.get('/admin/deletion-count');
            const { count: todayDeletions, limit } = deletionCountRes.data;
            const remainingDeletions = limit - todayDeletions;

            // Check if trying to delete more than remaining limit
            if (selectedUsers.length > remainingDeletions) {
                const currentUserId = getCurrentUserId();

                if (currentUserId) {
                    try {
                        // Create notification
                        const notifResponse = await api.post('/notifications', {
                            recipient: currentUserId,
                            type: 'admin_alert',
                            message: `⚠️ Daily deletion limit exceeded! You attempted to delete ${selectedUsers.length} users, but you can only delete ${remainingDeletions} more user${remainingDeletions !== 1 ? 's' : ''} today (${todayDeletions}/${limit} already deleted). Please select ${remainingDeletions} or fewer users to delete.`
                        });
                        console.log('✅ Notification created:', notifResponse.data);

                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('refreshNotifications'));
                        }, 500);
                    } catch (notifErr) {
                        console.error("Error creating notification:", notifErr);
                    }
                }

                showToast(
                    `Daily deletion limit exceeded! You can only delete ${remainingDeletions} more user${remainingDeletions !== 1 ? 's' : ''} today (${todayDeletions}/${limit} already deleted).`,
                    "error"
                );
                return;
            }

            const confirmed = await confirm({
                title: "Delete Users",
                message: `Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}? This action cannot be undone.\n\nYou have ${remainingDeletions} deletion${remainingDeletions !== 1 ? 's' : ''} remaining today.`,
                confirmText: "Delete",
                cancelText: "Cancel",
                isDangerous: true
            });

            if (!confirmed) return;

            // Delete users one by one to handle daily limit properly
            const deleteResults = [];
            for (const id of selectedUsers) {
                try {
                    const result = await api.delete(`/admin/users/${id}`);
                    deleteResults.push({ id, success: true, data: result.data });
                } catch (err) {
                    deleteResults.push({ id, success: false, error: err.response?.data?.message || err.message });

                    // If daily limit reached, stop deleting
                    if (err.response?.status === 403) {
                        const currentUserId = getCurrentUserId();
                        if (currentUserId) {
                            try {
                                await api.post('/notifications', {
                                    recipient: currentUserId,
                                    type: 'admin_alert',
                                    message: `⚠️ Daily deletion limit reached! You have reached the maximum of ${limit} deletions per day. Please try again tomorrow.`
                                });
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('refreshNotifications'));
                                }, 500);
                            } catch (notifErr) {
                                console.error("Error creating notification:", notifErr);
                            }
                        }
                        showToast(`Daily deletion limit reached! You have deleted the maximum of ${limit} users today. Please try again tomorrow.`, "error");
                        break;
                    }
                }
            }

            const successCount = deleteResults.filter(r => r.success).length;
            const failCount = deleteResults.filter(r => !r.success).length;

            if (successCount > 0) {
                showToast(`${successCount} user${successCount !== 1 ? 's' : ''} deleted successfully${failCount > 0 ? `. ${failCount} user${failCount !== 1 ? 's' : ''} could not be deleted.` : ''}`, successCount === selectedUsers.length ? "success" : "error");
            } else if (failCount > 0) {
                showToast(`${failCount} user${failCount !== 1 ? 's' : ''} could not be deleted.`, "error");
            }

            setSelectedUsers([]);
            await fetchUsers();
            await fetchStats();
        } catch (err) {
            console.error("Bulk delete error", err);
            showToast("Error checking deletion limit. Please try again.", "error");
        }
    };

    const toggleSelectAll = (list) => {
        if (selectedUsers.length === list.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(list.map(u => u._id));
        }
    };

    const toggleSelectUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(prev => prev.filter(uid => uid !== id));
        } else {
            setSelectedUsers(prev => [...prev, id]);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleSaveUser = async (data, id) => {
        try {
            if (id) {
                await api.put(`/admin/users/${id}`, data);
            } else {
                await api.post('/admin/users', data);
            }
            setShowModal(false);
            setEditingUser(null);
            await fetchUsers();
            await fetchStats();
            showToast(editingUser ? "User updated successfully" : "User created successfully", "success");
        } catch (err) {
            console.error("Save user error:", err.response?.data || err.message);
            showToast(err.response?.data?.message || "Failed to save user. Please try again.", "error");
        }
    };

    const handleDownloadPDF = () => {
        try {
            if (!logs || logs.length === 0) {
                showToast('No audit logs available to download.', "error");
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text("WasteZero Platform Audit Logs", 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            const tableColumn = ["Action", "Performed By", "Target User", "Details", "Timestamp"];
            const tableRows = [];

            logs.forEach(log => {
                const logData = [
                    String(log.action || 'N/A'),
                    String(log.performedBy?.username || log.performedBy?.email || 'System'),
                    String(log.targetUser?.username || log.targetUser?.email || 'N/A'),
                    String((log.details || '') + (log.reason ? ` (Reason: ${log.reason})` : "")),
                    String(log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A')
                ];
                tableRows.push(logData);
            });

            // Use autoTable function with jsPDF v4
            if (typeof autoTable !== 'function') {
                throw new Error('autoTable is not available. Make sure jspdf-autotable is properly installed.');
            }

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [18, 53, 36] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 40 }
            });

            const fileName = `wastezero_audit_logs_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            showToast('PDF downloaded successfully', "success");
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            showToast(`Failed to generate PDF: ${error.message}`, "error");
        }
    };

    const handleDownloadDashboardPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("WasteZero Admin Dashboard Report", 14, 20);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

            const statsTable = [
                ['Total Users', stats.totalUsers || 0],
                ['Volunteers', stats.volunteers || 0],
                ['NGOs', stats.ngos || 0],
                ['Opportunities', stats.opportunities || 0],
                ['Active Chats', stats.activeChats || 0]
            ];

            autoTable(doc, {
                startY: 36,
                head: [['Metric', 'Value']],
                body: statsTable,
                styles: { fontSize: 10 }
            });

            // If recentActivity available, add a short table
            if (recentActivity && recentActivity.length > 0) {
                const rows = recentActivity.slice(0, 20).map(a => [
                    a.action || 'N/A',
                    a.actor?.username || a.actor?.email || 'System',
                    a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A'
                ]);

                autoTable(doc, {
                    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 80,
                    head: [['Action', 'Actor', 'When']],
                    body: rows,
                    styles: { fontSize: 8 }
                });
            }

            const fileName = `wastezero_admin_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            showToast('Dashboard PDF downloaded', 'success');
        } catch (err) {
            console.error('Dashboard PDF error', err);
            showToast('Failed to generate dashboard PDF', 'error');
        }
    };

    const handleExportUsersCSV = () => {
        try {
            const list = filteredUsers || users || [];
            if (!list || list.length === 0) {
                showToast('No users available to export', 'error');
                return;
            }

            const headers = ['username', 'fullName', 'email', 'role', 'status', 'city_or_org', 'createdAt'];
            const rows = list.map(u => {
                const city = u.ngoDetails?.city || '';
                const org = u.ngoDetails?.organizationName || '';
                return [
                    u.username || '',
                    u.fullName || '',
                    u.email || '',
                    u.role || '',
                    u.isBlocked ? 'blocked' : 'active',
                    org || city || '',
                    u.createdAt ? new Date(u.createdAt).toISOString() : ''
                ];
            });

            const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wastezero_users_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showToast('Users CSV downloaded', 'success');
        } catch (err) {
            console.error('CSV export error', err);
            showToast('Failed to export users CSV', 'error');
        }
    };

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const fullName = (u.fullName || '').toLowerCase();
        const orgName = (u.ngoDetails?.organizationName || '').toLowerCase();
        const dispName = (u.volunteerDetails?.displayName || '').toLowerCase();

        return username.includes(query) ||
            email.includes(query) ||
            fullName.includes(query) ||
            orgName.includes(query) ||
            dispName.includes(query);
    });

    // Filter users by role and ensure they have the correct profile type
    const volunteers = filteredUsers.filter(u => {
        if (u.role !== 'volunteer') return false;
        // Only show if they have volunteer profile (not NGO profile)
        return u.volunteerDetails && !u.ngoDetails;
    });

    // Reset selection when tab changes
    useEffect(() => {
        setSelectedUsers([]);
    }, [activeTab]);

    const ngos = filteredUsers.filter(u => u.role === 'ngo');

    const admins = filteredUsers.filter(u => u.role === 'admin');

    const renderTable = (list, tabRole) => {
        return (
            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50">
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    onChange={() => toggleSelectAll(list)}
                                    checked={list.length > 0 && selectedUsers.length === list.length}
                                    className="rounded border-gray-300 text-[#123524] focus:ring-[#123524]"
                                />
                            </th>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Full Identity</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">
                                {tabRole === 'volunteer' ? 'Skills & Points' :
                                    tabRole === 'ngo' ? 'Location & Web' : 'Status'}
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                    {loading ? 'Loading...' : 'No records found'}
                                </td>
                            </tr>
                        ) : list.map(u => {
                            // Helper to get diverse avatar
                            const getAvatar = () => {
                                // 1. Priority: Unified Avatar Field (new standard)
                                if (u.avatar && u.avatar.startsWith('http')) return u.avatar;
                                if (u.avatar && !u.avatar.startsWith('/') && !u.avatar.endsWith('no-photo.jpg')) return `http://localhost:5000${u.avatar}`;

                                // 2. Google Profile Pic
                                if (u.googleProfilePic) return u.googleProfilePic;

                                // 3. Role-specific fallback (Legacy)
                                let roleAvatar = u.role === 'ngo' ? u.ngoDetails?.logo : u.volunteerDetails?.avatar;
                                if (roleAvatar && !roleAvatar.endsWith('no-photo.jpg')) {
                                    // Check if it is a local upload path or full url
                                    if (roleAvatar.startsWith('http')) return roleAvatar;
                                    return `http://localhost:5000${roleAvatar}`;
                                }

                                // 4. Fallback to UI Avatars with Name
                                const name = u.fullName || u.username || 'User';
                                return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                            };

                            return (
                                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(u._id) ? 'bg-emerald-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(u._id)}
                                            onChange={() => toggleSelectUser(u._id)}
                                            className="rounded border-gray-300 text-[#123524] focus:ring-[#123524]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-emerald-700 font-medium">{u.username || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getAvatar()}
                                                alt=""
                                                className="w-8 h-8 rounded-full bg-white object-cover border border-gray-200"
                                            />
                                            <div className="font-bold text-gray-900">
                                                {u.role === 'ngo' ? (u.ngoDetails?.organizationName || u.fullName || u.username) :
                                                    u.role === 'volunteer' ? (u.volunteerDetails?.displayName || u.fullName || u.username) :
                                                        (u.fullName || u.username)}
                                            </div>
                                            {u.isBlocked && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] uppercase font-bold rounded">BLOCKED</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4">
                                        {u.role === 'volunteer' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(() => {
                                                        const skills = u.volunteerDetails?.skills || [];
                                                        const isExpanded = expandedSkills === u._id;
                                                        const displaySkills = isExpanded ? skills : skills.slice(0, 2);

                                                        return (
                                                            <>
                                                                {displaySkills.map((s, i) => (
                                                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                                {!isExpanded && skills.length > 2 && (
                                                                    <button
                                                                        onClick={() => setExpandedSkills(u._id)}
                                                                        className="p-0.5 hover:bg-gray-100 rounded text-gray-400"
                                                                        title="Show all skills"
                                                                    >
                                                                        <MoreHorizontal size={12} />
                                                                    </button>
                                                                )}
                                                                {isExpanded && skills.length > 2 && (
                                                                    <button
                                                                        onClick={() => setExpandedSkills(null)}
                                                                        className="text-[9px] text-gray-400 hover:text-gray-600 font-medium ml-1"
                                                                    >
                                                                        Close
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-bold">{u.volunteerDetails?.totalPoints || 0} Points</span>
                                            </div>
                                        )}
                                        {u.role === 'ngo' && (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-sky-700 line-clamp-2 italic opacity-80" title={u.ngoDetails?.missionStatement}>
                                                    {u.ngoDetails?.missionStatement || 'No mission statement'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-sky-600 mt-1">
                                                    <MapPin size={10} />
                                                    {u.ngoDetails?.city || 'Unset'}
                                                    {u.ngoDetails?.website && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <Globe size={10} />
                                                            <a href={u.ngoDetails.website.startsWith('http') ? u.ngoDetails.website : `https://${u.ngoDetails.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                {u.ngoDetails.website.replace(/^https?:\/\//, '')}
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {u.role === 'admin' && (
                                            <span className="text-[10px] px-2 py-1 bg-red-100 text-red-600 border border-red-200 rounded font-bold uppercase">Master</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* Activity Status Indicator - Radio Button */}
                                            {(() => {
                                                const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
                                                const now = new Date();
                                                const daysSinceLogin = lastLogin ? Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24)) : null;
                                                const isActive = lastLogin && daysSinceLogin !== null && daysSinceLogin <= 15;
                                                const statusColor = isActive ? '#10b981' : '#000000'; // Green for active, Black for inactive
                                                const statusText = isActive
                                                    ? `Active (Last login: ${daysSinceLogin} day${daysSinceLogin !== 1 ? 's' : ''} ago)`
                                                    : lastLogin
                                                        ? `Inactive (Last login: ${daysSinceLogin} days ago)`
                                                        : 'Never logged in';

                                                return (
                                                    <div
                                                        className="flex items-center"
                                                        title={statusText}
                                                    >
                                                        <input
                                                            type="radio"
                                                            checked={true}
                                                            readOnly
                                                            className="w-4 h-4 cursor-default"
                                                            style={{
                                                                accentColor: statusColor,
                                                                borderColor: statusColor,
                                                                backgroundColor: statusColor === '#10b981' ? `${statusColor}15` : 'transparent'
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })()}

                                            <button onClick={() => handleEdit(u)} className="p-2 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(u._id)} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                            {u.role !== 'admin' && (
                                                u.isBlocked ? (
                                                    <button onClick={() => handleUnblock(u._id)} className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors" title="Unblock">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={(e) => handleBlockClick(e, u._id)} className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors" title="Block">
                                                        <ShieldBan size={16} />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div >
        );
    };

    return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-8 min-h-screen">
            <header className="flex justify-between items-end">
                <PageHeader
                    title={
                        activeTab === 'logs' ? "Platform Audit Logs" :
                            activeTab === 'opportunities' ? "Opportunity Moderation" :
                                "Personnel Management"
                    }
                    subtitle={
                        activeTab === 'logs' ? "Track administrative actions and system security events." :
                            activeTab === 'opportunities' ? "Manage and moderate all platform opportunities." :
                                "Manage platform users, roles, and access restrictions."
                    }
                />

                <div className="flex gap-3 items-center">
                    {activeTab === 'opportunities' && (
                        <button
                            onClick={() => { setEditingOpportunity(null); setShowOppModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#123524] text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/20 hover:bg-[#0d281a] transition-colors"
                        >
                            <Award size={18} /> Create Opportunity
                        </button>
                    )}
                    {activeTab !== 'logs' && activeTab !== 'opportunities' && selectedUsers.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-200 transition-colors"
                        >
                            <Trash2 size={18} /> Delete ({selectedUsers.length})
                        </button>
                    )}
                    {activeTab !== 'logs' && activeTab !== 'opportunities' && (
                        <>
                            <button
                                onClick={handleExportUsersCSV}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-[#123524] border border-gray-200 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors"
                            >
                                <Download size={16} /> Export CSV
                            </button>

                            <button
                                onClick={() => { setEditingUser(null); setShowModal(true); }}
                                className="flex items-center gap-2 px-6 py-3 bg-[#123524] text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/20 hover:bg-[#0d281a] transition-colors"
                            >
                                <Users size={18} /> Add Agent
                            </button>
                        </>
                    )}

                    {activeTab === 'logs' && (
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-[#123524] text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/20 hover:bg-[#0d281a] transition-colors"
                        >
                            <Download size={18} /> Download PDF
                        </button>
                    )}
                </div>
            </header>

            {/* Main Navigation Tabs */}
            <div className="flex flex-wrap gap-2 py-4 border-b border-gray-100">
                {[
                    { id: 'volunteer', label: 'Volunteers', icon: Users },
                    { id: 'ngo', label: 'NGOs', icon: Briefcase },
                    { id: 'admin', label: 'Admins', icon: Shield },
                    { id: 'opportunities', label: 'Opportunities', icon: Award },
                    { id: 'logs', label: 'Audit Logs', icon: FileText }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                            ? 'bg-[#123524] text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>



            <div className="mt-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'overview' ? (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
                                    <Users className="text-emerald-500" size={20} />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Volunteers</span>
                                    <Users className="text-emerald-500" size={20} />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.volunteers}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NGOs</span>
                                    <Briefcase className="text-sky-500" size={20} />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.ngos}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opportunities</span>
                                    <Award className="text-amber-500" size={20} />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.opportunities}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Chats</span>
                                    <Activity className="text-blue-500" size={20} />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.activeChats}</p>
                            </div>
                        </div>

                        {/* Recent Activity & Registrations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                    {recentActivity.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
                                    ) : recentActivity.map((activity) => (
                                        <div key={activity._id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                                {(activity.performedBy?.username || 'S')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                                </div>
                                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                    {recentRegistrations.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No recent registrations</p>
                                    ) : recentRegistrations.map((user) => (
                                        <div key={user._id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                                                {(user.username || 'U')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded ${user.role === 'volunteer' ? 'bg-emerald-100 text-emerald-700' :
                                                    user.role === 'ngo' ? 'bg-sky-100 text-sky-700' :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'opportunities' ? (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                    <select
                                        value={oppFilter.status}
                                        onChange={(e) => setOppFilter({ ...oppFilter, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="in-progress">In Progress</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by location..."
                                        value={oppFilter.location}
                                        onChange={(e) => setOppFilter({ ...oppFilter, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search opportunities..."
                                        value={oppFilter.search}
                                        onChange={(e) => setOppFilter({ ...oppFilter, search: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setOppFilter({ status: '', ngo: '', location: '', search: '' })}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Opportunities Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50">
                                        <th className="px-6 py-4 w-10"></th>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">NGO</th>
                                        <th className="px-6 py-4">Required Skills</th>
                                        <th className="px-6 py-4">Volunteers</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                    {opportunities.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12 text-center text-gray-400 italic">
                                                {loading ? 'Loading...' : 'No opportunities found'}
                                            </td>
                                        </tr>
                                    ) : opportunities.map((opp) => (
                                        <React.Fragment key={opp._id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {opp.applications && opp.applications.length > 0 && (
                                                        <button
                                                            onClick={() => setExpandedOpportunity(expandedOpportunity === opp._id ? null : opp._id)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            {expandedOpportunity === opp._id ? '▼' : '▶'}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{opp.title}</td>
                                                <td className="px-6 py-4">
                                                    {opp.ngo_id?.username || opp.createdBy?.username || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(opp.required_skills || []).slice(0, 2).map((skill, idx) => (
                                                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {(opp.required_skills || []).length > 2 && (
                                                            <span className="text-[9px] text-gray-400">+{(opp.required_skills || []).length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-medium">
                                                            {opp.registered_count || 0} / {opp.capacity || '∞'}
                                                        </span>
                                                        {opp.applicationCount > 0 && (
                                                            <span className="text-[10px] text-gray-500">
                                                                {opp.pendingCount || 0} pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{opp.location || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${opp.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                                                        opp.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {opp.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {new Date(opp.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditOpportunity(opp)}
                                                            className="p-2 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/opportunities/${opp._id}`, '_blank')}
                                                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOpportunity(opp._id)}
                                                            className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedOpportunity === opp._id && opp.applications && opp.applications.length > 0 && (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-4 bg-gray-50">
                                                        <div className="space-y-3">
                                                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                                                Applications ({opp.applications.length})
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {opp.applications.map((app) => (
                                                                    <div key={app._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                                                                {(app.volunteer_id?.username || 'V')[0].toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    {app.volunteer_id?.username || app.volunteer_id?.fullName || 'Unknown'}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">{app.volunteer_id?.email}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`px-2 py-1 text-[10px] font-bold rounded ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                    'bg-amber-100 text-amber-700'
                                                                                }`}>
                                                                                {app.status}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400">
                                                                                {new Date(app.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50">
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Performed By</th>
                                    <th className="px-6 py-4">Target User</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">No logs found</td></tr>
                                ) : logs.map(log => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-700">{log.action}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                                                    {(log.performedBy?.username || 'S')[0].toUpperCase()}
                                                </div>
                                                {log.performedBy?.username || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{log.targetUser?.username || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {log.details}
                                            {log.reason && <span className="block text-red-500 text-[10px] mt-1 italic font-medium">Reason: {log.reason}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    renderTable(
                        activeTab === 'volunteer' ? volunteers : activeTab === 'ngo' ? ngos : admins,
                        activeTab
                    )
                )}
            </div>



            {/* Block Modal */}
            <AnimatePresence>
                {showBlockModal && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 pointer-events-auto sticky"
                            style={{
                                marginTop: Math.max(100, modalPos.top - 200) + 'px',
                                marginLeft: 'auto',
                                marginRight: '10%'
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Block Access</h3>
                                <button onClick={() => setShowBlockModal(false)} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                            </div>
                            <p className="text-gray-500 text-xs mb-4">State the reason for restricting this identity.</p>

                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Violation of community terms..."
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitBlock}
                                    className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-lg shadow-rose-900/10"
                                >
                                    Confirm Block
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AdminUserModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveUser}
                user={editingUser}
            />

            {/* Opportunity Create/Edit Modal */}
            <AnimatePresence>
                {showOppModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-[60]"
                            style={{ backgroundColor: '#ffffff', opacity: 1, border: '1px solid #e5e7eb' }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {editingOpportunity ? 'Edit Opportunity' : 'Create Opportunity'}
                                </h3>
                                <button onClick={() => { setShowOppModal(false); setEditingOpportunity(null); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title *</label>
                                        <input
                                            type="text"
                                            value={oppFormData.title}
                                            onChange={(e) => setOppFormData({ ...oppFormData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">NGO *</label>
                                        <select
                                            value={oppFormData.ngo_id}
                                            onChange={(e) => setOppFormData({ ...oppFormData, ngo_id: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            required
                                        >
                                            <option value="">Select NGO</option>
                                            {ngoList.map(ngo => (
                                                <option key={ngo._id} value={ngo._id}>
                                                    {ngo.ngoDetails?.organizationName || ngo.username}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description</label>
                                    <input
                                        type="text"
                                        value={oppFormData.short}
                                        onChange={(e) => setOppFormData({ ...oppFormData, short: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                    <textarea
                                        value={oppFormData.description}
                                        onChange={(e) => setOppFormData({ ...oppFormData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={oppFormData.location}
                                            onChange={(e) => setOppFormData({ ...oppFormData, location: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={oppFormData.date}
                                            onChange={(e) => setOppFormData({ ...oppFormData, date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                        <select
                                            value={oppFormData.status}
                                            onChange={(e) => setOppFormData({ ...oppFormData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        >
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                            <option value="in-progress">In Progress</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={oppFormData.time}
                                            onChange={(e) => setOppFormData({ ...oppFormData, time: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={oppFormData.endTime}
                                            onChange={(e) => setOppFormData({ ...oppFormData, endTime: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Capacity</label>
                                        <input
                                            type="number"
                                            value={oppFormData.capacity}
                                            onChange={(e) => setOppFormData({ ...oppFormData, capacity: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="No limit if empty"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Required Skills</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            placeholder="Add skill and press Enter"
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                        <button
                                            onClick={addSkill}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {oppFormData.required_skills.map((skill, idx) => (
                                            <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="text-emerald-700 hover:text-emerald-900">
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => { setShowOppModal(false); setEditingOpportunity(null); }}
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveOpportunity}
                                        className="px-6 py-2 text-sm font-medium text-white bg-[#123524] rounded-lg hover:bg-[#0d281a] transition-colors"
                                    >
                                        {editingOpportunity ? 'Update' : 'Create'} Opportunity
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
