import React, { useState } from 'react';
import { Settings, Users, CreditCard, Database, BarChart3, Lock, Plus } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const [systemStats] = useState({
    tenants: 15,
    activeUsers: 127,
    monthlyRevenue: 45000,
    uptime: 99.87,
  });

  const [tenants] = useState([
    { id: 1, name: 'Al Ain Trading Co', trn: '100123456701', subscription: 'Professional', users: 8, createdDate: '2025-01-15', status: 'Active' },
    { id: 2, name: 'Dubai Retail Group', trn: '100234567802', subscription: 'Enterprise', users: 24, createdDate: '2024-11-20', status: 'Active' },
    { id: 3, name: 'Abu Dhabi Supplies', trn: '100345678903', subscription: 'Starter', users: 3, createdDate: '2026-04-01', status: 'Active' },
  ]);

  const [subscriptions] = useState([
    { id: 1, name: 'Starter', price: 499, features: ['Single Branch', 'Basic POS', '5 Users'], tenants: 8 },
    { id: 2, name: 'Professional', price: 1499, features: ['Multi-Branch', 'Advanced Inventory', 'CRM', '20 Users'], tenants: 5 },
    { id: 3, name: 'Enterprise', price: 4999, features: ['Unlimited Branches', 'Full ERP', 'API Access', 'Dedicated Support'], tenants: 2 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Panel</h1>
          <p className="text-slate-500 mt-1">Multi-tenant management, billing, and system configuration.</p>
        </div>
      </div>

      {/* System KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
          <p className="text-blue-700 font-medium text-sm">Total Tenants</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{systemStats.tenants}</p>
          <p className="text-xs text-blue-600 mt-2">SaaS customers</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6">
          <p className="text-emerald-700 font-medium text-sm">Active Users</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">{systemStats.activeUsers}</p>
          <p className="text-xs text-emerald-600 mt-2">Across all tenants</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
          <p className="text-purple-700 font-medium text-sm">Monthly Revenue</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">AED {systemStats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-purple-600 mt-2">Recurring revenue</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 p-6">
          <p className="text-yellow-700 font-medium text-sm">System Uptime</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">{systemStats.uptime}%</p>
          <p className="text-xs text-yellow-600 mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['overview', 'tenants', 'subscriptions', 'payments', 'features', 'security', 'backups'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
            }`}
          >
            {tab.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Tenant Growth (Last 12 Months)
              </h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                [Growth chart: 8 tenants → 15 tenants]
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Add New Tenant</button>
                <button className="w-full py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-200">Send Email Campaign</button>
                <button className="w-full py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-200">View System Logs</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} /> Add Tenant
          </button>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {tenants.map(tenant => (
              <div key={tenant.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{tenant.name}</h3>
                  <p className="text-sm text-slate-600">TRN: {tenant.trn}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{tenant.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Subscription</span>
                  <p className="font-semibold">{tenant.subscription}</p>
                </div>
                <div>
                  <span className="text-slate-600">Active Users</span>
                  <p className="font-semibold">{tenant.users}</p>
                </div>
                <div>
                  <span className="text-slate-600">Created</span>
                  <p className="font-semibold">{new Date(tenant.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                <button className="text-orange-600 hover:underline text-sm font-semibold">Manage Users</button>
                <button className="text-red-600 hover:underline text-sm font-semibold">Suspend</button>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptions.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">AED {plan.price} <span className="text-sm text-slate-600">/month</span></p>
              <div className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="text-sm text-slate-700">✓ {feature}</div>
                ))}
              </div>
              <div className="text-sm text-slate-600 mb-4 pt-4 border-t">
                <span className="font-semibold">{plan.tenants}</span> active customers
              </div>
              <button className="w-full py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-200">Edit Plan</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard size={20} /> Payment Management
          </h3>
          <div className="space-y-3">
            {[
              { tenant: 'Al Ain Trading Co', amount: 1499, date: '2026-05-01', status: 'Paid', method: 'Bank Transfer' },
              { tenant: 'Dubai Retail Group', amount: 4999, date: '2026-05-01', status: 'Paid', method: 'Credit Card' },
              { tenant: 'Abu Dhabi Supplies', amount: 499, date: '2026-04-01', status: 'Pending', method: 'Bank Transfer' },
            ].map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-sm">{payment.tenant}</p>
                  <p className="text-xs text-slate-600">{payment.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">AED {payment.amount}</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4">Feature Toggles & Module Configuration</h3>
          <div className="space-y-3">
            {[
              { name: 'POS System', enabled: true, beta: false },
              { name: 'Inventory Management', enabled: true, beta: false },
              { name: 'Accounting Module', enabled: true, beta: false },
              { name: 'HR & Payroll', enabled: true, beta: false },
              { name: 'Advanced Analytics', enabled: false, beta: true },
              { name: 'AI Features', enabled: false, beta: true },
              { name: 'API Access', enabled: false, beta: false },
              { name: 'White-Label Support', enabled: false, beta: false },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{feature.name}</span>
                  {feature.beta && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded font-semibold">BETA</span>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={feature.enabled} className="w-4 h-4" />
                  <span className="text-sm text-slate-600">{feature.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Lock size={20} /> Security & Compliance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-semibold">SSL/TLS Encryption</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-semibold">2FA Enforcement</span>
                <button className="text-blue-600 hover:underline text-sm font-semibold">Configure</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-semibold">API Rate Limiting</span>
                <button className="text-blue-600 hover:underline text-sm font-semibold">Edit Limits</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-semibold">Audit Logs Retention</span>
                <button className="text-blue-600 hover:underline text-sm font-semibold">Set to 1 Year</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Database size={20} /> Backup & Disaster Recovery
          </h3>
          <div className="space-y-3">
            {[
              { date: 'Today 02:00 AM', size: '2.4 GB', status: 'Success' },
              { date: 'Yesterday 02:00 AM', size: '2.3 GB', status: 'Success' },
              { date: '2026-05-16 02:00 AM', size: '2.2 GB', status: 'Success' },
            ].map((backup, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-sm">{backup.date}</p>
                  <p className="text-xs text-slate-600">Size: {backup.size}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded font-semibold">{backup.status}</span>
                  <button className="text-blue-600 hover:underline text-sm font-semibold">Restore</button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Trigger Backup Now</button>
        </div>
      )}
    </div>
  );
}
