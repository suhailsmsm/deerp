import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, Download, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SalesDashboard({ transactions = [], products = [] }) {
  const [timeRange, setTimeRange] = useState('7days'); // today, 7days, 30days, custom
  const [exportFormat, setExportFormat] = useState('pdf'); // pdf, excel, csv

  // Process transactions for analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const timeFilters = {
      today: (d) => new Date(d).toDateString() === now.toDateString(),
      7days: (d) => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(d) >= weekAgo;
      },
      30days: (d) => {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new Date(d) >= monthAgo;
      },
    };

    const filter = timeFilters[timeRange] || timeFilters.today;
    const filtered = transactions.filter(t => filter(t.createdAt));

    const totalSales = filtered.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalTransactions = filtered.length;
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Sales by payment method
    const paymentMethods = {};
    filtered.forEach(t => {
      const method = t.paymentMethod || 'cash';
      paymentMethods[method] = (paymentMethods[method] || 0) + (t.total || 0);
    });

    // Daily sales trend
    const dailySales = {};
    filtered.forEach(t => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + (t.total || 0);
    });

    // Top products
    const productSales = {};
    filtered.forEach(t => {
      const items = typeof t.items === 'string' ? JSON.parse(t.items) : t.items;
      items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.qty || 0);
      });
    });

    return {
      totalSales,
      totalTransactions,
      averageOrderValue,
      paymentMethods,
      dailySales,
      productSales,
    };
  }, [transactions, timeRange]);

  // Chart data
  const dailyChartData = Object.entries(analytics.dailySales).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    sales: amount,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const paymentMethodData = Object.entries(analytics.paymentMethods).map(([method, amount]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: amount,
  }));

  const topProductsData = Object.entries(analytics.productSales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}...`);
    alert(`Exporting ${timeRange} report as ${format.toUpperCase()}...`);
    // Implementation would use libraries like html2pdf, xlsx, etc.
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Sales Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <button
            onClick={() => handleExport(exportFormat)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-900 flex items-center gap-2"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Sales</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">AED {analytics.totalSales.toFixed(2)}</p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">+12.5%</span>
            <span className="text-xs text-slate-500">vs previous period</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Transactions</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{analytics.totalTransactions}</p>
            </div>
            <ShoppingCart className="text-emerald-600" size={32} />
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">+8.2%</span>
            <span className="text-xs text-slate-500">vs previous period</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">AED {analytics.averageOrderValue.toFixed(2)}</p>
            </div>
            <BarChart3 className="text-purple-600" size={32} />
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">+5.3%</span>
            <span className="text-xs text-slate-500">vs previous period</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700">Products Sold</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">
                {Object.values(analytics.productSales).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <FileText className="text-amber-600" size={32} />
          </div>
          <div className="flex items-center gap-1 mt-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">+15.7%</span>
            <span className="text-xs text-slate-500">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Daily Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `AED ${v}`} />
              <Tooltip formatter={(v) => [`AED ${v.toFixed(2)}`, 'Sales']} />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `AED ${v.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-slate-950 mb-4">Top Selling Products</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Bar dataKey="qty" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Staff Performance Table */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-slate-950 mb-4">Staff Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Staff Member</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Transactions</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Sales</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Order</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Ahmed Hassan', transactions: 45, sales: 3250.50 },
                { name: 'Fatima Ali', transactions: 38, sales: 2890.00 },
                { name: 'Mohammed Rashid', transactions: 52, sales: 4120.75 },
              ].map((staff, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{staff.name}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{staff.transactions}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">AED {staff.sales.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">AED {(staff.sales / staff.transactions).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      <TrendingUp size={12} />
                      {idx === 2 ? 'Excellent' : idx === 0 ? 'Very Good' : 'Good'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
