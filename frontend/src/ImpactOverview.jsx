import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaChevronRight,
    FaLeaf, FaUsers, FaGlobe, FaCheckCircle, FaStar, FaQuoteLeft,
    FaCalendarAlt, FaTruckLoading, FaShieldAlt, FaChartLine
} from "react-icons/fa";
import api from "./utils/api";
import "./LandingPage.css";

export default function ImpactOverview() {
    const [impactData, setImpactData] = useState({ feedbacks: [], ratings: [] });
    const [globalStats, setGlobalStats] = useState({ unitsRecycled: 0, activeMissions: 0, carbonSaved: 0, avgRating: '4.8' });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('missions');

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const [feedRes, rateRes, statsRes] = await Promise.all([
                    api.get('/feedback/opportunity-latest'),
                    api.get('/feedback/app-rating/all'),
                    api.get('/feedback/global-stats')
                ]);
                setImpactData({
                    feedbacks: feedRes.data.data || [],
                    ratings: rateRes.data.data || []
                });
                if (statsRes.data?.success) {
                    setGlobalStats(statsRes.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen landing-page flex flex-col bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Premium Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl bg-[#123524]/90 shadow-2xl border-b border-white/5">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3"
                >
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white rounded-full p-1.5 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                            <img src="/waste-truck.png" alt="WasteZero" className="w-8 h-8 object-contain" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">WasteZero</h1>
                    </Link>
                </motion.div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="hidden sm:block text-sm font-semibold text-white/80 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-[#123524] bg-white rounded-full hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95">
                        Join the Movement
                    </Link>
                </div>
            </header>

            {/* Hero Section with Parallax-like Background */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#123524]"
            >
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-emerald-400/20">
                            WasteZero Live Community Impact
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]">
                            Simplifying Sustainability <br />
                            <span className="text-emerald-400">One Pickup At A Time</span>
                        </h2>
                        <p className="text-lg md:text-xl text-emerald-100/70 max-w-2xl mx-auto leading-relaxed font-light">
                            Witness the real-time environmental change driven by our network of volunteers and NGOs through smart waste scheduling.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Real-time Stats Section */}
            <section className="relative z-20 -mt-10 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Units Recycled', value: `${globalStats.unitsRecycled}+`, icon: FaTruckLoading, color: 'emerald' },
                        { label: 'Active Missions', value: `${globalStats.activeMissions}`, icon: FaCalendarAlt, color: 'blue' },
                        { label: 'Carbon Saved', value: `${globalStats.carbonSaved} Tons`, icon: FaLeaf, color: 'amber' },
                        { label: 'Global Trust', value: `${globalStats.avgRating}/5`, icon: FaShieldAlt, color: 'purple' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-all"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Main Impact Tabs */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                    <div className="inline-flex bg-gray-100 p-1.5 rounded-full mb-8">
                        <button
                            onClick={() => setActiveTab('missions')}
                            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'missions' ? 'bg-[#123524] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Mission Log (Vol → NGO)
                        </button>
                        <button
                            onClick={() => setActiveTab('trust')}
                            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'trust' ? 'bg-[#123524] text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Platform Trust (Public)
                        </button>
                    </div>

                    <h3 className="text-3xl md:text-5xl font-bold text-gray-900 text-center">
                        {activeTab === 'missions' ? 'Success Stories from the Field' : 'Community Voices on WasteZero'}
                    </h3>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 text-center"
                        >
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 font-medium">Synchronizing global impact data...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {activeTab === 'missions' ? (
                                impactData.feedbacks.length > 0 ? (
                                    impactData.feedbacks.map((fb, idx) => (
                                        <motion.div
                                            key={fb._id}
                                            variants={itemVariants}
                                            className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                                        >
                                            <div className="absolute top-8 right-8 text-emerald-100 group-hover:text-emerald-50 transition-colors">
                                                <FaQuoteLeft size={40} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <img
                                                        src={fb.fromUser?.volunteerDetails?.avatar || fb.fromUser?.ngoDetails?.logo || `https://ui-avatars.com/api/?name=${fb.fromUser?.username}`}
                                                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-50 shadow-sm"
                                                        alt=""
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-[#123524] transition-colors">{fb.fromUser?.username}</h4>
                                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">on {fb.opportunityId?.title || 'Mission'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-8 italic">"{fb.content}"</p>
                                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} size={12} className={i < fb.rating ? "text-amber-400" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-gray-400 italic">No mission logs captured yet.</div>
                                )
                            ) : (
                                impactData.ratings.length > 0 ? (
                                    impactData.ratings.map((rate, idx) => (
                                        <motion.div
                                            key={rate._id}
                                            variants={itemVariants}
                                            className="bg-emerald-50/30 p-8 rounded-[2.5rem] border border-emerald-100/50 flex flex-col h-full"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#123524] font-bold shadow-sm">
                                                    {rate.user?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{rate.user?.username}</h4>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified Experience</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed flex-1 italic mb-6">"{rate.comment || 'The interface is incredibly smooth and the scheduling is precise. Highly recommend!'}"</p>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} size={14} className={i < rate.rating ? "text-emerald-500" : "text-gray-200"} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-gray-400 italic">Be the first to rate our ecosystem!</div>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Futuristic Roadmap / Feature Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-8">Intelligent <br />Scheduling Engine</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Zero-Waste Routing', desc: 'Cutting edge AI that reduces vehicle idle time by 40%.', icon: FaChartLine },
                                { title: 'Transparent Tracking', desc: 'Blockchain-inspired immutable logs for every pickup.', icon: FaShieldAlt },
                                { title: 'Global NGO Network', desc: 'Connecting more than 2,000 NGOs with local heroes.', icon: FaGlobe }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-emerald-400 blur-[100px] opacity-20"></div>
                        <img
                            src="/impact-viz.jpg"
                            className="relative z-10 rounded-[3rem] shadow-3xl border-8 border-white object-cover aspect-square"
                            alt="Visualizing our impact"
                        />
                    </motion.div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="bg-[#123524] pt-24 pb-12 px-6 md:px-12 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 opacity-5 blur-[120px]"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/waste-truck.png" className="w-10 h-10 invert brightness-0" alt="" />
                                <span className="text-3xl font-black tracking-tight">WasteZero</span>
                            </div>
                            <p className="text-emerald-100/60 max-w-sm mb-8 leading-relaxed">
                                Empowering the digital generation to resolve real-world environmental challenges through elegant, community-driven technology.
                            </p>
                            <div className="flex gap-4">
                                {[FaGithub, FaTwitter, FaLinkedin, FaEnvelope].map((Icon, i) => (
                                    <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all">
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-emerald-400">Navigation</h4>
                            <ul className="space-y-4 text-emerald-100/50 text-sm font-bold">
                                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Join NGO Network</Link></li>
                                <li><Link to="/impact-overview" className="hover:text-white transition-colors">Platform Trust</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-emerald-400">Legal</h4>
                            <ul className="space-y-4 text-emerald-100/50 text-sm font-bold">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Shield</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Service Terms</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100/20">
                        <p>&copy; 2026 WasteZero Ecosystem. In Pursuit of Clean.</p>
                        <div className="flex gap-8">
                            <span className="flex items-center gap-2 underline underline-offset-8">Status: Fully Operational</span>
                            <span className="flex items-center gap-2 underline underline-offset-8">Version 4.2.0</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
