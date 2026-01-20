import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyActivity } from "../utils/api";
import { Activity, Clock } from "lucide-react";


// Helper icon
const Zap = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function ActivityFeed({ limit }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyActivity()
      .then((data) => {
        if (data.success) {
          const acts = limit ? data.activities.slice(0, limit) : data.activities;
          setActivities(acts);
        }
      })
      .catch(err => {
        console.error("Failed to load activity feed", err);
        setActivities([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-white/5 rounded-lg animate-pulse w-3/4" />
            <div className="h-3 bg-white/5 rounded-lg animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-white/20 border border-white/5">
          <Activity size={32} />
        </div>
        <p className="text-[10px] font-normal text-white/20 uppercase tracking-[0.3em]">Temporal Void</p>
      </div>
    );
  }

  return (
    <ul className="space-y-8">
      <AnimatePresence>
        {activities.map((a, i) => (
          <motion.li
            key={a._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-5 items-start group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 transition-colors shadow-lg">
                <Zap size={20} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-normal text-white group-hover:text-emerald-400 transition-colors leading-relaxed tracking-tight">
                {a.action} {a.meta ? <span className="text-white/30 font-normal block mt-0.5">at {typeof a.meta === 'object' ? (a.meta?.address || JSON.stringify(a.meta)) : a.meta}</span> : ""}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={10} className="text-white/20" />
                <p className="text-[9px] font-normal text-white/20 uppercase tracking-[0.2em]">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent Synchrony'}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}


