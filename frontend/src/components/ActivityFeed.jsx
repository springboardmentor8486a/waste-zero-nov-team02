import { useEffect, useState } from "react";
import { getMyActivity } from "../utils/api";

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
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-lg" />
      ))}
    </div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm font-bold text-gray-400 italic">No recent activity detected.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {activities.map((a) => (
        <li key={a._id} className="flex gap-4 items-start group">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {a.action} {a.meta ? <span className="text-gray-400 font-medium">at {a.meta}</span> : ""}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
