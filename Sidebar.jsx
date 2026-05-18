import React from 'react';
import { useModuleStore } from './moduleStore';
import { 
  BarChart3, BookOpen, Building2, CreditCard, Gift, LayoutDashboard, ListTodo,
  MessageCircle, Package, Settings, ShieldCheck, ShoppingCart, Truck, 
  UserCheck, Users, Utensils, WalletCards, Landmark
} from 'lucide-react';

export default function Sidebar({ activePage, onPageChange }) {
  const { modules } = useModuleStore();

  const groups = [
    {
      label: 'Operations',
      items: [
        { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, enabled: true },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
        { id: 'payments', label: 'Payments', icon: CreditCard, enabled: true },
        { id: 'communications', label: 'Comms & Delivery', icon: MessageCircle, enabled: modules.whatsapp },
      ]
    },
    {
      label: 'Management',
      items: [
        { id: 'inventory', label: 'Inventory', icon: Package, enabled: modules.inventory },
        { id: 'purchasing', label: 'Purchasing', icon: Truck, enabled: true },
        { id: 'crm', label: 'CRM', icon: Users, enabled: modules.crm },
        { id: 'loyalty', label: 'Loyalty & Promos', icon: Gift, enabled: modules.loyalty },
        { id: 'projects', label: 'Projects & Tasks', icon: ListTodo, enabled: true },
        { id: 'reports', label: 'Reports', icon: BarChart3, enabled: true },
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
        { id: 'staff', label: 'Employees / WPS', icon: UserCheck, enabled: true },
        { id: 'shifts', label: 'Shifts & Access', icon: ShieldCheck, enabled: true },
        { id: 'branches', label: 'Multi-Branch', icon: Building2, enabled: true },
      ]
    },
    {
      label: 'Verticals',
      items: [
        { id: 'fnb', label: 'F&B Module', icon: Utensils, enabled: modules.fnb },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, enabled: true },
      ]
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-400">NexaPOS</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Enterprise Suite</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-auto">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2">{group.label}</div>
            {group.items.filter(item => item.enabled).map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        V1.0.0 · Local SQLite
      </div>
    </aside>
  );
}
