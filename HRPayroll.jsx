import React from 'react';
import { Users, FileText, AlertCircle, Calendar } from 'lucide-react';

export default function HRPayroll() {
  return (
    <div className="space-y-6 overflow-y-auto p-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">HR & UAE Payroll (WPS)</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
          Generate SIF (WPS) File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={20} />
            <span className="font-bold text-sm uppercase">Legal Expiries</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Ahmed K. (Emirates ID)</span>
              <span className="text-red-500 font-bold">12 Days</span>
            </div>
            <div className="flex justify-between">
              <span>Lina M. (Visa)</span>
              <span className="text-amber-500 font-bold">28 Days</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <Calendar size={20} />
            <span className="font-bold text-sm uppercase">Attendance & Leave</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold">14</p>
              <p className="text-[10px] text-slate-500">ON DUTY</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">2</p>
              <p className="text-[10px] text-slate-500">ON LEAVE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}