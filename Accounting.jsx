import React, { useState } from 'react';
import { BarChart3, Plus, Download, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accountingData] = useState({
    revenue: 125000,
    expenses: 45000,
    profit: 80000,
    vat: 6250,
    receivables: 15000,
    payables: 8500,
  });

  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenue = [8000, 9500, 12000, 11500, 14000, 15000];
  const expenses = [3000, 3500, 4000, 3800, 4200, 4500];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounting & Finance</h1>
          <p className="text-slate-500 mt-1">General ledger, VAT compliance, and financial statements.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200 flex items-center gap-2">
            <Download size={18} /> Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Revenue (YTD)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">AED {accountingData.revenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">↑ 12% from last quarter</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Expenses (YTD)</p>
          <p className="text-3xl font-bold text-red-600 mt-2">AED {accountingData.expenses.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">↓ 5% from last quarter</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Net Profit (YTD)</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">AED {accountingData.profit.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">64% profit margin</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['dashboard', 'general-ledger', 'vat-returns', 'reports', 'balance-sheet'].map(tab => (
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Revenue vs Expenses Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={20} /> Revenue vs Expenses Trend
            </h2>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              [6-Month Revenue vs Expenses Chart - AED]
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receivables */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DollarSign className="text-emerald-600" size={20} /> Accounts Receivable
              </h3>
              <p className="text-3xl font-bold text-emerald-600">AED {accountingData.receivables.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-2">5 customers</p>
              <button className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-100">View Details</button>
            </div>

            {/* Payables */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DollarSign className="text-red-600" size={20} /> Accounts Payable
              </h3>
              <p className="text-3xl font-bold text-red-600">AED {accountingData.payables.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-2">3 suppliers</p>
              <button className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100">View Details</button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4">Recent Journal Entries</h3>
            <div className="space-y-3">
              {[
                { date: '2026-05-18', desc: 'Sales Revenue - May', debit: 15000, credit: 0 },
                { date: '2026-05-17', desc: 'Supplier Payment - Gulf Food', debit: 0, credit: 2500 },
                { date: '2026-05-16', desc: 'Utilities Expense', debit: 450, credit: 0 },
              ].map((txn, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{txn.desc}</p>
                    <p className="text-xs text-slate-500">{txn.date}</p>
                  </div>
                  <div className="flex gap-6">
                    <span className={`font-semibold ${txn.debit > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      Debit: AED {txn.debit}
                    </span>
                    <span className={`font-semibold ${txn.credit > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      Credit: AED {txn.credit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'general-ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4">General Ledger</h2>
          <p className="text-slate-500 mb-4">Chart of accounts with detailed transactions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Account</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {['Cash in Bank', 'Accounts Receivable', 'Sales Revenue', 'Cost of Goods', 'Operating Expenses'].map((acc, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{acc}</td>
                    <td className="px-4 py-3 text-slate-600">Asset</td>
                    <td className="px-4 py-3 text-right font-semibold">AED 25,000</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vat-returns' && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6">
          <h2 className="text-lg font-bold mb-4">UAE VAT Returns (FTA)</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">VAT Due (Output VAT)</p>
                <p className="text-2xl font-bold text-blue-600">AED {accountingData.vat.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Input VAT (Recoverable)</p>
                <p className="text-2xl font-bold text-emerald-600">AED 2,250</p>
              </div>
            </div>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Generate FTA Return</button>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4">Financial Reports</h2>
          <div className="space-y-3">
            {['Profit & Loss Statement', 'Balance Sheet', 'Cash Flow Statement', 'Trial Balance'].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold">{report}</p>
                <button className="text-blue-600 hover:underline text-sm">View / Download</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'balance-sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4">Balance Sheet (May 18, 2026)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-3 text-blue-600">ASSETS</h3>
              <div className="space-y-2 border-b-2 border-slate-300 pb-4">
                <div className="flex justify-between"><span>Cash in Bank</span><span className="font-semibold">AED 45,000</span></div>
                <div className="flex justify-between"><span>Accounts Receivable</span><span className="font-semibold">AED 15,000</span></div>
                <div className="flex justify-between"><span>Inventory</span><span className="font-semibold">AED 35,000</span></div>
              </div>
              <div className="flex justify-between mt-3 font-bold">
                <span>Total Assets</span>
                <span>AED 95,000</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-emerald-600">LIABILITIES & EQUITY</h3>
              <div className="space-y-2 border-b-2 border-slate-300 pb-4">
                <div className="flex justify-between"><span>Accounts Payable</span><span className="font-semibold">AED 8,500</span></div>
                <div className="flex justify-between"><span>VAT Payable</span><span className="font-semibold">AED 6,250</span></div>
                <div className="flex justify-between"><span>Owner Equity</span><span className="font-semibold">AED 80,250</span></div>
              </div>
              <div className="flex justify-between mt-3 font-bold">
                <span>Total Liabilities & Equity</span>
                <span>AED 95,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
