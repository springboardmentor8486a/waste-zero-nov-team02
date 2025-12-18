import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import PageHeader from "./components/PageHeader";

const SAMPLE = [
  {
    id: "1",
    title: "City Park Cleanup Drive",
    short: "Join us for a community effort to clear litter and plant new saplings in the park.",
    date: "2023-10-15",
    time: "09:00",
    location: "Central City Park, West Gate",
    volunteers: "15 / 20",
    status: "active",
    cover: null,
  },
  {
    id: "2",
    title: "River Bank Restoration",
    short: "Cleaning up the plastics along the east river bank to protect local wildlife.",
    date: "2023-11-02",
    time: "08:30",
    location: "East River Trail, Dock 4",
    volunteers: "5 / 50",
    status: "upcoming",
    cover: null,
  }
];

export default function Opportunities() {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("opportunities_demo");
      return raw ? JSON.parse(raw) : SAMPLE;
    } catch (e) {
      return SAMPLE;
    }
  });
  const [toast, setToast] = useState({ visible: false, type: "", text: "" });

  useEffect(() => {
    // try to load from server, fallback to localStorage
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/opportunities");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setItems(data);
            return;
          }
        }
      } catch (e) {
        // ignore and fall back to localStorage
      }
      // ensure localStorage has a copy
      localStorage.setItem("opportunities_demo", JSON.stringify(items));
    };

    fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("opportunities_demo", JSON.stringify(items));
  }, [items]);

  const showToast = (type, text, ms = 3000) => {
    setToast({ visible: true, type, text });
    setTimeout(() => setToast({ visible: false, type: "", text: "" }), ms);
  };

  const pathname = location.pathname;

  // Create
  if (pathname.endsWith("/new")) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <PageHeader title="Create New Opportunity" subtitle="Fill in the details below to launch a new recycling or waste management initiative." />
          <OpportunityForm onSave={async (data) => {
            // try server POST
            try {
              const res = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
              if (res.ok) {
                const created = await res.json();
                setItems(prev => [created, ...prev]);
                showToast('success', 'Opportunity created');
                navigate('/opportunities');
                return;
              }
            } catch (e) {
              // server not available — fallback
            }

            const id = String(Date.now());
            const next = [{ ...data, id }, ...items];
            setItems(next);
            showToast('success', 'Opportunity saved locally');
            navigate('/opportunities');
          }} />
        </div>
      </div>
    );
  }

  // Edit
  if (pathname.includes("/edit/")) {
    const id = pathname.split("/edit/")[1];
    const existing = items.find((it) => it.id === id) || null;
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <PageHeader title="Edit Opportunity" subtitle="Update the details of this existing recycling or waste management initiative." />
          <OpportunityForm initialData={existing} onSave={async (data) => {
            // try server PUT
            try {
              const res = await fetch(`/api/opportunities/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
              if (res.ok) {
                const updated = await res.json();
                setItems(prev => prev.map(it => it.id === id ? updated : it));
                showToast('success', 'Opportunity updated');
                navigate('/opportunities');
                return;
              }
            } catch (e) { }

            const next = items.map((it) => it.id === id ? { ...it, ...data } : it);
            setItems(next);
            showToast('success', 'Opportunity updated locally');
            navigate('/opportunities');
          }} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {toast.visible && (
          <div style={{position:'fixed',right:20,top:20,zIndex:60}}>
            <div style={{padding:'10px 14px',borderRadius:8,background: toast.type==='success' ? '#d1fae5' : '#fee2e2',color: toast.type==='success' ? '#065f46' : '#991b1b',boxShadow:'0 6px 18px rgba(0,0,0,0.12)'}}>
              {toast.text}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">My Opportunities</h2>
            <p className="text-sm text-gray-600">Manage your active volunteer drives and past initiatives.</p>
          </div>
          <button onClick={() => navigate("/opportunities/new")} className="bg-green-600 text-white px-4 py-2 rounded">+ Create New Opportunity</button>
        </div>

          <div className="grid grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="h-28 rounded-md mb-3 bg-gradient-to-r from-green-400 to-green-600" />
              <h3 className="font-semibold text-lg">{it.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{it.short}</p>
              <div className="text-sm text-gray-500 mt-3">{it.date} • {it.time}</div>
              <div className="text-sm text-gray-500">{it.location}</div>
                <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-600">{it.volunteers} Volunteers</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/opportunities/edit/${it.id}`)} className="text-gray-500">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={async () => {
                    if (!confirm('Delete this opportunity?')) return;
                    // try server delete
                    try {
                      const res = await fetch(`/api/opportunities/${it.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        setItems(prev => prev.filter(x => x.id !== it.id));
                        showToast('success', 'Opportunity deleted');
                        return;
                      }
                    } catch (e) { }

                    // fallback
                    setItems(items.filter(x=>x.id!==it.id));
                    showToast('success', 'Opportunity removed locally');
                  }} className="text-gray-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OpportunityForm({ initialData = {}, onSave }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.short || "");
  const [date, setDate] = useState(initialData.date || "");
  const [startTime, setStartTime] = useState(initialData.time || "");
  const [endTime, setEndTime] = useState(initialData.endTime || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [volunteers, setVolunteers] = useState(initialData.volunteers || "");
  const [image, setImage] = useState(initialData.cover || null);

  useEffect(() => {
    setTitle(initialData.title || "");
    setDescription(initialData.short || "");
    setDate(initialData.date || "");
    setStartTime(initialData.time || "");
    setEndTime(initialData.endTime || "");
    setLocation(initialData.location || "");
    setCategory(initialData.category || "");
    setVolunteers(initialData.volunteers || "");
    setImage(initialData.cover || null);
  }, [initialData]);

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const data = { title, short: description, date, time: startTime, endTime, location, category, volunteers, cover: image };
    if (onSave) onSave(data);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">Opportunity Title <span className="text-red-500">*</span></div>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. City Park Cleanup Drive" className="w-full px-4 py-2 rounded border border-gray-200 bg-white" required />
        </label>

        <label>
          <div className="text-sm font-medium mb-1">Description <span className="text-red-500">*</span></div>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 rounded border border-gray-200 bg-white" required />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="px-3 py-2 rounded border border-gray-200" />
          <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="px-3 py-2 rounded border border-gray-200" />
          <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="px-3 py-2 rounded border border-gray-200" />
        </div>

        <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="123 Green Street, Eco City" className="px-4 py-2 rounded border border-gray-200" />

        <div className="grid grid-cols-2 gap-4">
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="px-3 py-2 rounded border border-gray-200">
            <option value="">General Cleanup</option>
            <option value="education">Education</option>
            <option value="recycling">Recycling Drive</option>
          </select>
          <input value={volunteers} onChange={(e)=>setVolunteers(e.target.value)} placeholder="e.g. 10" className="px-3 py-2 rounded border border-gray-200" />
        </div>

        <div className="border-2 border-dashed rounded p-4 text-center">
          {image ? <img src={image} className="mx-auto max-h-36" alt="preview" /> : <div className="text-sm text-gray-500">Upload a cover image (optional)</div>}
          <input type="file" accept="image/*" onChange={handleImage} className="mt-2 w-full" />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={()=>window.history.back()} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
        </div>
      </div>
    </form>
  );
}
