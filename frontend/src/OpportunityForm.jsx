import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./utils/api";

export default function OpportunityForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    required_skills: ""
  });

  const navigate = useNavigate();

  const submit = async () => {
    await apiRequest("/opportunities", "POST", {
      ...form,
      required_skills: form.required_skills.split(",").map(s => s.trim())
    });
    navigate("/opportunities");
  };

  return (
    <div className="card">
      <h2 className="card-title">Create Opportunity</h2>

      {Object.keys(form).map(key => (
        <input
          key={key}
          placeholder={key.replace("_", " ")}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          style={{ display: "block", marginBottom: ".6rem", width: "100%" }}
        />
      ))}

      <button onClick={submit}>Create</button>
    </div>
  );
}
