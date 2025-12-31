import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import PageHeader from "./components/PageHeader";
import api, { apiRequest } from "./utils/api";

const SAMPLE = [
  {
    id: "1",
    title: "City Park Cleanup Drive",
    short: "Join us to clear litter and plant new saplings in the park.",
    date: "2024-01-15",
    time: "09:00",
    location: "Central City Park",
    capacity: 20,
    registered_count: 15,
    status: "open",
    cover: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title: "Beach Cleanup & Recycling",
    short: "Help us remove plastic waste from the shoreline and sort it for recycling.",
    date: "2024-02-10",
    time: "08:30",
    location: "Brighton Beach",
    capacity: 50,
    registered_count: 12,
    status: "open",
    cover: "https://images.unsplash.com/photo-1618477461853-5f8dd1dbab9a?auto=format&fit=crop&w=800&q=80"
  }
];

export default function Opportunities() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname || "/opportunities";
  const role = localStorage.getItem("role") || "volunteer";

  const [items, setItems] = useState(SAMPLE);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ visible: false, text: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [locationSearch, setLocationSearch] = useState("");
  // Updated regex to ensure we don't double the /api part if baseURL has it
  const uploadsBase = api.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : (window.location?.origin || '');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiRequest("/opportunities")
      .then((res) => {
        if (!mounted) return;
        let data = res?.data ?? res ?? [];

        // Force premium images for demo purposes (as requested by user)
        if (Array.isArray(data)) {
          data = data.map(item => {
            if (item.title && item.title.toLowerCase().includes("beach")) {
              return { ...item, cover: "https://images.unsplash.com/photo-1618477461853-5f8dd1dbab9a?auto=format&fit=crop&w=1200&q=80" };
            }
            if (item.title && (item.title.toLowerCase().includes("park") || item.title.toLowerCase().includes("cleanup"))) {
              return { ...item, cover: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=1200&q=80" };
            }
            // Fallback for others to a generic nature cleanup image if no cover
            if (!item.cover) {
              return { ...item, cover: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80" };
            }
            return item;
          });
        }

        // Merge sample data if API returns empty, just for demo purposes if needed, OR just use API.
        // For this user request, we want to ensure the sample images show up if they are using sample data.
        if (Array.isArray(data) && data.length) setItems(data);
        else setItems(SAMPLE);
      })
      .catch(() => {
        setError("");
      })
      .finally(() => mounted && setLoading(false));

    apiRequest('/profile')
      .then(r => {
        if (!mounted) return;
        const u = r?.user ?? r ?? null;
        if (u && Array.isArray(u.skills)) setUserSkills(u.skills);
      })
      .catch(() => { });

    return () => (mounted = false);
  }, []);

  const showToast = (text, ms = 3000) => {
    setToast({ visible: true, text });
    setTimeout(() => setToast({ visible: false, text: "" }), ms);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/opportunities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.success) {
        setItems(prev => prev.filter(o => (o._id || o.id) !== id));
        showToast("Deleted successfully");
      } else {
        if (!res.data.success) {
          console.warn("Delete reported failure:", res.data);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Delete failed. Please try again.");
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  // Create route
  if (pathname.endsWith("/new")) {
    return (
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-10 border border-white/50">
          <PageHeader title="Create Opportunity" subtitle="Create a new volunteering opportunity." />
          <OpportunityForm
            showToast={showToast}
            onSave={async (data) => {
              try {
                if (data && data.isFormData && data.formData) {
                  const res = await api.post('/opportunities', data.formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  const created = res?.data ?? null;
                  if (created) setItems((prev) => [created, ...prev]);
                  else setItems((prev) => [{ ...data, id: String(Date.now()) }, ...prev]);
                } else {
                  const res = await apiRequest("/opportunities", "POST", data);
                  const created = res?.data ?? res ?? null;
                  if (created) setItems((prev) => [created, ...prev]);
                  else setItems((prev) => [{ ...data, id: String(Date.now()) }, ...prev]);
                }
                showToast("Opportunity saved");
                navigate("/opportunities");
              } catch (e) {
                setItems((prev) => [{ ...data, id: String(Date.now()) }, ...prev]);
                showToast("Saved locally (offline)");
                navigate("/opportunities");
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Edit route
  if (pathname.includes("/edit/")) {
    const id = pathname.split("/edit/")[1];
    const existing = items.find((it) => String(it._id || it.id) === String(id)) || {};
    return (
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-10 border border-white/50">
          <PageHeader title="Edit Opportunity" subtitle="Update opportunity details." />
          <OpportunityForm
            initialData={existing}
            showToast={showToast}
            onSave={async (data) => {
              try {
                if (data && data.isFormData && data.formData) {
                  const res = await api.put(`/opportunities/${id}`, data.formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  const updated = res?.data ?? null;
                  if (updated) setItems((prev) => prev.map((it) => (String(it._id || it.id) === String(id) ? updated : it)));
                } else {
                  const res = await apiRequest(`/opportunities/${id}`, "PUT", data);
                  const updated = res?.data ?? res ?? null;
                  if (updated) setItems((prev) => prev.map((it) => (String(it._id || it.id) === String(id) ? updated : it)));
                }
                showToast("Opportunity updated");
                navigate("/opportunities");
              } catch (e) {
                setItems((prev) => prev.map((it) => (String(it._id || it.id) === String(id) ? { ...it, ...data } : it)));
                showToast("Updated locally (offline)");
                navigate("/opportunities");
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {toast.visible && (
          <div className="fixed top-10 right-10 z-[100] animate-bounce-in">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-emerald-500">
              <span className="text-xl">✨</span> {toast.text}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight mb-2">Opportunities</h1>
            <p className="text-lg text-white/90 font-normal drop-shadow-md">Browse and manage volunteering opportunities making a real impact.</p>
          </div>
          {role === "ngo" && (
            <button
              onClick={() => navigate("/opportunities/new")}
              className="bg-green-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-green-600 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <span className="text-xl">+</span> Create Event
            </button>
          )}
        </div>

        {/* Premium Glass Location Filter */}
        <div className="mb-10">
          <div className="relative max-w-lg group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-green-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Filter by location (e.g. City, Street)..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="block w-full pl-12 pr-6 py-4 border-2 border-white/20 rounded-[24px] text-lg bg-white/90 backdrop-blur-xl placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-white text-gray-900 font-bold shadow-xl transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32 bg-white/20 backdrop-blur-md rounded-[32px] border border-white/20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white font-bold text-lg animate-pulse uppercase tracking-widest">Loading Events...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items
              .filter(it =>
                !locationSearch ||
                (it.location && it.location.toLowerCase().includes(locationSearch.toLowerCase()))
              )
              .map((it) => (
                <div key={it._id || it.id} className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/60 overflow-hidden flex flex-col group h-full">
                  {/* Image Area */}
                  <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                    {it.cover ? (
                      <img
                        src={(it.cover && it.cover.startsWith('/uploads')) ? uploadsBase + it.cover : it.cover}
                        alt={it.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <div className="text-white/50 transform rotate-12 font-black text-6xl select-none opacity-20">EVENT</div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-green-700 shadow-lg uppercase tracking-wider">
                      {it.registered_count || 0} / {it.capacity || '∞'} Vols
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-100">
                        {it.date ? new Date(it.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date TBD'}
                      </div>
                      <div className="text-gray-400 text-xs font-bold">{it.time}</div>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-green-700 transition-colors">{it.title}</h3>

                    <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {it.location}
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">{it.short}</p>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4">
                        {role === "volunteer" ? (() => {
                          const required = Array.isArray(it.required_skills) ? it.required_skills : [];
                          const matches = required.filter(rs => userSkills.includes(rs));
                          const pct = required.length ? (matches.length / required.length) : 0;
                          const canApplyBySkill = required.length === 0 || matches.length > 0;
                          const capacityFull = it.capacity != null && (it.registered_count || 0) >= it.capacity;
                          const disabled = capacityFull || !canApplyBySkill;
                          return (
                            <div className="flex-1 flex gap-3 items-center">
                              <button
                                onClick={async () => {
                                  if (!canApplyBySkill) { showToast('Missing required skills'); return; }
                                  if (capacityFull) { showToast('Event Full'); return; }
                                  try {
                                    await apiRequest("/applications", "POST", { opportunity_id: it._id || it.id });
                                    setItems(prev => prev.map(x => (String(x._id || x.id) === String(it._id || it.id) ? { ...x, registered_count: (x.registered_count || 0) + 1 } : x)));
                                    showToast('Registration Successful! 🎉');
                                  } catch (e) {
                                    showToast(e.message || 'Failed to apply');
                                  }
                                }}
                                disabled={disabled}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-green-200/50 hover:-translate-y-1'}`}
                              >
                                {capacityFull ? 'Full' : 'Join Event'}
                              </button>
                              {required.length > 0 && pct > 0 && (
                                <div className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                  {Math.round(pct * 100)}% Match
                                </div>
                              )}
                            </div>
                          );
                        })() : (
                          <div className="flex items-center gap-3">
                            <button onClick={() => navigate(`/opportunities/edit/${it._id || it.id}`)} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-md hover:shadow-lg">
                              <Edit2 size={20} />
                            </button>
                            <button onClick={() => setConfirmDelete({ open: true, id: it._id || it.id })} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-md hover:shadow-lg">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
          </div>
        )}

        {confirmDelete.open && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold">Confirm deletion</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete this opportunity? This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setConfirmDelete({ open: false, id: null })} className="px-4 py-2 rounded bg-gray-100 text-gray-700 !text-gray-700 font-bold hover:bg-gray-200">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2 rounded bg-red-600 text-white !text-white font-bold hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityForm({ initialData = {}, onSave, showToast }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.short || "");
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData.time || new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState(initialData.location || "");
  const [skills, setSkills] = useState(initialData.required_skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [capacity, setCapacity] = useState(initialData.capacity ?? "");
  const [coverFile, setCoverFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  // Fixed api base logic inside component not available typically unless context used or passed, 
  // but simpler to reuse logic or just assume relative path if on same domain.
  // We'll regenerate it here or pass it if critical. For preview, minimal logic:
  const previewBase = api.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : (window.location?.origin || '');

  useEffect(() => {
    setTitle(initialData.title || "");
    setDescription(initialData.short || "");
    setDate(initialData.date || new Date().toISOString().split('T')[0]);
    setTime(initialData.time || new Date().toTimeString().slice(0, 5));
    setLocation(initialData.location || "");
    setSkills(initialData.required_skills || []);
    setCapacity(initialData.capacity ?? "");
    setCoverFile(null);
    setAttachments([]);
  }, [initialData._id || 'new']);

  const addSkill = () => {
    const s = (skillInput || "").trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));

  const onSkillKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const base = { title, short: description, date, time, location, required_skills: skills, capacity: capacity === "" ? undefined : Number(capacity) };

    if (coverFile || (attachments && attachments.length)) {
      if (coverFile) {
        if (!/image\//.test(coverFile.type)) {
          if (showToast) showToast('Cover must be an image file');
          return;
        }
        if (coverFile.size > 5 * 1024 * 1024) {
          if (showToast) showToast('Cover image must be <= 5MB');
          return;
        }
      }
      for (const f of attachments || []) {
        if (f.size > 10 * 1024 * 1024) {
          if (showToast) showToast('Each attachment must be <= 10MB');
          return;
        }
        const ok = /image\//.test(f.type) || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'text/plain'].includes(f.type) || f.type.includes('presentation');
        if (!ok) {
          if (showToast) showToast('One or more attachments have unsupported type');
          return;
        }
      }
      const fd = new FormData();
      Object.keys(base).forEach((k) => {
        // Fix for arrays: typically we append arrays as string or loop.
        // For skills, send as comma separated or loop.
        // Backend handles comma separated string.
        if (k === 'required_skills' && Array.isArray(base[k])) {
          fd.append(k, base[k].join(','));
        } else if (base[k] !== undefined && base[k] !== null) {
          fd.append(k, base[k]);
        }
      });
      if (coverFile) fd.append('cover', coverFile);
      attachments.forEach((f) => fd.append('attachments', f));
      if (onSave) onSave({ isFormData: true, formData: fd });
      return;
    }

    if (onSave) onSave(base);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <label className="block">
        <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Title</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-lg outline-none" placeholder="e.g. Park Cleanup" />
      </label>

      <label className="block">
        <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Short Description</div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-base outline-none resize-none" placeholder="Briefly describe the event..." />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Date</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all outline-none" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Time</div>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all outline-none" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Location</div>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Central Park" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all outline-none" />
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Volunteers Required</div>
        <input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all outline-none" placeholder="e.g. 20" />
      </div>

      <div>
        <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Required Skills</div>
        <div className="flex gap-3 items-center mb-3">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={onSkillKey} placeholder="Add a skill..." className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500/50 transition-all outline-none" />
          <button type="button" onClick={addSkill} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md transform hover:scale-105 active:scale-95">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <div key={s} className="px-4 py-2 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 font-bold border border-green-100">
              <span className="text-sm">{s}</span>
              <button type="button" onClick={() => removeSkill(s)} className="text-green-600 hover:text-red-500 transition-colors">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cover Image</div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-white hover:border-green-500 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> cover</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files[0] || null)} />
          </label>
          {initialData.cover && !coverFile && (
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">Current: <img src={(initialData.cover && initialData.cover.startsWith('/uploads')) ? (previewBase + initialData.cover) : initialData.cover} alt="cover" className="h-10 w-10 rounded object-cover" /></div>
          )}
          {coverFile && <div className="text-xs text-green-600 font-bold mt-2">Selected: {coverFile.name}</div>}
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Attachments</div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-white hover:border-green-500 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Upload docs/images</span></p>
            </div>
            <input type="file" multiple className="hidden" onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
          </label>
          {initialData.attachments && initialData.attachments.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">{initialData.attachments.length} existing file(s)</div>
          )}
          {attachments.length > 0 && <div className="text-xs text-green-600 font-bold mt-2">{attachments.length} files selected</div>}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
        <button type="button" onClick={() => window.history.back()} className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
        <button type="submit" className="px-10 py-3 rounded-2xl bg-green-500 text-white font-black shadow-lg hover:bg-green-600 hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all transform active:scale-95 text-lg">
          Save Opportunity
        </button>
      </div>
    </form>


  );
}
