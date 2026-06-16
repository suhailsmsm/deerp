import React, { useState } from 'react';
import { useModuleStore } from '../store/moduleStore';

export default function ShiftReport({ shiftId, openingFloat }) {
  const [report, setReport] = useState(null);
  const { modules } = useModuleStore();

  const generateReport = async () => {
    if (window.electron) {
      const data = await window.electron.getShiftReport(shiftId);
      setReport(data);
    } else {
      // Mock data for Web Version Demo
      setReport({
        count: 15,
        totalSales: 2450.50,
        totalVat: 122.53,
        byMethod: { cash: 1200, card: 1250.50 }
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Current Shift Summary (X-Report)</h2>
        <button onClick={generateReport} className="text-blue-600 font-medium">Refresh Data</button>
      </div>

      {report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Opening Float</p>
              <p className="text-lg font-bold">AED {openingFloat.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total Net Sales</p>
              <p className="text-lg font-bold text-blue-700">AED {report.totalSales.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between py-1"><span>Transactions</span><span>{report.count}</span></div>
            <div className="flex justify-between py-1"><span>VAT Collected (5%)</span><span>AED {report.totalVat.toFixed(2)}</span></div>
            {modules.accounting && (
              <div className="flex justify-between py-1 text-red-500">
                <span>Petty Cash Out</span>
                <span>- AED {(report.pettyCashTotal || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold"><span>Cash in Drawer</span><span>AED {(openingFloat + report.byMethod.cash).toFixed(2)}</span></div>
          </div>
          
          <button className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold mt-4">Close Shift & Print Z-Report</button>
        </div>
      ) : (
        <p className="text-center py-10 text-slate-400">Click refresh to load shift data.</p>
      )}
    </div>
  );
}
