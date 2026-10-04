"use client";

import { useState, useEffect } from 'react';
import { Shield, Bell, Globe, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [intensity, setIntensity] = useState('Balanced');
  const [retention, setRetention] = useState('30');
  const [observation, setObservation] = useState(true);
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setIntensity(data.settings.notificationIntensity);
          setRetention(data.settings.retentionDays.toString());
          setObservation(data.settings.observationEnabled);
          setDomains(data.settings.allowedDomains || []);
        }
      });
  }, []);

  const saveSettings = async (updates: any) => {
    setIsSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setIsSaving(false);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim() || domains.includes(newDomain.trim())) return;
    const updated = [...domains, newDomain.trim().toLowerCase()];
    setDomains(updated);
    saveSettings({ allowedDomains: updated });
    setNewDomain('');
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    const updated = domains.filter(d => d !== domainToRemove);
    setDomains(updated);
    saveSettings({ allowedDomains: updated });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings & Privacy</h1>
          <p className="text-slate-500 mt-2">Control your data, notifications, and observation preferences.</p>
        </div>
        {isSaving && <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full animate-pulse">Saving...</span>}
      </header>

      <div className="space-y-8">
        {/* Privacy Center */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-5 h-5"/>
            </div>
            <h2 className="text-lg font-medium text-slate-900">Privacy Center</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900">Background Observation</h3>
                <p className="text-xs text-slate-500">Allow Closure to collect signals from connected sources.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={observation}
                  onChange={(e) => {
                    setObservation(e.target.checked);
                    saveSettings({ observationEnabled: e.target.checked });
                  }}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <h3 className="text-sm font-medium text-slate-900">Signal Retention</h3>
                <p className="text-xs text-slate-500">How long raw activity signals are stored before automatic deletion.</p>
              </div>
              <select 
                value={retention}
                onChange={(e) => {
                  setRetention(e.target.value);
                  saveSettings({ retentionDays: Number(e.target.value) });
                }}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>
        </section>

        {/* Domain Permissions */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Globe className="w-5 h-5"/>
            </div>
            <h2 className="text-lg font-medium text-slate-900">Domain Permissions</h2>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Manage which websites the Closure Browser Extension is allowed to observe. Activity on unlisted domains is ignored locally and never leaves your browser.
          </p>

          <div className="flex gap-3 mb-6">
            <input 
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              placeholder="e.g., stackoverflow.com"
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none"
            />
            <button 
              onClick={handleAddDomain}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4"/>
              Add Domain
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {domains.map((domain) => (
              <div key={domain} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-sm font-medium text-slate-700 truncate">{domain}</span>
                <button 
                  onClick={() => handleRemoveDomain(domain)}
                  className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}