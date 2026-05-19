import React, { useEffect, useMemo, useState } from 'react';
import { useModuleStore } from './moduleStore';
import {
  BadgePercent,
  Bot,
  Building2,
  Calculator,
  Check,
  Gift,
  MessageSquare,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Utensils,
  Users,
  Zap,
} from 'lucide-react';

const moduleMetadata = [
  { id: 'fnb', name: 'Restaurant & KOT', desc: 'Table management, KDS, and kitchen firing for F&B teams.', icon: Utensils, category: 'Operations', plan: 'Pro', accent: 'from-rose-500 to-orange-500' },
  { id: 'inventory', name: 'Advanced Inventory', desc: 'Stock controls, batch tracking, expiry alerts, and SKU intelligence.', icon: Package, category: 'Operations', plan: 'Core', accent: 'from-emerald-500 to-teal-500' },
  { id: 'multiBranch', name: 'Multi-Branch Sync', desc: 'Centralized branch controls, transfer visibility, and HQ reporting.', icon: Building2, category: 'Operations', plan: 'Enterprise', accent: 'from-sky-500 to-blue-600' },
  { id: 'crm', name: 'CRM & Customers', desc: 'Profiles, segments, buying behavior, and follow-up workflows.', icon: Users, category: 'Customer', plan: 'Core', accent: 'from-indigo-500 to-blue-500' },
  { id: 'loyalty', name: 'Loyalty & Promotions', desc: 'Rewards, vouchers, retention offers, and UAE promo workflows.', icon: Gift, category: 'Customer', plan: 'Pro', accent: 'from-fuchsia-500 to-pink-500' },
  { id: 'whatsapp', name: 'WhatsApp Receipts', desc: 'Digital receipts, delivery updates, payment links, and campaigns.', icon: MessageSquare, category: 'Customer', plan: 'Core', accent: 'from-green-500 to-emerald-600' },
  { id: 'accounting', name: 'Finance & VAT', desc: 'Petty cash, ledger controls, UAE VAT support, and FTA reports.', icon: Calculator, category: 'Finance', plan: 'Core', accent: 'from-cyan-500 to-blue-500' },
  { id: 'commissions', name: 'Staff Commissions', desc: 'Sales-based commission tracking for staff and service teams.', icon: BadgePercent, category: 'Finance', plan: 'Pro', accent: 'from-amber-500 to-yellow-500' },
  { id: 'ai', name: 'AI Features', desc: 'Forecasting, recommendations, smart analytics, and fraud signals.', icon: Bot, category: 'Intelligence', plan: 'Beta', accent: 'from-violet-500 to-indigo-500' },
];

const categories = ['All', 'Operations', 'Customer', 'Finance', 'Intelligence'];

export default function ModuleSettings() {
  const { modules, toggleModule, initModules } = useModuleStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    initModules();
  }, []);

  const enabledCount = moduleMetadata.filter((module) => modules[module.id]).length;

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return moduleMetadata.filter((module) => {
      const matchesCategory = activeCategory === 'All' || module.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${module.name} ${module.desc} ${module.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
              <Store size={14} />
              Module Store
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Enable the ERP apps your business needs</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Turn features on or off like an app marketplace. Enabled modules appear in navigation and activate their workflows immediately.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-3 rounded-2xl border border-white/70 bg-white/65 p-3 shadow-sm">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Enabled</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{enabledCount}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Available</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{moduleMetadata.length}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Mode</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">Live</p>
            </div>
          </div>
        </div>
      </section>

      <div className="glass-panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'border border-white/70 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative min-w-0 lg:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search modules"
              className="w-full rounded-2xl border border-white/70 bg-white/75 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          const isEnabled = Boolean(modules[module.id]);

          return (
            <article key={module.id} className="module-card group">
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl bg-gradient-to-br ${module.accent} p-3 text-white shadow-lg shadow-slate-300/50`}>
                  <Icon size={24} />
                </div>
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isEnabled ? 'bg-slate-950' : 'bg-slate-200'
                  }`}
                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${module.name}`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      isEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-950">{module.name}</h3>
                  {isEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                      <Check size={12} />
                      Enabled
                    </span>
                  )}
                </div>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-500">{module.desc}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{module.category}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                  {module.plan === 'Beta' ? <Sparkles size={14} /> : <Zap size={14} />}
                  {module.plan}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="glass-panel grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Permission aware', text: 'Modules can be paired with RBAC controls for staff roles.' },
          { icon: Sparkles, title: 'AI ready', text: 'Intelligence modules can use POS, inventory, and CRM signals.' },
          { icon: Building2, title: 'Branch scalable', text: 'Enable modules by company plan or branch rollout stage.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-white/70 bg-white/65 p-4">
              <Icon className="text-blue-600" size={20} />
              <h3 className="mt-3 font-bold text-slate-950">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
