import React, { useState } from 'react';
import { Boxes, Shield, SlidersHorizontal } from 'lucide-react';
import ModuleSettings from './ModuleSettings';
import AdminPanel from './AdminPanel';

const tabs = [
  { id: 'settings', label: 'Modules', icon: Boxes },
  { id: 'admin', label: 'Admin Panel', icon: Shield },
];

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
              <SlidersHorizontal size={14} />
              Control Center
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-950">Settings & Admin</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Configure ERP apps, tenant controls, permissions, subscriptions, and system operations from one clean workspace.
            </p>
          </div>

          <div className="flex rounded-2xl border border-white/70 bg-white/65 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTab === 'settings' && <ModuleSettings />}
      {activeTab === 'admin' && (
        <div className="glass-panel p-5">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
