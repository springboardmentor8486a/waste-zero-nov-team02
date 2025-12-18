import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, subtitle }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 rounded-lg text-sm font-medium
                   bg-gray-100
                   text-gray-800
                   hover:bg-gray-200
                   transition"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
