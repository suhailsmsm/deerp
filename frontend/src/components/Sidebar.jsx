import React, { useState } from 'react';
import { useModuleStore } from '../store/moduleStore';
import {
  BarChart3, BookOpen, Building2, CreditCard, Gift, LayoutDashboard, ListTodo,
  MessageCircle, Package, Settings, ShieldCheck, ShoppingCart, Truck,
  UserCheck, Users, Utensils, WalletCards, Landmark, Briefcase, BrainCircuit,
  HardHat, Scan, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ activePage, onPageChange }) {
  const { modules } = useModuleStore();
  const [collapsed, setCollapsed] = useState(false);

  const groups = [
    {
      label: 'Management',
      items: [
        { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, enabled: true },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
        { id: 'ai-insights', label: 'AI Features', icon: BrainCircuit, enabled: modules.ai },
        { id: 'inventory', label: 'Inventory Tracker', icon: Package, enabled: modules.inventory },
        { id: 'crm', label: 'CRM', icon: Users, enabled: modules.crm },
        { id: 'social-poster', label: 'Social Scheduler', icon: MessageCircle, enabled: true },
        { id: 'loyalty', label: 'Loyalty & Promos', icon: Gift, enabled: modules.loyalty },
        { id: 'reports', label: 'Sales Reports', icon: BarChart3, enabled: true },
        { id: 'staff', label: 'Staff Management', icon: ShieldCheck, enabled: true },
      ]
    },
    {
      label: 'Finance & Legal',
      items: [
        { id: 'accounting', label: 'Accounting', icon: BookOpen, enabled: modules.accounting },
        { id: 'cheques', label: 'PDC & Banking', icon: Landmark, enabled: true },
        { id: 'vat', label: 'VAT Returns', icon: WalletCards, enabled: true },
      ]
    },
    {
      label: 'HR & Operations',
      items: [
        { id: 'hr-payroll', label: 'HR & Payroll', icon: UserCheck, enabled: true },
        { id: 'staff', label: 'Staff Shifts', icon: ShieldCheck, enabled: true },
        { id: 'branches', label: 'Multi-Branch', icon: Building2, enabled: true },
      ]
    },
    {
      label: 'Verticals',
      items: [
        { id: 'fnb', label: 'F&B Module', icon: Utensils, enabled: modules.fnb },
      ]
    },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ease-in-out`}>
      <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="DERPX Ai" className="h-10 object-contain flex-shrink-0" />
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-[#80cd82]">DERPX Ai</div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enterprise Suite</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-[#80cd82] transition-all flex items-center justify-center flex-shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-4 mb-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-[#80cd82] transition-all flex items-center justify-center"
          title="Expand Sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <nav className="flex-1 px-2 py-2 space-y-2 overflow-auto">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2 dark:border-0 dark:border-none">{group.label}</div>
            )}
            {group.items.filter(item => item.enabled).map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-3 py-4' : 'px-4 py-3'} rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#80cd82] text-[#080056]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-[#80cd82]'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={20} className={`${isActive ? 'text-[#080056]' : ''} flex-shrink-0`} />
                  {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-2 pt-2">
        <button
          onClick={() => onPageChange('settings-admin')}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-3 py-4' : 'px-4 py-3'} rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-[#80cd82]`}
          title={collapsed ? 'Settings & Admin' : ''}
        >
          <Settings size={18} className="text-[#80cd82] flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings & Admin</span>}
        </button>

        {!collapsed && <div className="mt-4 text-[10px] text-slate-500 text-center">V1.0.0 · Local SQLite</div>}
      </div>
    </aside>
  );
}
