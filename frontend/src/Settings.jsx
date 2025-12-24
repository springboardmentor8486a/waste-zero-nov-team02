import React, { useEffect, useState } from 'react';
import PageHeader from './components/PageHeader';
import { Info, Zap } from 'lucide-react';
import api from './utils/api';

const STORAGE_KEY = 'wz_settings_v1';

const defaultSettings = {
  aiMode: 'balanced', // concise | balanced | creative
  historyEnabled: true,
  suggestionsEnabled: true,
  aiTemperature: 0.7,
  theme: 'system' // system | light | dark
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  // load from backend (if logged in) then fallback to localStorage/defaults
  useEffect(() => {
    let mounted = true;
    api.get('/settings').then(res => {
      if (!mounted) return;
      if (res.data?.settings) {
        setSettings(s => ({ ...s, ...res.data.settings }));
      } else {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setSettings(JSON.parse(raw));
        } catch (e) {}
      }
    }).catch(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setSettings(JSON.parse(raw));
      } catch (e) {}
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  const save = async () => {
    setSaving(true);
    try {
      // persist locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // persist to backend if logged in
      await api.put('/settings', settings);
      setToast('Settings saved');
    } catch (e) {
      setToast('Saved locally; failed to persist to server');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 2200);
    }
  };

  const resetDefaults = async () => {
    setSettings(defaultSettings);
    try { localStorage.removeItem(STORAGE_KEY); await api.put('/settings', defaultSettings); } catch (e) {}
    setToast('Reset to defaults');
    setTimeout(() => setToast(''), 2200);
  };

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">
=======
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <PageHeader title="Settings" subtitle="Personalize your WasteWise and AI assistant experience." />
>>>>>>> Stashed changes

        {toast && (
          <div className="mb-4 p-3 rounded bg-waste-green/10 text-waste-dark-green transition-all">{toast}</div>
        )}

<<<<<<< Updated upstream
        <div className="space-y-4">
          <SettingItem title="Dark Mode" desc="Toggle theme appearance" />
          <SettingItem title="Notifications" desc="Manage alerts" />
        </div>
=======
        <section className="space-y-6">
          <div className="transition-all">
            <h4 className="font-semibold flex items-center gap-2">AI Assistant Mode <Info size={14} className="text-gray-400" title="Controls assistant response style"/></h4>
            <p className="text-sm text-gray-500">Choose how the assistant responds.</p>
            <div className="mt-3 flex gap-2">
              {['concise','balanced','creative'].map(m => (
                <button
                  key={m}
                  onClick={() => setSettings(s => ({ ...s, aiMode: m }))}
                  className={`px-3 py-2 rounded shadow-sm transform transition ${settings.aiMode === m ? 'bg-waste-green text-white scale-105' : 'bg-gray-100 hover:scale-102'}`}
                  title={m === 'concise' ? 'Short, to-the-point responses' : m === 'creative' ? 'More imaginative, verbose responses' : 'Balanced responses'}
                >
                  <span className="inline-flex items-center gap-2"><Zap size={14} />{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
>>>>>>> Stashed changes

          <div className="transition-all">
            <h4 className="font-semibold flex items-center gap-2">AI Behavior <Info size={14} className="text-gray-400" title="Behavioral controls for the assistant"/></h4>
            <div className="flex items-center gap-6 mt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.historyEnabled} onChange={(e) => setSettings(s => ({ ...s, historyEnabled: e.target.checked }))} />
                <span className="text-sm">Save conversation history</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.suggestionsEnabled} onChange={(e) => setSettings(s => ({ ...s, suggestionsEnabled: e.target.checked }))} />
                <span className="text-sm">Show assistant suggestions</span>
              </label>
            </div>
            <div className="mt-3">
              <label className="text-sm">Response creativity (temperature): <b>{settings.aiTemperature}</b></label>
              <input type="range" min="0" max="1" step="0.1" value={settings.aiTemperature} onChange={(e) => setSettings(s => ({ ...s, aiTemperature: Number(e.target.value) }))} className="w-full mt-2" />
            </div>
          </div>

          <div className="transition-all">
            <h4 className="font-semibold">Theme</h4>
            <p className="text-sm text-gray-500">Control application theme.</p>
            <div className="mt-2 flex gap-2">
              {['system','light','dark'].map(t => (
                <button key={t} onClick={() => setSettings(s => ({ ...s, theme: t }))} className={`px-3 py-2 rounded ${settings.theme === t ? 'bg-waste-green text-white' : 'bg-gray-100'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={resetDefaults} className="px-4 py-2 rounded bg-gray-100">Reset</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-waste-green text-white">{saving ? 'Saving…' : 'Save settings'}</button>
          </div>
        </section>
      </div>
    </div>
  );
}

<<<<<<< Updated upstream
function SettingItem({ title, desc }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}
=======
>>>>>>> Stashed changes
