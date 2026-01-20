import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Users, Briefcase, Award, Activity, TrendingUp, Calendar, MessageSquare, Package, Download, Shield
} from 'lucide-react';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboardView = () => {
    const { showToast } = useUI();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [daysFilter, setDaysFilter] = useState(30);

    useEffect(() => {
        fetchDashboardData(true);

        // Auto-refresh every 30 seconds (silent refresh)
        const interval = setInterval(() => {
            fetchDashboardData(false);
        }, 30000);

        return () => clearInterval(interval);
    }, [daysFilter]);

    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await api.get(`/admin/dashboard-data?days=${daysFilter}`);
            if (response.data && response.data.success) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (showLoading) {
                showToast('Failed to load dashboard data', 'error');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const svgToPngDataUrl = (svgNode, width, height) => {
        return new Promise((resolve, reject) => {
            try {
                const serializer = new XMLSerializer();
                let svgString = serializer.serializeToString(svgNode);
                if (!svgString.match(/^<svg[^>]+xmlns="http/)) {
                    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                }

                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        // Use provided width/height (px)
                        canvas.width = Math.max(1, Math.round(width));
                        canvas.height = Math.max(1, Math.round(height));
                        const ctx = canvas.getContext('2d');
                        // white background
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/png');
                        URL.revokeObjectURL(url);
                        resolve({ dataUrl, width: canvas.width, height: canvas.height });
                    } catch (e) {
                        URL.revokeObjectURL(url);
                        reject(e);
                    }
                };
                img.onerror = (e) => {
                    URL.revokeObjectURL(url);
                    reject(e);
                };
                img.src = url;
            } catch (e) {
                reject(e);
            }
        });
    };

    const handleDownloadDashboardPDF = async () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('WasteZero Admin Dashboard', 14, 20);
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

            const s = dashboardData?.stats || {};
            const statsTable = [
                ['Total Users', s.totalUsers || 0],
                ['Volunteers', s.volunteers || 0],
                ['NGOs', s.ngos || 0],
                ['Opportunities', s.opportunities || 0],
                ['Active Chats', s.activeChats || 0]
            ];

            autoTable(doc, {
                startY: 36,
                head: [['Metric', 'Value']],
                body: statsTable,
                styles: { fontSize: 10 }
            });

            // Capture charts by container IDs and embed as images
            const chartIds = [
                'chart-user-growth',
                'chart-opportunity-trends',
                'chart-application-trends',
                'chart-role-distribution'
            ];

            let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 50;
            const pageHeight = doc.internal.pageSize.getHeight();
            const maxWidthMm = doc.internal.pageSize.getWidth() - 28; // margins

            for (const id of chartIds) {
                const container = document.getElementById(id);
                if (!container) continue;
                const svg = container.querySelector('svg');
                if (!svg) continue;

                const bbox = svg.getBoundingClientRect();
                const pxWidth = bbox.width || 600;
                const pxHeight = bbox.height || 300;

                try {
                    const { dataUrl, width: imgPxW, height: imgPxH } = await svgToPngDataUrl(svg, pxWidth, pxHeight);

                    // Convert desired mm width
                    const imgWidthMm = maxWidthMm;
                    const imgHeightMm = (imgPxH / imgPxW) * imgWidthMm;

                    if (y + imgHeightMm + 20 > pageHeight) {
                        doc.addPage();
                        y = 14;
                    }

                    doc.addImage(dataUrl, 'PNG', 14, y, imgWidthMm, imgHeightMm);
                    y += imgHeightMm + 8;
                } catch (e) {
                    console.error('Error capturing chart', id, e);
                    if (y + 12 > pageHeight) { doc.addPage(); y = 14; }
                    doc.setFontSize(10);
                    doc.text(`(Chart '${id}' could not be captured)`, 14, y);
                    y += 12;
                }
            }

            const fileName = `wastezero_admin_dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            showToast('Dashboard PDF downloaded', 'success');
        } catch (err) {
            console.error('Dashboard PDF error', err);
            showToast('Failed to generate dashboard PDF', 'error');
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="Loading platform analytics..." />;
    }

    if (!dashboardData) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    const { stats, charts, recentEvents, topNgos, recentActivity } = dashboardData;

    // Format chart data with better date formatting
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const userGrowthData = (charts.userGrowth || []).map(item => ({
        date: formatDate(item._id),
        dateRaw: item._id,
        volunteers: item.volunteers || 0,
        ngos: item.ngos || 0,
        total: item.total || 0
    }));

    const opportunityData = (charts.opportunityTrends || []).map(item => ({
        date: formatDate(item._id),
        dateRaw: item._id,
        created: item.count || 0,
        open: item.open || 0,
        closed: item.closed || 0
    }));

    const applicationData = (charts.applicationTrends || []).map(item => ({
        date: formatDate(item._id),
        dateRaw: item._id,
        pending: item.pending || 0,
        accepted: item.accepted || 0,
        rejected: item.rejected || 0,
        total: item.total || 0
    }));

    const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

    return (
        <div className="p-8 lg:p-12 space-y-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time platform analytics and insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={daysFilter}
                        onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                        <option value={365}>Last Year</option>
                    </select>
                    <button
                        onClick={handleDownloadDashboardPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-[#123524] text-white rounded-lg text-sm hover:bg-[#0d281a]"
                    >
                        <Download size={16} /> Download Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Users className="text-emerald-600" size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+{stats.volunteers}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.volunteers}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Volunteers</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="text-blue-600" size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">+{stats.ngos}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.ngos}</p>
                    <p className="text-sm text-gray-500 mt-1">Total NGOs</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Award className="text-amber-600" size={24} />
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">+{stats.opportunities}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.opportunities}</p>
                    <p className="text-sm text-gray-500 mt-1">Opportunities</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Activity className="text-purple-600" size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">ATLAS MONITOR</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{dashboardData.systemStats?.atlasMemory || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-1">Srv: {dashboardData.systemStats?.memoryUsage || 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-1">Data Utilization</p>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Registration Growth */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">User Registration Growth</h3>
                            <p className="text-xs text-gray-500">Volunteers and NGOs registered over time</p>
                        </div>
                        <TrendingUp className="text-emerald-500" size={24} />
                    </div>
                    <div id="chart-user-growth">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={userGrowthData.length > 0 ? userGrowthData : [{ date: 'No Data', volunteers: 0, ngos: 0 }]}>
                                <defs>
                                    <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNGOs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volunteers"
                                    stroke="#10b981"
                                    fill="url(#colorVolunteers)"
                                    strokeWidth={2}
                                    animationDuration={1000}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ngos"
                                    stroke="#3b82f6"
                                    fill="url(#colorNGOs)"
                                    strokeWidth={2}
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Opportunity Trends */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Opportunity Trends</h3>
                            <p className="text-xs text-gray-500">Opportunities created and their status</p>
                        </div>
                        <Calendar className="text-amber-500" size={24} />
                    </div>
                    <div id="chart-opportunity-trends">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={opportunityData.length > 0 ? opportunityData : [{ date: 'No Data', created: 0, open: 0, closed: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="created" fill="#3b82f6" radius={[8, 8, 0, 0]} animationDuration={1000} />
                                <Bar dataKey="open" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1000} />
                                <Bar dataKey="closed" fill="#6b7280" radius={[8, 8, 0, 0]} animationDuration={1000} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Application Trends */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Application Trends</h3>
                            <p className="text-xs text-gray-500">Volunteer applications over time</p>
                        </div>
                        <MessageSquare className="text-purple-500" size={24} />
                    </div>
                    <div id="chart-application-trends">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={applicationData.length > 0 ? applicationData : [{ date: 'No Data', total: 0, pending: 0, accepted: 0, rejected: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    animationDuration={1000}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="accepted"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    animationDuration={1000}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pending"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ fill: '#f59e0b', r: 4 }}
                                    animationDuration={1000}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rejected"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                    animationDuration={1000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Role Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">User Distribution</h3>
                            <p className="text-xs text-gray-500">Breakdown by user roles</p>
                        </div>
                        <Users className="text-indigo-500" size={24} />
                    </div>
                    <div id="chart-role-distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={charts.roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {charts.roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Additional Stats and Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Additional Stats */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-black text-gray-900">{stats.totalUsers}</p>
                            <p className="text-sm text-gray-500">Total Users</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-black text-gray-900">{stats.activeChats}</p>
                            <p className="text-sm text-gray-500">Active Chats</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-black text-gray-900">{dashboardData.systemStats?.dbSize || '0 KB'}</p>
                            <p className="text-sm text-gray-500">Atlas Storage</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-black text-gray-900">
                                {dashboardData.systemStats?.collections || 0}
                            </p>
                            <p className="text-sm text-gray-500">DB Collections</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-black text-gray-900">
                                {dashboardData.systemStats?.uptime || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">Node.js Uptime</p>
                        </div>
                    </div>
                </div>

                {/* Activities & Events Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity (Admin Logs) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-emerald-600" />
                            Platform Activity Logs
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {recentActivity && recentActivity.length > 0 ? recentActivity.map((log) => (
                                <div key={log._id} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-emerald-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                                            {log.action}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-1">{log.details}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[10px] text-gray-400">By:</span>
                                        <span className="text-[10px] font-bold text-gray-600">{log.performedBy?.username || 'System'}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-8">No recent activity detected</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Events (Opportunities) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package size={20} className="text-blue-600" />
                            Mission Streams
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {recentEvents && recentEvents.length > 0 ? recentEvents.slice(0, 10).map((event) => (
                                <div key={event._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Award className="text-blue-600" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {event.ngo_id?.username || 'N/A'} • {new Date(event.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[9px] font-black uppercase rounded ${event.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                                        event.status === 'closed' ? 'bg-gray-200 text-gray-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-8">No recent missions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top NGOs */}
            {topNgos && topNgos.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing NGOs</h3>
                    <div className="space-y-3">
                        {topNgos.map((ngo, index) => (
                            <div key={ngo._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{ngo.ngoName}</p>
                                        <p className="text-xs text-gray-500">{ngo.ngoEmail}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{ngo.opportunityCount}</p>
                                    <p className="text-xs text-gray-500">Opportunities</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardView;

