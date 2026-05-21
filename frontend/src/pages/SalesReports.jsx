import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  RotateCcw,
  Wallet,
} from 'lucide-react';

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

const formatDate = (date) => date.toISOString().slice(0, 10);
const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });

// Sales forecasting using simple linear regression and moving average
const calculateForecast = (historicalData, daysToForecast = 7) => {
  if (historicalData.length < 3) {
    return Array(daysToForecast).fill(0).map((_, i) => ({
      day: i + 1,
      date: formatDate(new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)),
      forecast: 0,
      lower: 0,
      upper: 0,
    }));
  }

  const values = historicalData.map(d => d.total);
  const n = values.length;
  
  // Calculate trend using linear regression
  const sumX = n * (n - 1) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate residuals for confidence interval
  const residuals = values.map((val, i) => val - (slope * i + intercept));
  const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2));
  
  // Generate forecast
  const forecast = [];
  for (let i = 0; i < daysToForecast; i++) {
    const futureX = n + i;
    const predicted = slope * futureX + intercept;
    const margin = 1.96 * stdError * Math.sqrt(1 + 1/n + Math.pow(futureX - (n-1)/2, 2) / ((n * (n*n - 1)) / 12));
    
    forecast.push({
      day: i + 1,
      date: formatDate(new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)),
      forecast: Math.max(0, predicted),
      lower: Math.max(0, predicted - margin),
      upper: predicted + margin,
    });
  }
  
  return forecast;
};

// Calculate day-over-day growth
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export default function SalesReports({ products = [] }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [dateRange, setDateRange] = useState('7days');
  const [showForecast, setShowForecast] = useState(true);

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

  // Get date range for historical data
  const getDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDate(date);
  };

  const dailyReport = useMemo(() => {
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

  // Historical data for trends and forecasting
  const historicalData = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 14;
    const grouped = {};
    
    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = getDaysAgo(i);
      grouped[date] = { date, total: 0, sales: 0, returns: 0, transactions: 0 };
    }
    
    // Aggregate transactions
    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt).toISOString().slice(0, 10);
      if (grouped[date]) {
        const amount = Number(tx.total || 0);
        grouped[date].total += amount;
        grouped[date].transactions += 1;
        if (amount >= 0) {
          grouped[date].sales += amount;
        } else {
          grouped[date].returns += Math.abs(amount);
        }
      }
    });
    
    return Object.values(grouped);
  }, [transactions, dateRange]);

  // Forecast data
  const forecastData = useMemo(() => {
    if (!showForecast) return [];
    return calculateForecast(historicalData, 7);
  }, [historicalData, showForecast]);

  // Payment method distribution
  const paymentDistribution = useMemo(() => {
    const rows = transactions.filter((transaction) => isSameDay(transaction.createdAt, selectedDate) && Number(transaction.total || 0) >= 0);
    const cash = rows.filter((t) => t.method === 'cash').reduce((sum, t) => sum + Number(t.total || 0), 0);
    const card = rows.filter((t) => t.method === 'card').reduce((sum, t) => sum + Number(t.total || 0), 0);
    
    return [
      { name: 'Cash', value: cash, color: '#10b981' },
      { name: 'Card', value: card, color: '#3b82f6' },
    ].filter(d => d.value > 0);
  }, [transactions, selectedDate]);

  // Top selling items
  const topItems = useMemo(() => {
    return dailyReport.itemWise.slice(0, 5).map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      value: Math.abs(item.gross),
    }));
  }, [dailyReport.itemWise]);

  // Previous period comparison
  const previousPeriodData = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days * 2);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    
    let total = 0;
    transactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate >= startDate && txDate < endDate && Number(tx.total || 0) >= 0) {
        total += Number(tx.total || 0);
      }
    });
    
    return total;
  }, [transactions, dateRange]);

  const currentPeriodTotal = historicalData.reduce((sum, d) => sum + d.sales, 0);
  const growthRate = calculateGrowth(currentPeriodTotal, previousPeriodData);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Sales Analytics</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Sales Reports & Forecasting</h1>
            <p className="mt-1 text-sm text-slate-500">Historical trends, AI-powered forecasts, and performance insights.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="7days">Last 7 days</option>
              <option value="14days">Last 14 days</option>
              <option value="30days">Last 30 days</option>
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />
            <button
              onClick={() => setShowForecast(!showForecast)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${showForecast ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              <TrendingUp size={16} />
              Forecast
            </button>
            <button onClick={loadTransactions} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {[
          { label: 'Cash Sales', value: dailyReport.cashSales, icon: Wallet, tone: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Card Sales', value: dailyReport.cardSales, icon: CreditCard, tone: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Sales', value: dailyReport.totalSales, icon: DollarSign, tone: 'text-slate-950', bg: 'bg-slate-50' },
          { label: 'Returns', value: dailyReport.totalReturns, icon: RotateCcw, tone: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Net Sales', value: dailyReport.netSales, icon: BarChart3, tone: 'text-indigo-700', bg: 'bg-indigo-50' },
          { label: 'Growth', value: growthRate, icon: growthRate >= 0 ? TrendingUp : TrendingDown, tone: growthRate >= 0 ? 'text-emerald-700' : 'text-red-700', bg: growthRate >= 0 ? 'bg-emerald-50' : 'bg-red-50', isPercent: true },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="glass-panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
                <Icon size={18} className={metric.tone} />
              </div>
              <p className={`mt-3 text-2xl font-bold ${metric.tone}`}>
                {metric.isPercent ? `${metric.value.toFixed(1)}%` : `AED ${metric.value.toFixed(2)}`}
              </p>
              <p className="mt-1 text-xs text-slate-500">{dailyReport.rows.length} transactions</p>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart with Forecast */}
      {showForecast && (
        <section className="glass-panel overflow-hidden">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Sales Trend & Forecast</h2>
            <p className="mt-1 text-sm text-slate-500">Historical sales with 7-day AI-powered forecast (95% confidence interval).</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...historicalData, ...forecastData]}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `AED ${val.toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  formatter={(value, name) => [`AED ${value.toFixed(2)}`, name === 'forecast' ? 'Forecast' : 'Actual']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="Actual Sales"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  name="Lower Bound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Daily Sales Bar Chart */}
        <section className="glass-panel overflow-hidden xl:col-span-2">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Daily Sales Breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Sales vs Returns over the selected period.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => getDayName(new Date(val))}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" name="Returns" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Payment Distribution */}
        <section className="glass-panel overflow-hidden">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Payment Methods</h2>
            <p className="mt-1 text-sm text-slate-500">Today's payment distribution.</p>
          </div>
          <div className="h-56">
            {paymentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `AED ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No data</div>
            )}
          </div>
          <div className="space-y-2 px-5 pb-5">
            {paymentDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">AED {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Top Items & Forecast Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Selling Items */}
        <section className="glass-panel overflow-hidden">
          <div className="border-b border-white/70 p-5">
            <h2 className="font-bold text-slate-950">Top Selling Items</h2>
            <p className="mt-1 text-sm text-slate-500">Best performers for selected date.</p>
          </div>
          <div className="h-64">
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(val) => `AED ${val.toFixed(0)}`} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
                  <Tooltip formatter={(value) => `AED ${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {topItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No sales data</div>
            )}
          </div>
        </section>

        {/* Forecast Summary */}
        {showForecast && (
          <section className="glass-panel overflow-hidden">
            <div className="border-b border-white/70 p-5">
              <h2 className="font-bold text-slate-950">7-Day Forecast Summary</h2>
              <p className="mt-1 text-sm text-slate-500">AI-predicted sales with confidence ranges.</p>
            </div>
            <div className="space-y-3 p-5">
              {forecastData.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {day.day}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500">
                        AED {day.lower.toFixed(0)} - AED {day.upper.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">AED {day.forecast.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Predicted</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Item Wise Report */}
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
              {dailyReport.itemWise.length ? dailyReport.itemWise.map((item) => (
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

      {/* Transactions */}
      <section className="glass-panel overflow-hidden">
        <div className="border-b border-white/70 p-5">
          <h2 className="font-bold text-slate-950">Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">Daily sale and return register.</p>
        </div>
        <div className="max-h-[52vh] overflow-auto">
          {dailyReport.rows.length ? dailyReport.rows.map((transaction) => (
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
  );
}
