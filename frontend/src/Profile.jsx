import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import ProfileSection from "./components/ProfileSection";

const logo = "/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png";

const Profile = () => {
  const navigate = useNavigate();
  const isDark = false;
  const [activeTab, setActiveTab] = useState("profile");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile Data State
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const id = "profile-inline-styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    // Only profile-specific styles that don't conflict with Dashboard
    style.textContent = `
      .profile-card{background:${isDark ? "#0f172a" : "#ffffff"};border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};border-radius:14px;padding:1.5rem;box-shadow:0 10px 30px rgba(0,0,0,0.08)}
      .field-card{position:relative;background:${isDark ? "#111827" : "#f9fafb"};border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};border-radius:12px;padding:1rem 1.1rem}
      .edit-btn{position:absolute;top:10px;right:10px;background:transparent;border:none;color:${isDark ? "#9ca3af" : "#6b7280"};cursor:pointer}
      .footer-bar{width:100%;text-align:center;font-size:12px;padding:10px 0;color:${isDark ? "#e5e7eb" : "#111827"}}
    `;
  }, [isDark]);

  // Fetch user profile data
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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const role = localStorage.getItem("role") || "volunteer";  // Use lowercase to match 'volunteer'/'ngo' checks
  const name = localStorage.getItem("name") || "User";

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


  const handleProfileUpdate = async (updatedData) => {
    setMessage({ type: "", text: "" });
    setSaveLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Basic fields
      formData.append('fullName', updatedData.name);
      formData.append('email', updatedData.email); // Though email might not be updatable via this endpoint depending on backend, passing it anyway
      formData.append('location', updatedData.location);

      // Skills - pass as array or comma separated? Backend route profile.js: if (skills) user.skills = ...
      // ProfileSection passes skills array.
      if (Array.isArray(updatedData.skills)) {
        updatedData.skills.forEach(skill => formData.append('skills[]', skill)); // or backend expects 'skills' as string?
        // Checking backend profile.js: 
        // user.skills = Array.isArray(skills) ? skills : (skills ? skills.split(...) : [])
        // If multer is used, arrays might be passed differently. Let's send as multiple 'skills' keys or single comma-string.
        // Backend logic seems robust enough for array.
        // Let's try sending as comma-separated string to be safe with partial multipart handling typically.
        formData.append('skills', updatedData.skills.join(','));
      }

      // Role specific fields
      if (role === 'ngo') {
        formData.append('organizationName', updatedData.name);
        formData.append('missionStatement', updatedData.about);
        formData.append('website', updatedData.website);
        // If logo changed
        if (updatedData.avatarFile) {
          formData.append('logo', updatedData.avatarFile);
        }
      } else {
        formData.append('displayName', updatedData.name);
        formData.append('bio', updatedData.about);
        // If avatar changed
        if (updatedData.avatarFile) {
          formData.append('avatar', updatedData.avatarFile);
        }
        // Also map skills to interests if needed? Backend handles user.skills and volunteerProfile.interests separate.
        // Let's assume user.skills is the primary source we are editing.
      }

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Content-Type: multipart/form-data boundary is set automatically by browser
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
        if (data.user.username) localStorage.setItem("name", data.user.username);
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while updating profile" });
    } finally {
      setSaveLoading(false);
    }
  };


  return (
    <div className="profile-shell">
      <div className="profile-card">
        <div className="profile-header">
          <img src={logo} alt="logo" className="profile-logo" />
          <div>
            <h1 className="profile-title">Profile Settings</h1>
            <p className="profile-sub">{role.charAt(0).toUpperCase() + role.slice(1)} Account</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Details
              </button>
              <button
                className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Security
              </button>
            </div>

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

            {activeTab === "profile" && (
              <div className="animate-in fade-in duration-300">
                <ProfileSection
                  userData={userData}
                  role={role}
                  onUpdate={handleProfileUpdate}
                  loading={saveLoading}
                />
              </div>
            )}

            {activeTab === "password" && (
              <div className="field-cards max-w-xl mx-auto mt-8">
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
                <div className="btn-row justify-end mt-4">
                  <button className="btn primary" onClick={handlePasswordChange}>Update Password</button>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
