import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CreditCard, ReceiptText, RefreshCw, RotateCcw, Wallet } from 'lucide-react';

const parseTransactionItems = (transaction) => {
  try {
    const parsed = typeof transaction.items === 'string' ? JSON.parse(transaction.items) : transaction.items;
    return Array.isArray(parsed) ? { type: 'sale', items: parsed } : { type: parsed?.type || 'sale', items: parsed?.items || [] };
  } catch {
    return { type: 'sale', items: [] };
  }
};

const isSameDay = (value, selectedDate) => {
  return new Date(value).toISOString().slice(0, 10) === selectedDate;
};

export default function SalesReports({ products = [] }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const loadTransactions = async () => {
    if (!window.electron?.getTransactions) {
      setTransactions([]);
      return;
    }

    const rows = await window.electron.getTransactions();
    setTransactions(rows || []);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const report = useMemo(() => {
    const rows = transactions.filter((transaction) => isSameDay(transaction.createdAt, selectedDate));
    const salesRows = rows.filter((transaction) => Number(transaction.total || 0) >= 0);
    const returnRows = rows.filter((transaction) => Number(transaction.total || 0) < 0);
    const cashSales = salesRows.filter((transaction) => transaction.method === 'cash').reduce((sum, transaction) => sum + Number(transaction.total || 0), 0);
    const cardSales = salesRows.filter((transaction) => transaction.method === 'card').reduce((sum, transaction) => sum + Number(transaction.total || 0), 0);
    const totalSales = salesRows.reduce((sum, transaction) => sum + Number(transaction.total || 0), 0);
    const totalReturns = Math.abs(returnRows.reduce((sum, transaction) => sum + Number(transaction.total || 0), 0));

    const itemMap = new Map();
    rows.forEach((transaction) => {
      const parsed = parseTransactionItems(transaction);
      const sign = Number(transaction.total || 0) < 0 || parsed.type === 'return' ? -1 : 1;
      parsed.items.forEach((item) => {
        const current = itemMap.get(item.id) || {
          id: item.id,
          name: item.name || products.find((product) => product.id === item.id)?.name || item.barcode || `Item ${item.id}`,
          qty: 0,
          gross: 0,
        };
        current.qty += sign * Number(item.qty || 0);
        current.gross += sign * Number(item.price || 0) * Number(item.qty || 0);
        itemMap.set(item.id, current);
      });
    });

    return {
      rows,
      cashSales,
      cardSales,
      totalSales,
      totalReturns,
      netSales: totalSales - totalReturns,
      itemWise: Array.from(itemMap.values()).sort((a, b) => Math.abs(b.gross) - Math.abs(a.gross)),
    };
  }, [transactions, selectedDate, products]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Sales Reports</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Daily Sales & Item Movement</h1>
            <p className="mt-1 text-sm text-slate-500">Cash, card, return, net sales, and item-wise performance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
            <button onClick={loadTransactions} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          { label: 'Cash Sales', value: report.cashSales, icon: Wallet, tone: 'text-emerald-700' },
          { label: 'Card Sales', value: report.cardSales, icon: CreditCard, tone: 'text-blue-700' },
          { label: 'Total Sales', value: report.totalSales, icon: BarChart3, tone: 'text-slate-950' },
          { label: 'Returns', value: report.totalReturns, icon: RotateCcw, tone: 'text-red-700' },
          { label: 'Net Sales', value: report.netSales, icon: ReceiptText, tone: 'text-indigo-700' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
                <Icon size={18} className={metric.tone} />
              </div>
              <p className={`mt-3 text-2xl font-bold ${metric.tone}`}>AED {metric.value.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-500">{report.rows.length} transactions</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="glass-panel overflow-hidden">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Item Wise Report</h2>
            <p className="mt-1 text-sm text-slate-500">Quantity and value sold/returned for the selected day.</p>
          </div>
          <div className="max-h-[52vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Net Qty</th>
                  <th className="px-5 py-3 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody>
                {report.itemWise.length ? report.itemWise.map((item) => (
                  <tr key={item.id} className="border-b border-white/70">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-5 py-4 text-slate-600">{item.qty}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">AED {item.gross.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-slate-500">No item movement for this date.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel overflow-hidden">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Transactions</h2>
            <p className="mt-1 text-sm text-slate-500">Daily sale and return register.</p>
          </div>
          <div className="max-h-[52vh] overflow-auto">
            {report.rows.length ? report.rows.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-white/70 px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-900">#{transaction.id} · {transaction.method}</p>
                  <p className="text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleTimeString('en-AE')}</p>
                </div>
                <div className={`font-bold ${Number(transaction.total || 0) < 0 ? 'text-red-700' : 'text-slate-950'}`}>
                  AED {Number(transaction.total || 0).toFixed(2)}
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-slate-500">No transactions found for this date.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
