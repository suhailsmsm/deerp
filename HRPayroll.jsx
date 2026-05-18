import React, { useState } from 'react';
import { Users, Calendar, FileText, AlertCircle, Plus } from 'lucide-react';

export default function HRPayroll() {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees] = useState([
    { id: 1, name: 'Ahmed K.', position: 'Manager', dept: 'Operations', salary: 6500, status: 'Active', visaExpiry: '2027-03-15', emiratesId: '784-2025-1234567-8' },
    { id: 2, name: 'Lina M.', position: 'Cashier', dept: 'POS', salary: 3500, status: 'Active', visaExpiry: '2026-08-20', emiratesId: '784-2025-7654321-1' },
    { id: 3, name: 'Yousef S.', position: 'Chef', dept: 'Kitchen', salary: 4500, status: 'On Leave', visaExpiry: '2028-01-10', emiratesId: '784-2025-9876543-2' },
  ]);

  const [payrollData] = useState({
    totalSalary: 14500,
    totalBenefits: 1450,
    totalDeductions: 1160,
    netPayable: 14790,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">HR & Payroll Management</h1>
          <p className="text-slate-500 mt-1">Employee profiles, payroll, attendance, and compliance tracking.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Employees</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{employees.length}</p>
          <p className="text-xs text-slate-500 mt-2">Active: {employees.filter(e => e.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Monthly Payroll</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">AED {payrollData.netPayable.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Next cycle: 2026-06-01</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Visa Expiring Soon</p>
          <p className="text-3xl font-bold text-red-600 mt-2">1</p>
          <p className="text-xs text-slate-500 mt-2">Within 90 days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['employees', 'payroll', 'attendance', 'leaves', 'documents'].map(tab => (
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
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Employee</th>
                  <th className="px-6 py-3 text-left font-semibold">Position</th>
                  <th className="px-6 py-3 text-left font-semibold">Department</th>
                  <th className="px-6 py-3 text-left font-semibold">Salary</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Visa Expiry</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const daysToExpiry = Math.floor((new Date(emp.visaExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={emp.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-600">{emp.position}</td>
                      <td className="px-6 py-4 text-slate-600">{emp.dept}</td>
                      <td className="px-6 py-4 font-semibold">AED {emp.salary}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${daysToExpiry < 90 ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                          {new Date(emp.visaExpiry).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-600 text-sm">Total Salary</p>
              <p className="text-2xl font-bold mt-2">AED {payrollData.totalSalary.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-600 text-sm">Benefits</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">AED {payrollData.totalBenefits.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-600 text-sm">Deductions</p>
              <p className="text-2xl font-bold text-red-600 mt-2">AED {payrollData.totalDeductions.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <p className="text-slate-600 text-sm">Net Payable</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">AED {payrollData.netPayable.toLocaleString()}</p>
            </div>
          </div>

          {/* Payroll Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4">Payroll Details (May 2026)</h3>
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">AED {emp.salary}</p>
                    <p className="text-xs text-slate-500">Gross Salary</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">Process Payroll & Export WPS</button>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} /> Attendance Tracking
          </h3>
          <p className="text-slate-500 mb-4">Biometric integration available. Monthly report: {employees.filter(e => e.status === 'Active').length * 22} expected work days.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">View Attendance Report</button>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4">Leave Management</h3>
          <div className="space-y-3">
            {[
              { name: 'Yousef S.', type: 'Annual Leave', from: '2026-05-20', to: '2026-05-24', status: 'Approved' },
              { name: 'Lina M.', type: 'Sick Leave', from: '2026-05-18', to: '2026-05-19', status: 'Pending' },
            ].map((leave, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{leave.name}</p>
                  <p className="text-sm text-slate-600">{leave.type} · {leave.from} to {leave.to}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          {employees.map(emp => (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FileText size={20} /> {emp.name}'s Documents
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Employment Contract</span>
                  <button className="text-blue-600 text-sm hover:underline">View</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Emirates ID: {emp.emiratesId}</span>
                  <button className="text-blue-600 text-sm hover:underline">Upload Scan</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">Visa: Exp {new Date(emp.visaExpiry).toLocaleDateString()}</span>
                  <button className="text-blue-600 text-sm hover:underline">Upload Scan</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
