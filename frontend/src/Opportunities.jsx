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
  },
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
        const data = res?.data ?? res ?? [];
        if (Array.isArray(data) && data.length) setItems(data);
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
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
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
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {toast.visible && (
          <div style={{ position: "fixed", right: 20, top: 20, zIndex: 60 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#d1fae5", color: "#065f46", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>{toast.text}</div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Opportunities</h2>
            <p className="text-sm text-gray-600">Browse and manage volunteering opportunities.</p>
          </div>
          {role === "ngo" && (
            <button onClick={() => navigate("/opportunities/new")} className="bg-green-600 text-white px-4 py-2 rounded">+ Create</button>
          )}
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Filter by location (e.g. City, Street)..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items
              .filter(it =>
                !locationSearch ||
                (it.location && it.location.toLowerCase().includes(locationSearch.toLowerCase()))
              )
              .map((it) => (
                <div key={it._id || it.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  {it.cover ? (
                    <img src={(it.cover && it.cover.startsWith('/uploads')) ? uploadsBase + it.cover : it.cover} alt={it.title} className="h-28 w-full object-cover rounded-md mb-3" />
                  ) : (
                    <div className="h-28 rounded-md mb-3 bg-gradient-to-r from-green-400 to-green-600" />
                  )}
                  <h3 className="font-semibold text-lg">{it.title}</h3>
                  <div className="text-xs text-gray-400">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
                  <p className="text-sm text-gray-500 mt-1">{it.short}</p>
                  <div className="mt-2 text-xs text-gray-500">{it.location}</div>
                  <div className="mt-2 text-sm text-gray-700">{(it.registered_count || 0)} / {it.capacity || '—'} volunteers</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-600">{it.notes || ''}</div>
                    <div className="flex items-center gap-2">
                      {role === "volunteer" && (() => {
                        const required = Array.isArray(it.required_skills) ? it.required_skills : [];
                        const matches = required.filter(rs => userSkills.includes(rs));
                        const pct = required.length ? (matches.length / required.length) : 0;
                        const canApplyBySkill = required.length === 0 || matches.length > 0;
                        const capacityFull = it.capacity != null && (it.registered_count || 0) >= it.capacity;
                        const disabled = capacityFull || !canApplyBySkill;
                        return (
                          <>
                            <button
                              onClick={async () => {
                                if (!canApplyBySkill) { showToast('You cannot apply — insufficient skill match'); return; }
                                if (capacityFull) { showToast('No slots available'); return; }
                                try {
                                  await apiRequest("/applications", "POST", { opportunity_id: it._id || it.id });
                                  setItems(prev => prev.map(x => (String(x._id || x.id) === String(it._id || it.id) ? { ...x, registered_count: (x.registered_count || 0) + 1 } : x)));
                                  showToast('Applied successfully');
                                } catch (e) {
                                  showToast(e.message || 'Failed to apply');
                                }
                              }}
                              disabled={disabled}
                              className={`px-3 py-1 rounded ${disabled ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white'}`}
                            >
                              Apply
                            </button>
                            {required.length > 0 && (
                              <div className="text-xs text-gray-500 ml-2">Match: {Math.round(pct * 100)}%</div>
                            )}
                          </>
                        );
                      })()}
                      {role === "ngo" && (
                        <>
                          <button onClick={() => navigate(`/opportunities/edit/${it._id || it.id}`)} className="text-gray-500">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete({ open: true, id: it._id || it.id })} className="text-gray-400">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
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
                <button onClick={() => setConfirmDelete({ open: false, id: null })} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
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
  const [date, setDate] = useState(initialData.date || "");
  const [time, setTime] = useState(initialData.time || "");
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
    setDate(initialData.date || "");
    setTime(initialData.time || "");
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
    <form onSubmit={submit} className="space-y-6">
      <label>
        <div className="text-sm font-medium mb-1">Title</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded border" />
      </label>

      <label>
        <div className="text-sm font-medium mb-1">Short description</div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded border" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded border" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="px-3 py-2 rounded border" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="px-3 py-2 rounded border" />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Number of volunteers required</div>
        <input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="px-3 py-2 rounded border" placeholder="e.g. 20" />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Required Skills</div>
        <div className="flex gap-2 items-center">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={onSkillKey} placeholder="Add a skill and press Enter" className="px-3 py-2 rounded border flex-1" />
          <button type="button" onClick={addSkill} className="px-3 py-2 bg-gray-100 rounded">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => (
            <div key={s} className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2">
              <span className="text-xs">{s}</span>
              <button type="button" onClick={() => removeSkill(s)} className="text-xs text-red-500">×</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Cover image</div>
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0] || null)} />
        {initialData.cover && !coverFile && (
          <div className="text-xs text-gray-500 mt-1">Current cover: <img src={(initialData.cover && initialData.cover.startsWith('/uploads')) ? (previewBase + initialData.cover) : initialData.cover} alt="cover" className="inline-block h-12 ml-2" /></div>
        )}
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Attachments (PDF, Doc, Image, etc)</div>
        <input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
        {initialData.attachments && initialData.attachments.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">{initialData.attachments.length} existing file(s)</div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
      </div>
    </form>
  );
}
