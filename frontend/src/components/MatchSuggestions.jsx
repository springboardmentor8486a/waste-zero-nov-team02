import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import PageHeader from "./PageHeader";
import { MapPin, Recycle, CheckCircle, MessageSquare } from "lucide-react";

export default function MatchSuggestions() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      // In a real scenario, this would be /opportunities/recommended
      // For now, we'll fetch all and "simulate" recommendations based on some random logic or just show all
      const res = await api.get("/opportunities");
      // Filter for open status ??
      const recommend = res.data.opportunities || res.data; // Handle different potential response structures
      setMatches(Array.isArray(recommend) ? recommend : []);
    } catch (err) {
      console.error("Failed to fetch matches", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/opportunities/${id}/apply`);
      alert("Applied successfully!");
      // Update UI
      setMatches(matches.map(m => m._id === id ? { ...m, applied: true } : m));
    } catch (err) {
      alert("Failed to apply. You may have already applied.");
    }
  };

  const handleChat = (ngoId, e) => {
    e.stopPropagation();
    navigate(`/messages?partner=${ngoId}`);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Recommended Matches"
        subtitle="Opportunities tailored to your location and preferences."
      />

      {loading ? (
        <div className="text-center py-10">Loading recommendations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {matches.map((match) => (
            <div key={match._id} className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-white/50 p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Recycle size={12} /> {match.wasteType || "General Waste"}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${match.status === 'Open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {match.status || 'Active'}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-800 mb-1">{match.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                By {match.ngoName || "Unknown NGO"}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  {match.location}
                </div>
                {/* Distance simulation if we had coords */}
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={(e) => handleApply(match._id, e)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={(e) => handleChat(match.ngoId || match.createdBy, e)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Chat with NGO"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No recommendations found at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
