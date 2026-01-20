import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Droplets,
  Wind,
  ArrowUpRight,
  Target,
  Trophy,
  Leaf,
  Zap,
  ShieldCheck,
  Plus
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import api from "./utils/api";
import AddImpactModal from "./components/AddImpactModal";
import LoadingSpinner from "./components/LoadingSpinner";

export default function MyImpact() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    pickups: 0,
    hours: 0,
    saved: 0,
    diverted: 0,
    water: 0,
    air: 0,
    monthlyPickups: 0,
    monthlyHours: 0,
    monthlyCommunities: 0,
    overallGoal: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchImpactData = async () => {
    try {
      const [summaryRes, trendsRes] = await Promise.all([
        api.get('/impact/summary'),
        api.get('/impact/trends')
      ]);

      if (summaryRes.data.success) {
        setStats(summaryRes.data.data);
      }
      if (trendsRes.data.success) {
        setTrendData(trendsRes.data.activity);
        setBenchmarks(trendsRes.data.benchmarks);
      }
    } catch (err) {
      console.error('Error fetching impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, []);

  const name = localStorage.getItem("fullName") || "User";

  // Phthalo Green Theme Colors
  const colors = {
    primary: "#123524",
    accent: "#059669",
    bg: "#fcfdfc",
    card: "#ffffff"
  };

  const CircularProgress = ({ value, max, label, icon }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              stroke={colors.primary}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-normal text-gray-900 leading-none">{value}</span>
            <span className="text-[8px] text-gray-400 font-normal uppercase mt-1">of {max}</span>
          </div>
        </div>
        <span className="text-[10px] font-normal text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
    );
  };
  if (loading) {
    return <LoadingSpinner fullPage message="Calculating Your Impact..." />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-normal text-primary uppercase tracking-[0.2em] mb-2 block" style={{ color: colors.primary }}>Welcome Back</span>
            <h1 className="text-4xl font-normal text-gray-900 tracking-tight leading-tight">
              Your Impact Dashboard
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">

            {/* Today's Impact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-1 scale-100"
            >
              <div className="rounded-[20px] p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/10" style={{ backgroundColor: colors.primary }}>
                      <Zap size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-gray-900 tracking-tight">Today's Impact</h3>
                      <p className="text-[11px] text-gray-400 font-normal">Monday, January 6</p>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Active", value: stats.pickups, sub: "Pickups today", icon: <motion.div className="w-2 h-2 rounded-full bg-red-800" /> },
                    { label: "Hours", value: stats.hours, sub: "Volunteered", icon: <Clock size={16} className="text-amber-600" /> },
                    { label: "Saved", value: `${stats.saved}kg`, sub: "Carbon offset", icon: <Leaf size={16} className="text-emerald-600" /> }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
                      <div className="flex items-center gap-2 mb-4">
                        {item.icon}
                        <span className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">{item.label}</span>
                      </div>
                      <div className="text-3xl font-normal text-gray-900 tracking-tight mb-1">{item.value}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Trends & Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="premium-card p-1"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-normal text-gray-900 tracking-tight">Monthly Waste Diversion</h3>
                      <p className="text-[11px] text-gray-400 font-normal uppercase tracking-widest mt-1">Last 6 Months (kg)</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke={colors.primary}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorWeight)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="premium-card p-1"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-normal text-gray-900 tracking-tight">Community Benchmark</h3>
                      <p className="text-[11px] text-gray-400 font-normal uppercase tracking-widest mt-1">Comparison (kg)</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'You', value: benchmarks?.userTotal || 0 },
                          { name: 'Avg Volunteer', value: Math.round(benchmarks?.average || 0) }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          dx={-10}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          <Cell fill={colors.primary} />
                          <Cell fill="#e2e8f0" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest">
                    {benchmarks?.userTotal >= benchmarks?.average
                      ? "You're outperforming the average! Keep it up!"
                      : `Only ${Math.round(benchmarks?.average - benchmarks?.userTotal)}kg away from the community average.`
                    }
                  </p>
                </div>
              </motion.div>
            </div>


          </div>

          {/* Sidebar Space */}
          <div className="w-full lg:w-[380px] space-y-8">

            {/* Monthly Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: colors.primary }}>
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-base font-normal text-gray-900">Monthly Progress</h3>
                  <p className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">January 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <CircularProgress value={stats.monthlyPickups} max={30} label="Pickups" />
                <CircularProgress value={stats.monthlyHours} max={200} label="Hours" />
                <CircularProgress value={stats.monthlyCommunities} max={10} label="Communities" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-normal uppercase tracking-widest">Overall Goal</span>
                  <span className="text-gray-900 font-normal">{stats.overallGoal}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.overallGoal}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-normal mt-4">
                  {stats.remainingPoints > 0
                    ? `${stats.remainingPoints.toLocaleString()} points more to unlock next level`
                    : `You've reached the highest level!`
                  }
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <AddImpactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={fetchImpactData}
      />
    </>
  );
}
