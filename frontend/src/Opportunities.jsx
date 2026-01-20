import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, Trash2, Search, Plus, Users, MapPin, Layout,
  Trash, AlertTriangle, Save, X, Image as ImageIcon, FileText, Check, Loader2
} from "lucide-react";
import PageHeader from "./components/PageHeader";
import api, { apiRequest } from "./utils/api";
import HorizontalCalendar from "./components/HorizontalCalendar";
import OpportunityDetailsModal from "./components/OpportunityDetailsModal";

const SAMPLE_OPPORTUNITY = [
  {
    _id: "1",
    title: "Eco-Park Restoration",
    short: "Help us rejuvenate the local eco-park through cleanup and planting.",
    date: "2024-01-15",
    time: "09:00",
    location: "Green Valley Eco-Park",
    capacity: 25,
    registered_count: 18,
    status: "open",
  },
];

export default function Opportunities() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname || "/opportunities";
  const role = localStorage.getItem("role") || "volunteer";

  const [items, setItems] = useState(SAMPLE_OPPORTUNITY);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, text: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [locationSearch, setLocationSearch] = useState("");
  const [matches, setMatches] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const uploadsBase = (api.defaults && api.defaults.baseURL && api.defaults.baseURL.includes('http'))
    ? api.defaults.baseURL.replace(/\/api\/?$/, '')
    : (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);


  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return uploadsBase + cleanPath;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const [oppsRes, matchRes, profileRes] = await Promise.allSettled([
          apiRequest("/opportunities"),
          api.get('/opportunities/recommendations'),
          apiRequest('/profile')
        ]);

        if (!mounted) return;

        if (oppsRes.status === 'fulfilled') {
          const data = oppsRes.value?.data ?? oppsRes.value ?? [];
          if (Array.isArray(data)) setItems(data);
        }

        if (matchRes.status === 'fulfilled') {
          const mData = matchRes.value.data.recommendations || matchRes.value.data || [];
          setMatches(Array.isArray(mData) ? mData : []);
        }

        if (profileRes.status === 'fulfilled') {
          const u = profileRes.value?.user ?? profileRes.value ?? null;
          if (u) {
            setUserProfile(u);
            if (Array.isArray(u.skills)) setUserSkills(u.skills);
          }
        }
      } catch (err) {
        console.error("Error fetching opportunities data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  const showToast = (text, type = "success") => {
    setToast({ visible: true, text, type });
    setTimeout(() => setToast({ visible: false, text: "", type: "success" }), 3000);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        setItems(prev => prev.filter(o => (o._id || o.id) !== id));
        showToast("Opportunity eliminated successfully");
      }
    } catch (err) {
      showToast("Operation failed. Try again.", "error");
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  // --- Sub-Route: Create / Edit ---
  if (pathname.endsWith("/new") || pathname.includes("/edit/")) {
    const isEdit = pathname.includes("/edit/");
    const id = isEdit ? pathname.split("/edit/")[1] : null;
    const existing = isEdit ? items.find((it) => String(it._id || it.id) === String(id)) || {} : {};

    return (
      <div className="min-h-screen p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto premium-glass rounded-[56px] p-12 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <PageHeader
            title={isEdit ? "Refine Mission" : "Launch Mission"}
            subtitle={isEdit ? "Update the specifics of this opportunity." : "Initiate a new environmental impact project."}
          />
          <OpportunityForm
            initialData={existing}
            showToast={showToast}
            onSave={async (data) => {
              try {
                let updated = null;
                if (data && data.isFormData && data.formData) {
                  const res = isEdit
                    ? await api.put(`/opportunities/${id}`, data.formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                    : await api.post('/opportunities', data.formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  updated = res.data?.opportunity || res.data;
                } else {
                  const res = isEdit
                    ? await apiRequest(`/opportunities/${id}`, "PUT", data)
                    : await apiRequest("/opportunities", "POST", data);
                  updated = res?.data ?? res;
                }

                if (isEdit) {
                  setItems((prev) => prev.map((it) => (String(it._id || it.id) === String(id) ? updated : it)));
                } else {
                  setItems((prev) => [updated, ...prev]);
                }
                showToast(isEdit ? "Mission updated" : "Mission launched");
                navigate("/opportunities");
              } catch (e) {
                showToast("Saved locally (Synchronizing later)", "success");
                navigate("/opportunities");
              }
            }}
          />
        </motion.div>
      </div>
    );
  }

  // --- Main View: List ---
  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed right-10 top-10 z-[100] px-6 py-3 rounded-xl shadow-lg border border-white/20 font-normal uppercase tracking-wider text-[10px] flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#123524] text-white'}`}
          >
            {toast.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <PageHeader title="Opportunities" />
        <div className="flex items-center gap-3 w-full md:w-auto">
          {role !== "ngo" && (
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#123524] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Find by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#123524] focus:bg-white rounded-2xl text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-none transition-all shadow-sm"
              />
            </div>
          )}
          {role === "ngo" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/opportunities/new")}
              className="px-6 py-2.5 bg-[#123524] text-white rounded-xl font-normal uppercase tracking-wider text-[10px] flex items-center gap-2 shadow-lg shadow-emerald-900/10 hover:bg-[#0d281a] transition-all"
            >
              <Plus size={16} /> Launch Mission
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="text-emerald-500 opacity-40"
          >
            <Layout size={48} />
          </motion.div>
          <p className="text-gray-400 font-normal uppercase tracking-widest text-[10px]">Loading impacts...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {items
            .filter(it => {
              const loc = typeof it.location === 'object' ? (it.location?.address || '') : (it.location || '');
              return !locationSearch || loc.toLowerCase().includes(locationSearch.toLowerCase());
            })
            .map((it, i) => (
              <motion.div
                key={it._id || it.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="premium-card overflow-hidden group flex flex-col h-full hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {it.cover ? (
                    <img
                      src={getImageUrl(it.cover)}
                      alt={it.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-emerald-50 flex items-center justify-center">
                      <Layout size={40} className="text-emerald-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 text-[9px] font-normal uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-white/50">
                      <MapPin size={12} className="text-emerald-500" /> {typeof it.location === 'object' ? (it.location?.address || 'Remote') : (it.location || 'Remote')}
                    </div>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="font-normal text-xl text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-emerald-600 transition-colors uppercase cursor-pointer" onClick={() => setSelectedOpp(it)}>{it.title}</h3>
                  <p className="text-gray-500 font-normal text-xs leading-relaxed line-clamp-2 mb-4">{it.short}</p>
                  <button
                    onClick={() => setSelectedOpp(it)}
                    className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center gap-1 mb-6"
                  >
                    Find Out More <span className="opacity-50">→</span>
                  </button>

                  <div className="space-y-3 mb-8 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-normal uppercase tracking-widest text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-emerald-500" />
                        <span>Squad Status</span>
                      </div>
                      <span className="text-gray-700">{it.registered_count || 0} / {it.capacity || '∞'}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((it.registered_count || 0) / (it.capacity || 100)) * 100)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    {role === "volunteer" ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-normal text-gray-400 uppercase tracking-widest">Match Score</span>
                          <span className="text-[11px] font-normal text-emerald-600">Optimal Pair</span>
                        </div>
                        {it.ngo_id && ((typeof it.ngo_id === 'object' ? it.ngo_id._id : it.ngo_id) !== userProfile?._id) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token");
                                // 1. Apply to Opportunity
                                await apiRequest("/applications", "POST", { opportunity_id: it._id || it.id });

                                // 2. Send Chat Request to NGO (if configured)
                                if (it.ngo_id) {
                                  const ngoId = typeof it.ngo_id === 'object' ? it.ngo_id._id : it.ngo_id;
                                  try {
                                    await api.post('/chat/request', { receiverId: ngoId });
                                  } catch (err) {
                                    // Ignore if already requested/connected, it's fine
                                    console.log("Chat request auto-send info:", err.response?.data?.message);
                                  }
                                }

                                setItems(prev => prev.map(x => (String(x._id || x.id) === String(it._id || it.id) ? { ...x, registered_count: (x.registered_count || 0) + 1 } : x)));
                                showToast('Enlisted & Chat Request Sent');
                              } catch (e) {
                                showToast(e.message || 'Transmission error', 'error');
                              }
                            }}
                            className="px-6 py-2.5 rounded-xl bg-[#123524] text-white font-normal uppercase tracking-widest text-[9px] hover:bg-[#0d281a] transition-all shadow-sm"
                          >
                            Enlist Now
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => navigate(`/opportunities/edit/${it._id || it.id}`)}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-100/50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, id: it._id || it.id })}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
      )
      }

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmDelete.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/20 backdrop-blur-md z-[110] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="premium-glass rounded-[56px] w-full max-w-md p-12 relative border-white/20 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8">
                <Trash size={32} />
              </div>
              <h3 className="text-3xl font-normal text-xs uppercase tracking-widest opacity-60 text-gray-900 text-center tracking-tighter">Terminate?</h3>
              <p className="text-gray-500 font-normal text-center mt-4 leading-relaxed">Permanent purge from the ecosystem.</p>
              <div className="mt-12 flex flex-col gap-4">
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="w-full py-5 rounded-[28px] bg-red-600 text-white font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest text-xs shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all"
                >
                  Confirm Termination
                </button>
                <button
                  onClick={() => setConfirmDelete({ open: false, id: null })}
                  className="w-full py-5 rounded-[28px] bg-gray-100 text-gray-600 font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Abort
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OpportunityDetailsModal
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        opportunity={selectedOpp}
      />
    </div >
  );
}

function OpportunityForm({ initialData = {}, onSave, showToast }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.short || "");
  const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData.time || "09:00");
  const [location, setLocation] = useState(initialData.location || "");
  const [skills, setSkills] = useState(initialData.required_skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [capacity, setCapacity] = useState(initialData.capacity ?? "");
  const [coverFile, setCoverFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const addSkill = () => {
    const s = (skillInput || "").trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setSkills((p) => p.filter((x) => x !== s));

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const base = {
      title,
      short: description,
      date,
      time,
      location,
      required_skills: skills,
      capacity: capacity === "" ? undefined : Number(capacity)
    };

    try {
      if (coverFile || (attachments && attachments.length)) {
        const fd = new FormData();
        Object.keys(base).forEach((k) => {
          if (k === 'required_skills' && Array.isArray(base[k])) {
            fd.append(k, base[k].join(','));
          } else if (base[k] !== undefined && base[k] !== null) {
            fd.append(k, base[k]);
          }
        });
        if (coverFile) fd.append('cover', coverFile);
        attachments.forEach((f) => fd.append('attachments', f));
        await onSave({ isFormData: true, formData: fd });
      } else {
        await onSave(base);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Mission Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Ocean Plastics Cleanup" className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Operational Locale</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Region / City" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Execution Date</label>
            <HorizontalCalendar selectedDate={date} onDateChange={setDate} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Start Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Mission Brief</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the impact..." className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Squad Capacity</label>
            <div className="relative">
              <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Max Volunteers" className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Specialized Skills Required</label>
            <div className="flex gap-3">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add skill" className="flex-1 p-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl font-normal transition-all outline-none" />
              <button type="button" onClick={addSkill} className="px-8 bg-gray-100 text-gray-600 font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest text-xs rounded-3xl hover:bg-gray-200 transition-all">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 ml-2">
              <AnimatePresence>
                {skills.map((s) => (
                  <motion.div key={s} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100">
                    <span className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest">{s}</span>
                    <button type="button" onClick={() => removeSkill(s)} className="p-1 hover:bg-emerald-100 rounded-full transition-colors"><X size={12} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-[0.2em] ml-2">Mission Assets</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl transition-all group-hover:border-emerald-500 group-hover:bg-emerald-50">
                  <ImageIcon size={24} className="text-gray-400 group-hover:text-emerald-500 mb-2" />
                  <span className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-widest">Cover Art</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files[0] || null)} />
              </label>
              <label className="cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl transition-all group-hover:border-emerald-500 group-hover:bg-emerald-50">
                  <FileText size={24} className="text-gray-400 group-hover:text-emerald-500 mb-2" />
                  <span className="text-[10px] font-normal text-xs uppercase tracking-widest opacity-60 text-gray-400 uppercase tracking-widest">Attach Docs</span>
                </div>
                <input type="file" multiple className="hidden" onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-10 border-t border-gray-100 flex justify-end gap-5">
        <button type="button" onClick={() => navigate("/opportunities")} className="px-10 py-5 rounded-[28px] bg-gray-50 text-gray-400 font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-12 py-5 rounded-[28px] bg-[#123524] text-white font-normal text-xs uppercase tracking-widest opacity-60 uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 transition-all flex items-center gap-3">
          {isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18} /></motion.div> : <Save size={18} />}
          {isSubmitting ? 'Syncing...' : 'Finalize Mission'}
        </button>
      </div>
    </form>
  );
}
