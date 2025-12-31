import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import {
  LayoutDashboard,
  CalendarCheck,
  Leaf,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Edit2
} from "lucide-react";
=======
import { Camera, MapPin, Globe, Phone, Mail, Save, X, User } from "lucide-react";
>>>>>>> Stashed changes
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const [isDark, setIsDark] = useState(localStorage.getItem("dashDark") === "true");
=======
  const fileInputRef = useRef(null);

>>>>>>> Stashed changes
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extended state for NGO fields
  const [editFields, setEditFields] = useState({
    fullName: "",
    location: "",
    skills: "",
    organizationName: "",
    website: "",
    missionStatement: "",
    publicEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "United States"
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Use the "waste-dark-green" (#065f46) and "waste-green" (#00a32a) colors from config
  useEffect(() => {
    const id = "ngo-profile-colors";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
<<<<<<< Updated upstream
      .dash-shell{
        min-height:100vh;
        display:flex;
        color:${isDark ? "#e5e7eb" : "#111827"};
        font-family:'Cause',sans-serif;
        background: url("/image.png") center/cover no-repeat fixed;
      }
      .dash-overlay{
        flex:1;
        display:flex;
        background:${isDark ? "rgba(17,24,39,0.86)" : "rgba(255,255,255,0.9)"};
      }
      .dash-sidebar{
        width:220px;
        background:${isDark ? "#0f172a" : "#ffffff"};
        border-right:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        padding:1rem;
        display:flex;
        flex-direction:column;
        gap:1.2rem;
      }
      .dash-brand{display:flex;align-items:center;gap:.65rem;}
      .dash-brand img{width:38px;height:34px;object-fit:contain;}
      .dash-brand .title{font-weight:800;font-size:1.05rem;}
      .dash-role{font-size:.9rem;opacity:0.8;}
      .dash-nav{display:flex;flex-direction:column;gap:.35rem;}
      .dash-item{
        display:flex;align-items:center;gap:.6rem;
        padding:.65rem .75rem;border-radius:12px;border:1px solid transparent;
        background:transparent;color:inherit;cursor:pointer;transition:.15s;
      }
      .dash-item:hover{background:${isDark ? "#1f2937" : "#f3f4f6"};}
      .dash-item.active{
        background:${isDark ? "#065f46" : "#e8f5ee"};
        color:${isDark ? "#fff" : "#065f46"};
        border-color:${isDark ? "transparent" : "rgba(6,95,70,0.3)"};
      }
      .dash-main{
        flex:1;
        padding:1.5rem 1.8rem 2.5rem;
        overflow:auto;
      }
      .profile-card{
        background:${isDark ? "#0f172a" : "#ffffff"};
        border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        border-radius:14px;
        padding:1.5rem;
        box-shadow:0 10px 30px rgba(0,0,0,0.08);
      }
      .field-card{
        position:relative;
        background:${isDark ? "#111827" : "#f9fafb"};
        border:1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        border-radius:12px;
        padding:1rem 1.1rem;
      }
      .edit-btn{
        position:absolute;
        top:10px;
        right:10px;
        background:transparent;
        border:none;
        color:${isDark ? "#9ca3af" : "#6b7280"};
        cursor:pointer;
      }
      .footer-bar{
        width:100%;
        text-align:center;
        font-size:12px;
        padding:10px 0;
        color:${isDark ? "#e5e7eb" : "#111827"};
      }
=======
       .profile-container {
         background-color: #f3f4f6; /* Light gray background like standard dashboard */
         min-height: 100vh;
         color: #1f2937;
         padding: 2rem;
         font-family: 'Cause', sans-serif;
       }
       .profile-header-title {
         font-size: 1.8rem;
         font-weight: 700;
         margin-bottom: 0.5rem;
         color: #065f46; /* Waste Dark Green */
       }
       .profile-subtitle {
         color: #6b7280;
         font-size: 0.95rem;
         margin-bottom: 2rem;
       }
       .action-buttons {
         display: flex;
         gap: 1rem;
         justify-content: flex-end;
         margin-bottom: 1.5rem;
       }
       .btn-cancel {
         background: white;
         border: 1px solid #d1d5db;
         color: #374151;
         padding: 0.6rem 1.2rem;
         border-radius: 9999px;
         cursor: pointer;
         font-weight: 500;
         transition: all 0.2s;
       }
       .btn-cancel:hover { background: #f9fafb; }
       
       .btn-save {
         background: #065f46; /* Waste Dark Green */
         border: none;
         color: white;
         padding: 0.6rem 1.2rem;
         border-radius: 9999px;
         cursor: pointer;
         font-weight: 600;
         display: flex;
         align-items: center;
         gap: 0.5rem;
         transition: all 0.2s;
       }
       .btn-save:hover { background: #044e39; }
       
       .card {
         background: white;
         border: 1px solid #e5e7eb;
         border-radius: 16px;
         padding: 1.5rem;
         margin-bottom: 1.5rem;
         box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
       }
       .card-title {
         font-size: 1.1rem;
         font-weight: 600;
         margin-bottom: 1.5rem;
         color: #065f46;
         display: flex;
         align-items: center;
         gap: 0.5rem;
         border-bottom: 2px solid #e5e7eb;
         padding-bottom: 0.8rem;
       }
       .logo-section {
         display: flex;
         align-items: center;
         gap: 2rem;
       }
       .logo-circle {
         width: 100px;
         height: 100px;
         border-radius: 50%;
         background: #f0fdf4;
         display: flex;
         align-items: center;
         justify-content: center;
         border: 3px solid #065f46;
         overflow: hidden;
         position: relative;
       }
       .logo-img { width: 100%; height: 100%; object-fit: cover; }
       .logo-actions {
         display: flex;
         gap: 0.75rem;
         margin-top: 1rem;
       }
       .btn-upload {
         background: #065f46;
         color: #fff;
         border: none;
         padding: 0.5rem 1rem;
         border-radius: 8px;
         font-size: 0.9rem;
         cursor: pointer;
         display: flex;
         align-items: center;
         gap: 0.5rem;
       }
       .btn-upload:hover { background: #044e39; }

       .form-grid {
         display: grid;
         grid-template-columns: 1fr 1fr;
         gap: 1.5rem;
       }
       @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

       .form-group {
         margin-bottom: 1.2rem;
       }
       .form-label {
         display: block;
         font-size: 0.85rem;
         color: #4b5563;
         margin-bottom: 0.5rem;
         font-weight: 600;
         text-transform: uppercase;
         letter-spacing: 0.05em;
       }
       .form-input {
         width: 100%;
         background: #f9fafb;
         border: 1px solid #d1d5db;
         color: #1f2937;
         padding: 0.75rem;
         border-radius: 8px;
         font-size: 0.95rem;
         transition: border-color 0.2s;
       }
       .form-input:focus {
         outline: none;
         border-color: #065f46;
         ring: 2px solid #065f46;
       }
       .form-textarea {
         width: 100%;
         background: #f9fafb;
         border: 1px solid #d1d5db;
         color: #1f2937;
         padding: 0.75rem;
         border-radius: 8px;
         font-size: 0.95rem;
         min-height: 120px;
         resize: vertical;
       }
       .char-count {
         text-align: right;
         font-size: 0.75rem;
         color: #6b7280;
         margin-top: 0.3rem;
       }
>>>>>>> Stashed changes
    `;
    return () => {
      if (style) document.head.removeChild(style);
    };
  }, []);

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
          const u = data.user;
          const ngo = u.ngoDetails || {};
          const vol = u.volunteerDetails || {};

          setUserData(u);
          if (u.username) localStorage.setItem("name", u.username);
          if (u.role) localStorage.setItem("role", u.role);

          // Pre-fill edit fields from User + NgoProfile / VolunteerProfile
          setEditFields({
            fullName: u.fullName || u.username || "",
            location: u.location || "",
            skills: Array.isArray(u.skills) ? u.skills.join(", ") : (vol.skills?.join(", ") || ""),

            organizationName: ngo.organizationName || "",
            website: ngo.website || "",
            missionStatement: ngo.missionStatement || vol.bio || "", // Use missionStatement field or bio field interchangeably for UI
            publicEmail: ngo.publicEmail || u.email || "",
            phoneNumber: ngo.phoneNumber || "",
            address: ngo.address || "",
            city: ngo.city || "",
            country: ngo.country || "United States"
          });

          if (ngo.logo && ngo.logo !== 'no-photo.jpg') {
            setLogoPreview(`http://localhost:5000${ngo.logo}`);
          }

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

<<<<<<< Updated upstream
  const navMain = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Schedule Pickup", icon: <CalendarCheck size={18} />, path: "/schedule" },
    { name: "Opportunities", icon: <Leaf size={18} />, path: "/opportunities" },
    { name: "Messages", icon: <MessageSquare size={18} />, path: "/messages" },
    { name: "My Impact", icon: <BarChart3 size={18} />, path: "/impact" },
  ];

  const navSecondary = [
    { name: "My Profile", icon: <User size={18} />, path: "/profile" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
    { name: "Help & Support", icon: <HelpCircle size={18} />, path: "/help" },
  ];

  const isActive = (p) => window.location.pathname === p;
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
=======
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setMessage({ type: "", text: "" });

    // Client-side validation
    if (editFields.website && !/^https?:\/\//.test(editFields.website)) {
      setMessage({ type: "error", text: "Website URL must start with http:// or https://" });
      window.scrollTo(0, 0);
>>>>>>> Stashed changes
      return;
    }

    try {
      const token = localStorage.getItem("token");
<<<<<<< Updated upstream
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


  return (
    <div className="dash-shell">
      <div className="dash-overlay">
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <img src={logo} alt="logo" />
            <div>
              <div className="title">WasteZero</div>
              <div className="dash-role">{role}</div>
=======
      if (!token) {
        navigate("/login");
        return;
      }


      const formData = new FormData();
      // Basic fields
      formData.append('fullName', editFields.fullName);
      formData.append('location', editFields.location);
      formData.append('skills', editFields.skills);

      // NGO fields
      formData.append('organizationName', editFields.organizationName);
      formData.append('website', editFields.website);
      formData.append('missionStatement', editFields.missionStatement);
      formData.append('publicEmail', editFields.publicEmail);
      formData.append('phoneNumber', editFields.phoneNumber);
      formData.append('address', editFields.address);
      formData.append('city', editFields.city);
      formData.append('country', editFields.country);

      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Content-Type must NOT be set when using FormData, browser does it automatically with boundary
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
        setMessage({ type: "success", text: "Profile updated successfully" });
        window.scrollTo(0, 0);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile" });
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while updating profile" });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const isNgo = userData?.role === 'ngo';

  return (
    <div className="profile-container">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {message.text && (
          <div style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            background: message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`
          }}>
            {message.text}
          </div>
        )}

        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="profile-header-title">{isNgo ? 'NGO Profile' : 'Volunteer Profile'}</h1>
            <p className="profile-subtitle">
              {isNgo
                ? "Update your organization's details and public information."
                : "Manage your personal profile and volunteer preferences."}
            </p>
          </div>
          <div className="action-buttons">
            <button className="btn-cancel" onClick={() => navigate(-1)}>
              <X size={18} style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'text-bottom' }} /> Cancel
            </button>
            <button className="btn-save" onClick={saveProfile}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>

        {/* NGO VERSION */}
        {isNgo && (
          <>
            {/* Top Card: Identity & Logo */}
            <div className="card">
              <div className="logo-section">
                <div className="logo-circle">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="logo-img" />
                  ) : (
                    <span style={{ fontSize: '2rem', color: '#065f46', fontWeight: 'bold' }}>
                      {editFields.organizationName.charAt(0) || "Org"}
                    </span>
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.2rem' }}>
                    {editFields.organizationName || "Organization Name"}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    {userData?.email}
                  </p>
                  <div className="logo-actions">
                    <button className="btn-upload" onClick={() => fileInputRef.current.click()}>
                      <Camera size={16} /> Upload New Logo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
>>>>>>> Stashed changes
            </div>
          </div>

<<<<<<< Updated upstream
          <div className="dash-nav">
            {navMain.map((item) => (
              <button
                key={item.name}
                className={`dash-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div className="dash-nav">
            {navSecondary.map((item) => (
              <button
                key={item.name}
                className={`dash-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div
            className="mode-toggle"
            onClick={() => {
              const next = !isDark;
              setIsDark(next);
              localStorage.setItem("dashDark", String(next));
              localStorage.setItem("darkMode", String(next));
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </div>

          <button className="dash-item" onClick={() => navigate("/login")}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <div className="dash-footer">© 2024 WasteZero</div>
        </aside>

        <main className="dash-main">
          {loading ? (
            <div className="profile-card" style={{ textAlign: "center", padding: "2rem" }}>
              <p>Loading profile...</p>
            </div>
          ) : (
            <div className="profile-card">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  Password
                </button>
              </div>

              <h3 className="section-title">Personal Information</h3>
              <p style={{ marginTop: 0, marginBottom: ".8rem", color: isDark ? "#9ca3af" : "#6b7280", fontSize: ".95rem" }}>
                Update your personal information and profile details.
              </p>

              {activeTab === "profile" && (
                <div className="field-cards">
                  {profileFields.map((field) => (
                    <div className="field-card" key={field.label}>
                      <button className="edit-btn" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <div className="field-label">{field.label}</div>
                      <div className="field-value">{field.value}</div>
                    </div>
                  ))}
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
                    <input
                      type="password"
                      className="field-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="field-card">
                    <div className="field-label">New Password</div>
                    <input
                      type="password"
                      className="field-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="field-card">
                    <div className="field-label">Confirm Password</div>
                    <input
                      type="password"
                      className="field-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              )}

              <div className="btn-row">
                <button
                  className="btn primary"
                  onClick={() => {
                    if (activeTab === "password") {
                      handlePasswordChange();
                    }
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="btn ghost"
                  onClick={() => {
                    const next = !isDark;
                    setIsDark(next);
                    localStorage.setItem("dashDark", String(next));
                    localStorage.setItem("darkMode", String(next));
                  }}
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </div>
          )}
        </main>
=======
            {/* Basic Information */}
            <div className="card">
              <div className="card-title">
                <Globe size={20} />
                Basic Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input
                    className="form-input"
                    value={editFields.organizationName}
                    onChange={(e) => setEditFields({ ...editFields, organizationName: e.target.value })}
                    placeholder="e.g. Green Earth Initiative"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input
                    className="form-input"
                    value={editFields.website}
                    onChange={(e) => setEditFields({ ...editFields, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mission Statement</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your organization's mission..."
                  value={editFields.missionStatement}
                  onChange={(e) => setEditFields({ ...editFields, missionStatement: e.target.value })}
                  maxLength={500}
                ></textarea>
                <div className="char-count">{editFields.missionStatement.length}/500 characters</div>
              </div>
            </div>

            {/* Contact and Location */}
            <div className="form-grid">
              <div className="card">
                <div className="card-title">
                  <Phone size={20} />
                  Contact Details
                </div>
                <div className="form-group">
                  <label className="form-label">Public Email</label>
                  <input
                    className="form-input"
                    value={editFields.publicEmail}
                    onChange={(e) => setEditFields({ ...editFields, publicEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    value={editFields.phoneNumber}
                    onChange={(e) => setEditFields({ ...editFields, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-title">
                  <MapPin size={20} />
                  Location
                </div>
                <div className="form-group">
                  <label className="form-label">Headquarters Address</label>
                  <input
                    className="form-input"
                    value={editFields.address}
                    onChange={(e) => setEditFields({ ...editFields, address: e.target.value })}
                    placeholder="123 Eco Friendly Way"
                  />
                </div>
                <div className="form-grid" style={{ marginBottom: 0, gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City</label>
                    <input
                      className="form-input"
                      value={editFields.city}
                      onChange={(e) => setEditFields({ ...editFields, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Country</label>
                    <select
                      className="form-input"
                      value={editFields.country}
                      onChange={(e) => setEditFields({ ...editFields, country: e.target.value })}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VOLUNTEER VERSION (Restored Simple UI) */}
        {!isNgo && (
          <div className="card">
            <div className="card-title">
              <User size={20} />
              Personal Information
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={userData?.username || ""}
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={userData?.email || ""}
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={editFields.fullName}
                  onChange={(e) => setEditFields({ ...editFields, fullName: e.target.value })}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={editFields.location}
                  onChange={(e) => setEditFields({ ...editFields, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us about yourself..."
                value={editFields.missionStatement}
                onChange={(e) => setEditFields({ ...editFields, missionStatement: e.target.value })}
                maxLength={300}
                style={{ minHeight: '100px' }}
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma separated)</label>
              <input
                className="form-input"
                value={editFields.skills}
                onChange={(e) => setEditFields({ ...editFields, skills: e.target.value })}
                placeholder="e.g. Recycling, Logistics, Teaching"
              />
            </div>
          </div>
        )}

>>>>>>> Stashed changes
      </div>

    </div>
  );
};

export default Profile;
