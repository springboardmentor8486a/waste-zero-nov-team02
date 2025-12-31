import React from "react";
import PageHeader from "./components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Award, TrendingUp, Users, Leaf } from "lucide-react";

export default function MyImpact() {
  // Mock Data for "Content"
  const impactData = [
    { name: "Plastic", amount: 120 },
    { name: "Paper", amount: 80 },
    { name: "Metal", amount: 45 },
    { name: "E-Waste", amount: 30 },
  ];

  const badges = [
    { id: 1, name: "Eco Warrior", icon: <Leaf size={24} className="text-green-600" />, bg: "bg-green-100" },
    { id: 2, name: "Top Volunteer", icon: <Award size={24} className="text-yellow-600" />, bg: "bg-yellow-100" },
    { id: 3, name: "Community Hero", icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-100" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="My Impact"
          subtitle="Track your contributions and activities."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50 hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pickups Completed</div>
                <div className="text-5xl font-black text-gray-900 tracking-tight">14</div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg text-white transform rotate-3">
                <Leaf size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <div className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-green-700">
                <TrendingUp size={12} />
                <span>+4 this month</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Hours Volunteered</div>
                <div className="text-5xl font-black text-gray-900 tracking-tight">28</div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg text-white transform -rotate-2">
                <ClockIcon />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">Target: <span className="text-gray-900 font-bold">40 hrs/year</span></span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Communities Helped</div>
                <div className="text-5xl font-black text-gray-900 tracking-tight">3</div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 shadow-lg text-white transform rotate-2">
                <Users size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-6 flex -space-x-2 pl-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white ring-2 ring-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-400">+</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Waste Collection Breakdown</h3>
              <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-xl px-4 py-2 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#F3F4F6', radius: 8 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[12, 12, 12, 12]}>
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10B981' : '#34D399'} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Total waste diverted from landfills: <span className="font-bold text-gray-900 text-lg ml-1">275 kg</span>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Achievements</h3>
            <div className="space-y-4">
              {badges.map(badge => (
                <div key={badge.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default group transform hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl ${badge.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{badge.name}</h4>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Earned 2 weeks ago</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-200 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center grayscale">
                  <LockIcon />
                </div>
                <div>
                  <h4 className="font-bold text-gray-500 text-lg">Master Recycler</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-0.5">Locked • 50 Pickups</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )
}
