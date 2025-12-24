import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./components/PageHeader";
import api from './utils/api';

const SAMPLE_CONVOS = [
  { id: "c1", title: "EcoBot - Plastic Sector Analysis", last: "I found 3 high-priority opportunities", time: "10:23 AM" },
  { id: "c2", title: "Recycling Grant Draft", last: "Draft saved — review when ready.", time: "9:11 AM" },
  { id: "c3", title: "Q3 Impact Report", last: "Report attached.", time: "Yesterday" }
];

const SAMPLE_MESSAGES = {
  c1: [
    { id: 1, author: "bot", text: "Hello! I'm ready to help you manage your waste initiative opportunities.", time: "10:23 AM" },
    { id: 2, author: "you", text: "Show me high-priority opportunities in the plastic sector.", time: "10:24 AM" },
    { id: 3, author: "bot", text: "I found 3 high-priority opportunities matching \"plastic sector\" with deadlines approaching in Q4.", time: "10:24 AM" }
  ],
  c2: [
    { id: 1, author: "you", text: "Please draft the grant proposal intro.", time: "9:05 AM" },
    { id: 2, author: "bot", text: "Draft created and saved.", time: "9:11 AM" }
  ],
  c3: [
    { id: 1, author: "bot", text: "Q3 impact: 1200 volunteer hours logged.", time: "Yesterday" }
  ]
};

export default function Messages() {
  const navigate = useNavigate();
  const [convos, setConvos] = useState(SAMPLE_CONVOS);
  const [selected, setSelected] = useState(SAMPLE_CONVOS[0].id);
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [menuOpen, setMenuOpen] = useState(null);
  const historyRef = useRef();
  const [userSettings, setUserSettings] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // could fetch real conversations here; keeping sample data for now
    api.get('/settings').then(r => {
      if (r.data?.settings) setUserSettings(r.data.settings);
    }).catch(() => {});
  }, []);

  function openHistoryFor(id) {
    setSelected(id);
    // scroll the history list to the selected item
    const el = document.getElementById(`hist-${id}`);
    if (el && historyRef.current) {
      el.scrollIntoView({ block: "nearest" });
    }
  }

  const renderHistory = (close) => (
    <div ref={historyRef} className="p-2">
      <h4 className="font-semibold mb-3">History</h4>
      <div className="space-y-2">
        {convos.map((c) => (
          <button
            id={`hist-${c.id}`}
            key={c.id}
            onClick={() => { setSelected(c.id); if (close) close(); }}
            className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-start justify-between ${selected === c.id ? "bg-green-50" : ""}`}
          >
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-gray-500">{c.last}</div>
            </div>
            <div className="text-xs text-gray-400">{c.time}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">
=======
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        <PageHeader title="Messages" subtitle="Conversations and AI assistant history." dropdownContent={renderHistory} />
>>>>>>> Stashed changes

        <div className="mt-4 bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Main conversation area */}
            <main className="md:col-span-9 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{convos.find(c=>c.id===selected)?.title}</h3>
                  <div className="text-sm text-gray-500">{convos.find(c=>c.id===selected)?.last}</div>
                </div>
                {/* removed unused Back to Dashboard button per UI cleanup */}
              </div>

<<<<<<< Updated upstream
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No messages yet.
          </p>
=======
              <div className="space-y-4">
                {(messages[selected] || []).map((m) => (
                  <div key={m.id} className={`p-3 rounded-lg ${m.author === 'you' ? 'bg-waste-green/10 self-end' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="text-sm text-gray-800">{m.text}</div>
                        <div className="text-xs text-gray-400 mt-1">{m.time}</div>
                      </div>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} className="p-1 rounded hover:bg-gray-200">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                          </svg>
                        </button>

                        {menuOpen === m.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow">
                            <button onClick={() => { openHistoryFor(selected); setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Open in History</button>
                            <button onClick={() => { navigator.clipboard?.writeText(m.text); setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Copy text</button>
                            <button onClick={() => { /* placeholder: delete message */ setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form className="mt-6 flex gap-2" onSubmit={async (e)=>{
                e.preventDefault();
                const text = e.target.elements.msg.value.trim();
                if(!text) return;
                const nextId = Date.now();
                // append user's message
                setMessages(prev=>({ ...prev, [selected]: [...(prev[selected]||[]), { id: nextId, author: 'you', text, time: 'Now' }] }));
                e.target.reset();

                // call assistant API
                try {
                  setSending(true);
                  const payload = { message: text, settings: userSettings };
                  const res = await api.post('/assistant', payload);
                  const reply = res.data?.reply || 'Sorry, no reply';
                  const botId = Date.now() + 1;
                  setMessages(prev => ({ ...prev, [selected]: [...(prev[selected]||[]), { id: botId, author: 'bot', text: reply, time: 'Now' }] }));
                } catch (err) {
                  const botId = Date.now() + 1;
                  setMessages(prev => ({ ...prev, [selected]: [...(prev[selected]||[]), { id: botId, author: 'bot', text: 'Assistant error', time: 'Now' }] }));
                } finally {
                  setSending(false);
                }
              }}>
                <input name="msg" className="flex-1 rounded border px-3 py-2" placeholder="Ask EcoBot anything about your opportunities..." />
                <button className={`px-4 py-2 ${sending ? 'bg-gray-300' : 'bg-waste-green hover:bg-waste-dark-green'} text-white rounded`} disabled={sending}>{sending ? 'Thinking…' : 'Send'}</button>
              </form>
            </main>

            {/* Right column: context or details - hidden on small screens */}
            <aside className="md:col-span-3 border-l hidden md:block p-4">
              <h4 className="font-semibold mb-3">Details</h4>
              <p className="text-sm text-gray-600">Conversation details and quick actions will appear here.</p>
            </aside>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}

    // Build history node and pass into PageHeader when rendering
    // (we render inline below to keep logic local)
