import React, { useEffect } from 'react';
import { useModuleStore } from './moduleStore';
import { 
  Utensils, Package, Users, Gift, 
  Calculator, MessageSquare, Building2, 
  BadgePercent, Settings2 
} from 'lucide-react';

const moduleMetadata = [
  { id: 'fnb', name: 'F&B Restaurant Module', desc: 'Table management, KDS, and kitchen firing.', icon: Utensils, category: 'Operations' },
  { id: 'inventory', name: 'Inventory Management', desc: 'Stock levels, expiry tracking, and SKUs.', icon: Package, category: 'Operations' },
  { id: 'crm', name: 'CRM & Customer Database', desc: 'Manage customer profiles and history.', icon: Users, category: 'Marketing' },
  { id: 'loyalty', name: 'Loyalty & Vouchers', desc: 'Reward points and UAE promotional codes.', icon: Gift, category: 'Marketing' },
  { id: 'accounting', name: 'Finance & VAT', desc: 'Petty cash, expenses, and FTA VAT reports.', icon: Calculator, category: 'Finance' },
  { id: 'commissions', name: 'Staff Commissions', desc: 'Track sales-based earnings for employees.', icon: BadgePercent, category: 'Finance' },
  { id: 'whatsapp', name: 'WhatsApp Integration', desc: 'Send digital receipts and pay-links.', icon: MessageSquare, category: 'Communications' },
  { id: 'multiBranch', name: 'Multi-Branch Sync', desc: 'Head office control and stock transfers.', icon: Building2, category: 'Operations' },
];

export default function ModuleSettings() {
  const { modules, toggleModule, initModules } = useModuleStore();

  useEffect(() => {
    initModules();
  }, []);

  const categories = ['Operations', 'Finance', 'Marketing', 'Communications'];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings2 className="text-blue-600" /> System Modules
        </h1>
        <p className="text-slate-500">Enable or disable core ERP features based on your business needs.</p>
      </div>

      <div className="space-y-10">
        {categories.map(cat => (
          <section key={cat}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleMetadata.filter(m => m.category === cat).map(module => {
                const Icon = module.icon;
                const isEnabled = modules[module.id];
                
                return (
                  <div 
                    key={module.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      isEnabled ? 'bg-white border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-xl ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{module.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{module.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleModule(module.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}