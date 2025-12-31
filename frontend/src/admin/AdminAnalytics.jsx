import { useRef, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, Calendar, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const USER_GROWTH_DATA = [
    { name: 'Jan', users: 40 },
    { name: 'Feb', users: 65 },
    { name: 'Mar', users: 90 },
    { name: 'Apr', users: 110 },
    { name: 'May', users: 135 },
    { name: 'Jun', users: 154 },
];

const ACTIVITY_DATA = [
    { name: 'Plastic', amount: 400 },
    { name: 'Metal', amount: 240 },
    { name: 'Paper', amount: 300 },
    { name: 'Glass', amount: 150 },
    { name: 'E-Waste', amount: 80 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminAnalytics() {
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef(null);

    const handleExport = async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // higher quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Simple single page handling for now, can loop for multi-page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

            pdf.save(`WasteWise_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Failed to export PDF.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-8 pb-8" ref={reportRef}>
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div data-html2canvas-ignore>
                    <h1 className="text-3xl font-black text-white drop-shadow-md">Analytics & Reports</h1>
                    <p className="text-gray-200 mt-1 font-medium drop-shadow-sm">Platform performance overview.</p>
                </div>
                <div className="flex gap-3" data-html2canvas-ignore>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-[#123524] text-xs font-bold uppercase shadow hover:shadow-lg transition-all border border-white/50">
                        <Calendar size={14} /> Last 6 Months
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-[#123524] text-white rounded-xl text-xs font-bold uppercase shadow hover:bg-[#0d281a] disabled:opacity-50 transition-all border border-[#123524]"
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {exporting ? 'Generating...' : 'Export Report'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#123524]"></span>
                        User Growth Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={USER_GROWTH_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="users" stroke="#123524" strokeWidth={3} dot={{ r: 4, fill: '#123524', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Waste Category Split */}
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                        Waste Collection by Category
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ACTIVITY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} barSize={32}>
                                    {ACTIVITY_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#123524' : '#059669'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Participation & Engagement Hub */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm lg:col-span-2 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-lg">Community Engagement & Participation</h3>
                        <span className="bg-green-100 text-[#123524] text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Live Stats</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* 1. Demographics Donut */}
                        <div className="p-6 flex flex-col items-center justify-center relative">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">User Demographics</h4>
                            <div className="h-48 w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Volunteers', value: 120 },
                                                { name: 'NGOs', value: 34 },
                                                { name: 'Admins', value: 2 }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#0088FE" />
                                            <Cell fill="#00C49F" />
                                            <Cell fill="#FFBB28" />
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Stat */}
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                                    <span className="text-3xl font-black text-gray-800">156</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total Users</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Engagement Metrics */}
                        <div className="p-6 space-y-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Engagement Health</h4>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 font-medium">Active Volunteers</span>
                                        <span className="text-green-600 font-bold">78%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 font-medium">Reports Resolved</span>
                                        <span className="text-blue-600 font-bold">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 font-medium">NGO Response Rate</span>
                                        <span className="text-yellow-600 font-bold">64%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                <div>
                                    <div className="text-2xl font-black text-gray-900">+24%</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Weekly Growth</div>
                                </div>
                                <div className="h-8 w-px bg-gray-100"></div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">4.8/5</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Avg Satisfaction</div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Top Contributors */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top Contributors</h4>
                                <button className="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold transition-colors">View All</button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: "Sarah J.", role: "Volunteer", points: 1250, badge: "bg-yellow-100 text-yellow-700" },
                                    { name: "GreenEarth NGO", role: "Partner", points: 980, badge: "bg-blue-100 text-blue-700" },
                                    { name: "Mike R.", role: "Volunteer", points: 845, badge: "bg-gray-100 text-gray-600" },
                                ].map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.badge}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-800">{u.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">{u.role}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-[#123524]">{u.points}</div>
                                            <div className="text-[9px] text-gray-400">pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-2 border border-dashed border-gray-200 text-gray-400 text-xs font-bold uppercase rounded-lg hover:border-[#123524] hover:text-[#123524] transition-all">
                                + Reward New User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
