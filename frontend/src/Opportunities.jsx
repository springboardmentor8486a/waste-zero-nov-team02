import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./utils/api";
import PageHeader from "./components/PageHeader";

export default function Opportunities() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/opportunities")
      .then(res => setList(res.data || []))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">
        
        <PageHeader
          title="Opportunities"
          subtitle="Available volunteering opportunities."
        />

        {role === "ngo" && (
          <button
            onClick={() => navigate("/opportunities/new")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Opportunity
          </button>
        )}

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        {list.length === 0 && !error && (
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            No opportunities yet.
          </p>
        )}

        <div className="space-y-4 mt-6">
          {list.map(op => (
            <OpportunityCard
              key={op._id}
              id={op._id}
              title={op.title}
              location={op.location}
              duration={op.duration}
              role={role}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ id, title, location, duration, role, navigate }) {
  // Handlers for role-specific actions
  const apply = () => {
    // Example: call API to apply
    apiRequest("/applications", "POST", { opportunity_id: id })
      .then(() => alert("Applied successfully"))
      .catch(err => alert(err.message));
  };

  const viewApplications = () => {
    navigate(`/opportunities/${id}/applications`);
  };

  const closeOpportunity = () => {
    apiRequest(`/opportunities/${id}`, "PUT", { status: "closed" })
      .then(() => alert("Opportunity closed"))
      .catch(err => alert(err.message));
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {location || "Location: Not specified"} • {duration || "Duration: N/A"}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => navigate(`/opportunities/${id}`)}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          View
        </button>

        {role === "volunteer" && (
          <button
            onClick={apply}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply
          </button>
        )}

        {role === "ngo" && (
          <button
            onClick={viewApplications}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            View Applications
          </button>
        )}

        {role === "admin" && (
          <button
            onClick={closeOpportunity}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
