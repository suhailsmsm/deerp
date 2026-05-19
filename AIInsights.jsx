import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  LineChart,
  PackageSearch,
  Send,
  ShieldAlert,
  ShoppingBasket,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

const demoSignals = [
  { label: 'Weekend uplift', value: '+18%', tone: 'text-emerald-700', detail: 'Beverages and snacks trend higher on Friday/Saturday.' },
  { label: 'Expiry exposure', value: '3 SKUs', tone: 'text-amber-700', detail: 'Prioritize near-expiry dairy and grocery batches.' },
  { label: 'Margin pressure', value: '2 items', tone: 'text-red-700', detail: 'Low stock items have above-average basket contribution.' },
];

const demoCustomers = [
  { name: 'Mohammed Al Rashid', segment: 'VIP', pattern: 'High basket value, repeat grocery buyer', nextBestAction: 'Offer bulk rice and oil bundle' },
  { name: 'Fatima Al Zaabi', segment: 'Regular', pattern: 'Buys dairy and beverages every 10-14 days', nextBestAction: 'Send milk restock reminder' },
  { name: 'Khalid Ibrahim', segment: 'At risk', pattern: 'No purchase in 30+ days', nextBestAction: 'Send win-back voucher' },
];

export default function AIInsights({ products = [], customers = [], cart = [] }) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask about stock risk, demand, customer segments, or suspicious transactions.' },
  ]);

  const insights = useMemo(() => {
    const normalizedProducts = products.map((product) => ({
      ...product,
      name: product.name || product.barcode || `Item ${product.id}`,
      stock: Number(product.stock || 0),
      minStock: Number(product.minStock || 10),
      maxStock: Number(product.maxStock || Math.max(Number(product.stock || 0) * 2, 20)),
      price: Number(product.price || 0),
    }));

    const inventoryValue = normalizedProducts.reduce((sum, item) => sum + item.stock * item.price, 0);
    const lowStockItems = normalizedProducts.filter((item) => item.stock <= Math.max(item.minStock, 5));
    const forecastRevenue = Math.max(8420, inventoryValue * 0.18);
    const demandItems = normalizedProducts
      .map((item) => {
        const velocity = Math.max(3, Math.round((item.price > 20 ? 9 : 6) + (item.stock < item.minStock ? 5 : 0)));
        const daysCover = Math.max(1, Math.round(item.stock / velocity));
        const reorderQty = Math.max(0, item.maxStock - item.stock);
        return { ...item, velocity, daysCover, reorderQty };
      })
      .sort((a, b) => a.daysCover - b.daysCover)
      .slice(0, 6);

    const recommendations = demandItems
      .filter((item) => item.stock < item.maxStock || item.daysCover <= 14)
      .slice(0, 4)
      .map((item) => ({
        title: `Reorder ${item.name}`,
        detail: `${item.daysCover} days cover at projected demand. Suggested order: ${item.reorderQty || item.velocity * 7} ${item.unit || 'units'}.`,
        priority: item.daysCover <= 7 ? 'High' : item.daysCover <= 14 ? 'Medium' : 'Low',
      }));

    return {
      inventoryValue,
      lowStockItems,
      forecastRevenue,
      demandItems,
      recommendations,
      activeCustomers: customers.length || demoCustomers.length,
      currentBasketValue: cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0),
    };
  }, [products, customers, cart]);

  const sendMessage = () => {
    const prompt = chatInput.trim();
    if (!prompt) return;

    const lowerPrompt = prompt.toLowerCase();
    let reply = `Based on current demo signals, expected sales are AED ${Math.round(insights.forecastRevenue).toLocaleString()} with ${insights.lowStockItems.length} stock-risk items.`;

    if (lowerPrompt.includes('fraud') || lowerPrompt.includes('risk')) {
      reply = 'I found 2 alert patterns to review: repeated refunds under manager threshold and unusually high discount use on card payments.';
    } else if (lowerPrompt.includes('inventory') || lowerPrompt.includes('stock')) {
      reply = insights.recommendations[0]?.detail || 'Inventory is healthy right now. Keep monitoring fast-moving SKUs.';
    } else if (lowerPrompt.includes('customer')) {
      reply = 'Top behavior segment: VIP grocery buyers. Best action is bundle offers for rice, oil, and dairy replenishment cycles.';
    }

    setMessages((items) => [...items, { role: 'user', text: prompt }, { role: 'assistant', text: reply }]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">AI Command Center</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Smart Analytics & Automation</h1>
          <p className="mt-1 text-sm text-slate-500">Forecast demand, detect risk, and recommend the next best action.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Sparkles size={16} />
          Demo AI active
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Sales forecast', value: `AED ${Math.round(insights.forecastRevenue).toLocaleString()}`, icon: LineChart, note: 'Next 7 days' },
          { label: 'Demand risk', value: `${insights.lowStockItems.length} SKUs`, icon: PackageSearch, note: 'Need attention' },
          { label: 'Customer signals', value: insights.activeCustomers, icon: Users, note: 'Profiles analyzed' },
          { label: 'Basket AI', value: `AED ${insights.currentBasketValue.toFixed(2)}`, icon: ShoppingBasket, note: 'Current cart value' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
                <Icon className="text-blue-600" size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-950">Demand Prediction</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Daily Demand</th>
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {insights.demandItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                    <td className="px-4 py-3 text-slate-600">{item.velocity} units</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.daysCover <= 7 ? 'bg-red-100 text-red-700' : item.daysCover <= 14 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.daysCover} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Order {item.reorderQty || item.velocity * 7}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-950">AI Assistant</h2>
          </div>
          <div className="flex h-72 flex-col rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 bg-white text-slate-700 shadow-sm'}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-200 p-3">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage();
                }}
                placeholder="Ask the AI..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button onClick={sendMessage} className="rounded-xl bg-slate-950 px-3 py-2 text-white">
                <Send size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BrainCircuit className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-950">Inventory Recommendations</h2>
          </div>
          <div className="space-y-3">
            {insights.recommendations.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.priority === 'High' ? 'bg-red-100 text-red-700' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="font-bold text-slate-950">Customer Buying Behavior</h2>
          </div>
          <div className="space-y-3">
            {demoCustomers.map((customer) => (
              <div key={customer.name} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">{customer.segment}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{customer.pattern}</p>
                <p className="mt-2 text-xs font-semibold text-blue-600">{customer.nextBestAction}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={20} />
            <h2 className="font-bold text-slate-950">Fraud Detection Alerts</h2>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Refund pattern anomaly', detail: '3 refunds below approval threshold in the last shift.', severity: 'High' },
              { title: 'Discount spike', detail: 'Manual discounts are 2.4x above normal for card payments.', severity: 'Medium' },
              { title: 'Cash drawer variance', detail: 'AED 42 variance projected if current basket pattern continues.', severity: 'Low' },
            ].map((alert) => (
              <div key={alert.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={alert.severity === 'High' ? 'text-red-600' : alert.severity === 'Medium' ? 'text-amber-600' : 'text-blue-600'} />
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{alert.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {demoSignals.map((signal) => (
          <div key={signal.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{signal.label}</p>
            <p className={`mt-2 text-2xl font-bold ${signal.tone}`}>{signal.value}</p>
            <p className="mt-2 text-sm text-slate-500">{signal.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
