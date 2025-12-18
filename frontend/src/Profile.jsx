import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import "./Profile.css";

const logo = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

const Profile = () => {
  const navigate = useNavigate();
  const isDark = false;
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ fullName: "", location: "", skills: "" });

  useEffect(() => {
    const id = "profile-inline-styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      .dash-shell{min-height:100vh;display:flex;color:${isDark ? "#e5e7eb" : "#111827"};font-family:'Cause',sans-serif;background:url("/image.png") center/cover no-repeat fixed;}
      .dash-overlay{flex:1;display:flex;background:${isDark ? "rgba(17,24,39,0.86)" : "rgba(255,255,255,0.9)"};}
      /* collapsed by default; expand on hover to match Dashboard behavior */
      .dash-sidebar{width:72px;background:${isDark ? "#0f172a" : "#ffffff"};border-right:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};padding:1rem;display:flex;flex-direction:column;gap:.9rem;transition:width .18s;overflow:hidden}
      .dash-sidebar:hover{width:220px}
      .dash-brand{display:flex;gap:.6rem;align-items:center;}
      .dash-brand img{width:34px;height:32px;}
      .dash-role{font-size:.85rem;opacity:.7}
      .dash-section{font-size:.7rem;text-transform:uppercase;opacity:.6;margin:.6rem .3rem .2rem}
      .dash-item{display:flex;align-items:center;gap:.6rem;padding:.6rem .75rem;border-radius:10px;cursor:pointer}
      .dash-item:hover{background:#f3f4f6}
      .dash-item.active{background:#e8f5ee;color:#065f46}
      .dash-main{flex:1;padding:1.5rem 1.8rem;overflow:auto}
      .dash-top{display:flex;gap:1rem;align-items:center;margin-bottom:1.2rem}
      .search{flex:1;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb;background:#fff}
      .avatar{width:36px;height:36px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
      .dash-item .label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .dash-sidebar .label{display:none}
      .dash-sidebar:hover .label{display:inline}
      .dash-sidebar .dash-role{display:none}
      .dash-sidebar:hover .dash-role{display:block}
      .dash-sidebar .dash-brand div{display:none}
      .dash-sidebar:hover .dash-brand div{display:block}
      .dash-sidebar .dash-section{display:none}
      .dash-sidebar:hover .dash-section{display:block}
      /* profile specific styles */
      .profile-card{background:${isDark ? "#0f172a" : "#ffffff"};border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};border-radius:14px;padding:1.5rem;box-shadow:0 10px 30px rgba(0,0,0,0.08)}
      .field-card{position:relative;background:${isDark ? "#111827" : "#f9fafb"};border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};border-radius:12px;padding:1rem 1.1rem}
      .edit-btn{position:absolute;top:10px;right:10px;background:transparent;border:none;color:${isDark ? "#9ca3af" : "#6b7280"};cursor:pointer}
      .footer-bar{width:100%;text-align:center;font-size:12px;padding:10px 0;color:${isDark ? "#e5e7eb" : "#111827"}}
    `;
  }, [isDark]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUserData(data.user);
          // Update localStorage with latest user data
          if (data.user.username) localStorage.setItem("name", data.user.username);
          if (data.user.role) localStorage.setItem("role", data.user.role);
        } else {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const role = localStorage.getItem("role") || "Admin";
  const name = localStorage.getItem("name") || "User";

  const profileFields = [
    { label: "Full Name", value: userData?.fullName || userData?.username || "Not set" },
    { label: "Email", value: userData?.email || "Not set" },
    { label: "Location", value: userData?.location || "Not set" },
    { label: "Skills", value: Array.isArray(userData?.skills) && userData.skills.length > 0 ? userData.skills.join(", ") : "Not set" },
  ];

  const handlePasswordChange = async () => {
    setMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    }
  };

  const startEdit = () => {
    setEditFields({
      fullName: userData?.fullName || userData?.username || "",
      location: userData?.location || "",
      skills: Array.isArray(userData?.skills) ? userData.skills.join(", ") : (userData?.skills || "")
    });
    setEditing(true);
    setMessage({ type: "", text: "" });
  };

  const saveProfile = async () => {
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        fullName: editFields.fullName,
        location: editFields.location,
        skills: editFields.skills
      };

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
        if (data.user.username) localStorage.setItem("name", data.user.username);
        setMessage({ type: "success", text: "Profile updated successfully" });
        setEditing(false);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while updating profile" });
    }
  };


  return (
    <div className="profile-shell">
      <div className="profile-card">
        <div className="profile-header">
          <img src={logo} alt="logo" className="profile-logo" />
          <div>
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-sub">{role}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
              <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>Password</button>
            </div>

            <h3 className="section-title">Personal Information</h3>
            <p style={{ marginTop: 0, marginBottom: ".8rem", color: "#6b7280", fontSize: ".95rem" }}>
              Update your personal information and profile details.
            </p>

            {activeTab === "profile" && (
              <div className="field-cards">
                {!editing && (
                  <div style={{ marginBottom: 12 }}>
                    <button className="btn" onClick={startEdit} style={{ padding: '0.5rem 0.75rem' }}>
                      <Edit2 size={14} style={{ marginRight: 8 }} /> Edit Profile
                    </button>
                  </div>
                )}

                {editing ? (
                  <div style={{ display: 'grid', gap: '.8rem' }}>
                    <div className="field-card">
                      <div className="field-label">Full Name</div>
                      <input value={editFields.fullName} onChange={(e) => setEditFields({ ...editFields, fullName: e.target.value })} className="field-input" />
                    </div>
                    <div className="field-card">
                      <div className="field-label">Location</div>
                      <input value={editFields.location} onChange={(e) => setEditFields({ ...editFields, location: e.target.value })} className="field-input" />
                    </div>
                    <div className="field-card">
                      <div className="field-label">Skills (comma separated)</div>
                      <input value={editFields.skills} onChange={(e) => setEditFields({ ...editFields, skills: e.target.value })} className="field-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '.6rem' }}>
                      <button className="btn primary" onClick={saveProfile}>Save</button>
                      <button className="btn" onClick={() => { setEditing(false); setMessage({ type: '', text: '' }); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  profileFields.map((field) => (
                    <div className="field-card" key={field.label}>
                      <div className="field-label">{field.label}</div>
                      <div className="field-value">{field.value}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "password" && (
              <div className="field-cards">
                {message.text && (
                  <div style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    background: message.type === "success" ? "#d1fae5" : "#fee2e2",
                    color: message.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${message.type === "success" ? "#6ee7b7" : "#fca5a5"}`
                  }}>
                    {message.text}
                  </div>
                )}
                <div className="field-card">
                  <div className="field-label">Current Password</div>
                  <input type="password" className="field-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                </div>
                <div className="field-card">
                  <div className="field-label">New Password</div>
                  <input type="password" className="field-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                </div>
                <div className="field-card">
                  <div className="field-label">Confirm Password</div>
                  <input type="password" className="field-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
              </div>
            )}

            <div className="btn-row">
              <button className="btn primary" onClick={() => { if (activeTab === "password") { handlePasswordChange(); } else if (activeTab === "profile") { saveProfile(); } }}>Save Changes</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
