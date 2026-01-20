import React, { useEffect, useState } from 'react';
import PageHeader from './components/PageHeader';
import { Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from './utils/api';

const STORAGE_KEY = 'wz_settings_v1';

const defaultSettings = {
  aiMode: 'balanced', // concise | balanced | creative
  historyEnabled: true,
  suggestionsEnabled: true,
  aiTemperature: 0.7,
  theme: 'system', // system | light | dark
  chatEnabled: true // enable/disable chat assistant
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
        } catch (e) { }
      }
    }).catch(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setSettings(JSON.parse(raw));
      } catch (e) { }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    // Sync chat enabled state to localStorage
    localStorage.setItem('chatEnabled', JSON.stringify(settings.chatEnabled ?? true));
  }, [settings.theme, settings.chatEnabled]);

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
    try { localStorage.removeItem(STORAGE_KEY); await api.put('/settings', defaultSettings); } catch (e) { }
    setToast('Reset to defaults');
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="premium-card p-10 bg-white shadow-sm border border-gray-100">
        <PageHeader title="Personal Settings" />

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-emerald-50 text-emerald-700 font-normal text-[10px] uppercase tracking-widest border border-emerald-100"
          >
            {toast}
          </motion.div>
        )}

        <section className="space-y-12">
          <div>
            <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              AI Assistant Preferences
              <Info size={14} className="text-gray-200" title="Controls assistant response style" />
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['concise', 'balanced', 'creative'].map(m => (
                <button
                  key={m}
                  onClick={() => setSettings(s => ({ ...s, aiMode: m }))}
                  className={`p-5 rounded-2xl border transition-all text-left group ${settings.aiMode === m ? 'bg-emerald-50 border-emerald-200 ring-4 ring-emerald-50/50' : 'bg-white border-gray-100 hover:border-emerald-100'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${settings.aiMode === m ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-300 group-hover:text-emerald-400'}`}>
                    <Zap size={18} />
                  </div>
                  <div className={`text-sm font-normal capitalize transition-colors ${settings.aiMode === m ? 'text-emerald-900' : 'text-gray-600'}`}>{m}</div>
                  <div className="text-[9px] text-gray-400 font-normal uppercase tracking-widest mt-1">
                    {m === 'concise' ? 'Short & Pointed' : m === 'creative' ? 'Verbose & Vivid' : 'Standard Response'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
            <div>
              <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-6">AI Privacy & Behavior</h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent hover:bg-white hover:border-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
                    checked={settings.historyEnabled}
                    onChange={(e) => setSettings(s => ({ ...s, historyEnabled: e.target.checked }))}
                  />
                  <span className="text-sm font-normal text-gray-700">Save Conversation History</span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent hover:bg-white hover:border-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
                    checked={settings.suggestionsEnabled}
                    onChange={(e) => setSettings(s => ({ ...s, suggestionsEnabled: e.target.checked }))}
                  />
                  <span className="text-sm font-normal text-gray-700">Show Smart Suggestions</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-6">Interface Theme</h4>
              <div className="flex gap-2">
                {['system', 'light', 'dark'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSettings(s => ({ ...s, theme: t }))}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-normal uppercase tracking-widest border transition-all ${settings.theme === t ? 'bg-[#123524] text-white border-emerald-600 shadow-lg shadow-emerald-900/10' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <label className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-3 block">Response Creativity ({settings.aiTemperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.aiTemperature}
                  onChange={(e) => setSettings(s => ({ ...s, aiTemperature: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Info size={18} />
              </div>
              <div>
                <div className="text-sm font-normal text-gray-900 tracking-tight">System Update</div>
                <div className="text-[10px] text-gray-400 font-normal uppercase tracking-widest">v2.4.0 • Optimal Security</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetDefaults}
                className="px-6 py-3 rounded-xl text-[10px] font-normal uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset Default
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-[#123524] text-white text-[10px] font-normal uppercase tracking-widest shadow-lg shadow-emerald-900/10 hover:bg-[#0d281a] transition-all"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
