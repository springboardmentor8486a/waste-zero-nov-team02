import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, FileText, FileDown, Activity, Clock, Zap, Target, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useUI } from '../../context/UIContext';
import api from '../../utils/api';

const Reports = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const { showToast } = useUI();

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const startDate = getStartDate(dateRange);
            const endDate = new Date().toISOString().split('T')[0];
            
            const response = await api.get(`/admin/reports?startDate=${startDate}&endDate=${endDate}`);
            if (response.data && response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            showToast('Failed to load reports data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStartDate = (range) => {
        const today = new Date();
        let days = 30;
        if (range === 'Last 7 Days') days = 7;
        else if (range === 'Last 90 Days') days = 90;
        else if (range === 'Annual Review') days = 365;
        
        const start = new Date(today);
        start.setDate(start.getDate() - days);
        return start.toISOString().split('T')[0];
    };

    // Transform backend data for charts
    const growthData = reportData?.userGrowth?.map(item => ({
        name: item._id,
        volunteers: item.volunteers || 0,
        ngos: item.ngos || 0
    })) || [];

    const activityData = reportData?.opportunityTrends?.map(item => ({
        name: item._id,
        completed: item.closed || 0,
        pending: item.open || 0
    })) || [];

    const participationData = [
        { name: 'Total Applications', value: reportData?.volunteerParticipation?.totalApplications || 0, color: '#10b981' },
        { name: 'Unique Volunteers', value: reportData?.volunteerParticipation?.uniqueVolunteers || 0, color: '#3b82f6' },
        { name: 'Accepted', value: reportData?.volunteerParticipation?.acceptedApplications || 0, color: '#f59e0b' },
    ];

    const handleExport = (type) => {
        showToast(`Exporting high-quality ${type} report...`, 'info');
        // TODO: Implement actual export functionality
    };

    if (loading) {
        return (
            <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <PageHeader
                    title="Intelligence Forge"
                    subtitle="Real-time analytical breakdown of platform-wide environmental impact."
                />

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-4 rounded-[28px] border border-white/10 shadow-2xl backdrop-blur-xl text-[10px] font-black uppercase tracking-widest text-white/60">
                        <Calendar size={16} className="text-emerald-400" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 cursor-pointer text-white font-black"
                        >
                            <option className="bg-slate-900">Last 7 Days</option>
                            <option className="bg-slate-900">Last 30 Days</option>
                            <option className="bg-slate-900">Last 90 Days</option>
                            <option className="bg-slate-900">Annual Review</option>
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExport('CSV')}
                        className="flex items-center gap-3 bg-white/5 px-8 py-4 rounded-[28px] border border-emerald-500/20 shadow-2xl backdrop-blur-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                        <FileText size={16} /> Export CSV
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExport('PDF')}
                        className="flex items-center gap-3 bg-white text-[#123524] px-8 py-4 rounded-[28px] shadow-2xl shadow-emerald-900/40 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all border border-emerald-100"
                    >
                        <FileDown size={16} /> Generate Report
                    </motion.button>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-glass p-10 rounded-[56px] border border-white/10 shadow-2xl relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Ecosystem Scale</h3>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Volunteer Adoption vs NGO Partnerships</p>
                        </div>
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/10 shadow-inner">
                            <TrendingUp size={28} />
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNGO" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: '16px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="volunteers" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorVol)" />
                                <Area type="monotone" dataKey="ngos" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorNGO)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Opportunity Activity Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="premium-glass p-10 rounded-[56px] border border-white/10 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Mission Throughput</h3>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Operational completion efficiency</p>
                        </div>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/10 shadow-inner">
                            <Activity size={28} />
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 12 }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} />
                                <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Participation Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="premium-glass p-10 rounded-[56px] border border-white/10 shadow-2xl"
                >
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Stream Partition</h3>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Resource allocation by waste stream</p>
                        </div>
                        <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-400 border border-amber-500/10 shadow-inner">
                            <Target size={28} />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={participationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={130}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {participationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Key Metrics / Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-emerald-600 to-[#123524] p-10 rounded-[56px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex justify-between items-start relative z-10">
                            <h4 className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Critical Yield</h4>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg"><Zap size={24} /></div>
                        </div>
                        <div className="mt-12 relative z-10">
                            <p className="text-5xl font-black tracking-tighter">4.2 Tons</p>
                            <p className="text-[11px] font-black mt-3 opacity-60 uppercase tracking-widest">Aggregate Polymers Recovered</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[56px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex justify-between items-start relative z-10">
                            <h4 className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Temporal Latency</h4>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg"><Clock size={24} /></div>
                        </div>
                        <div className="mt-12 relative z-10">
                            <p className="text-5xl font-black tracking-tighter">12.5 Min</p>
                            <p className="text-[11px] font-black mt-3 opacity-60 uppercase tracking-widest">Volunteer-Mission Synchronicity</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default Reports;
