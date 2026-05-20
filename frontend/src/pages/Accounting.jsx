import React from 'react';
import { Landmark, Calculator, Receipt, ArrowUpRight } from 'lucide-react';

export default function Accounting() {
  return (
    <div className="space-y-6 overflow-y-auto p-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accounting & FTA VAT</h1>
        <div className="flex gap-2">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold">Journal Entry</button>
          <button className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm font-bold">VAT Return (201)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Profit & Loss (Monthly)</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Revenue (Total Sales)</span>
              <span className="font-bold text-emerald-600">+ AED 124,500.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cost of Goods Sold</span>
              <span className="font-bold text-red-500">- AED 42,300.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Net Profit</span>
              <span>AED 82,200.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-center items-center text-center space-y-2">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-2"><Landmark size={32} /></div>
          <p className="font-bold text-slate-800">Pending PDCs</p>
          <p className="text-xs text-slate-500">You have 4 Post-Dated Cheques to be deposited this week.</p>
        </div>
      </div>
    </div>
  );
}