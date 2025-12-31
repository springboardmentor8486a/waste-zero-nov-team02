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
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white drop-shadow-md">Settings</h1>
        <p className="text-gray-200 mt-1 font-medium drop-shadow-sm">Personalize your WasteWise experience.</p>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#123524] text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce flex items-center gap-2 z-50">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* AI Configuration Card */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Customize response style</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Response Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['concise', 'balanced', 'creative'].map(m => (
                  <button
                    key={m}
                    onClick={() => setSettings(s => ({ ...s, aiMode: m }))}
                    className={`py-2 px-1 rounded-lg text-sm font-bold capitalize transition-all border-2 ${settings.aiMode === m
                        ? 'border-[#123524] bg-green-50 text-[#123524] shadow-sm'
                        : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Creativity Level</label>
                <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{settings.aiTemperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.aiTemperature}
                onChange={(e) => setSettings(s => ({ ...s, aiTemperature: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#123524]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={settings.historyEnabled} onChange={(e) => setSettings(s => ({ ...s, historyEnabled: e.target.checked }))} className="w-5 h-5 text-[#123524] rounded focus:ring-[#123524] border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Save Conversation History</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={settings.suggestionsEnabled} onChange={(e) => setSettings(s => ({ ...s, suggestionsEnabled: e.target.checked }))} className="w-5 h-5 text-[#123524] rounded focus:ring-[#123524] border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Show Suggestions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance & System Card */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Appearance</h3>
                <p className="text-xs text-gray-500">Look and feel</p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['system', 'light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => setSettings(s => ({ ...s, theme: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${settings.theme === t
                      ? 'bg-white text-[#123524] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Chat Widget</h3>
                <p className="text-xs text-gray-500">Enable floating assistant</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.chatEnabled ?? true} onChange={(e) => setSettings(s => ({ ...s, chatEnabled: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#123524]"></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button onClick={resetDefaults} className="flex-1 py-3 bg-white/80 backdrop-blur rounded-xl text-gray-600 font-bold text-sm hover:bg-white transition-colors">
              Reset Defaults
            </button>
            <button onClick={save} disabled={saving} className="flex-1 py-3 bg-[#123524] rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

