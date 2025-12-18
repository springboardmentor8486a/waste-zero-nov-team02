import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "./utils/api";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [op, setOp] = useState(null);

  useEffect(() => {
    apiRequest(`/opportunities/${id}`).then(res => setOp(res.data));
  }, [id]);

  const remove = async () => {
    await apiRequest(`/opportunities/${id}`, "DELETE");
    navigate("/opportunities");
  };

  if (!op) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{op.title}</h2>
      <p>{op.description}</p>
      <p className="muted">{op.location} • {op.duration}</p>

      <p><b>Skills:</b> {op.required_skills.join(", ")}</p>

      {role === "ngo" && (
        <button onClick={remove} style={{ background: "red", color: "white" }}>
          Delete
        </button>
      )}
    </div>
  );
}
