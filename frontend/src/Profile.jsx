import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Camera, MapPin, Globe, Phone, Mail, Save, X, User } from "lucide-react";

import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);


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

      return;
    }

    try {
      const token = localStorage.getItem("token");

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

            </div>

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


      </div>

    </div >
  );
};

export default Profile;
