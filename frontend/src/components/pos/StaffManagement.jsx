import React, { useState } from 'react';
import { Users, Shield, Lock, Fingerprint, Plus, Edit2, Trash2, Key, LogOut } from 'lucide-react';

const roles = [
  { id: 'admin', name: 'Admin', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'manager', name: 'Manager', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'cashier', name: 'Cashier', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const permissions = {
  admin: ['all'],
  manager: ['pos', 'inventory', 'reports', 'customers'],
  cashier: ['pos'],
};

export default function StaffManagement({ staff = [], onStaffUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [authMethod, setAuthMethod] = useState('pin'); // pin, biometric, password

  const stats = {
    total: staff.length,
    admin: staff.filter(s => s.role === 'admin').length,
    manager: staff.filter(s => s.role === 'manager').length,
    cashier: staff.filter(s => s.role === 'cashier').length,
    active: staff.filter(s => s.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-medium text-slate-600">Total Staff</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
          <p className="text-xs font-medium text-purple-700">Admins</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.admin}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-medium text-blue-700">Managers</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.manager}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-700">Cashiers</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.cashier}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-700">Active</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Add Staff Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-950">Staff Members</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                roles.find(r => r.id === member.role)?.bg
              } ${roles.find(r => r.id === member.role)?.color}`}>
                {roles.find(r => r.id === member.role)?.name}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Lock size={14} /> Auth Method
                </span>
                <span className="font-medium text-slate-900 capitalize">
                  {member.authMethod || 'PIN'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Key size={14} /> Shift
                </span>
                <span className="font-medium text-slate-900">
                  {member.shift || 'Morning'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Shield size={14} /> Status
                </span>
                <span className={`font-semibold ${member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {member.status || 'active'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <button className="flex-1 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1">
                <Edit2 size={12} /> Edit
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 flex items-center justify-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No staff members yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first staff member to get started</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Add Staff Member
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ahmed Hassan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="ahmed@derpx.ae"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Shift</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Night</option>
                    <option>Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Authentication Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setAuthMethod('pin')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      authMethod === 'pin'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Lock size={24} className={authMethod === 'pin' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-xs font-semibold">PIN</span>
                  </button>
                  <button
                    onClick={() => setAuthMethod('biometric')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      authMethod === 'biometric'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Fingerprint size={24} className={authMethod === 'biometric' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-xs font-semibold">Biometric</span>
                  </button>
                  <button
                    onClick={() => setAuthMethod('password')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                      authMethod === 'password'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Key size={24} className={authMethod === 'password' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-xs font-semibold">Password</span>
                  </button>
                </div>
              </div>

              {authMethod === 'pin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PIN Code (4-6 digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 tracking-widest"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
