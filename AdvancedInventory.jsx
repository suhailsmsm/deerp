import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus, Search } from 'lucide-react';

export default function AdvancedInventory() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const inventoryData = [
    { id: 1, name: 'Basmati Rice 5kg', sku: '6281000001', stock: 142, minStock: 50, maxStock: 500, value: 4047, expiry: '2026-08-15', batch: 'B20260501', warehouse: 'Main', category: 'Grocery' },
    { id: 2, name: 'Nido Milk 900g', sku: '6281000002', stock: 56, minStock: 30, maxStock: 200, value: 1904, expiry: '2026-07-10', batch: 'B20260501', warehouse: 'Cold Store', category: 'Dairy' },
    { id: 3, name: 'Lays Classic 160g', sku: '6281000003', stock: 4, minStock: 20, maxStock: 100, value: 32, expiry: '2026-12-20', batch: 'B20260410', warehouse: 'Main', category: 'Snacks' },
    { id: 4, name: 'Pepsi 1.5L', sku: '6281000004', stock: 24, minStock: 15, maxStock: 80, value: 120, expiry: '2026-06-30', batch: 'B20260501', warehouse: 'Main', category: 'Beverages' },
  ];

  const lowStockItems = inventoryData.filter(item => item.stock < item.minStock);
  const expiringItems = inventoryData.filter(item => {
    const expiry = new Date(item.expiry);
    const today = new Date();
    const daysUntilExpiry = (expiry - today) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 30;
  });
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track stock, expiry dates, warehouses, and batches across your business.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
          <Plus className="inline mr-2" size={18} /> Add New Item
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <p className="text-blue-700 font-medium text-sm uppercase">Total Inventory Value</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">AED {totalInventoryValue.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-2">Across all warehouses</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 font-medium text-sm uppercase">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{lowStockItems.length}</p>
          <p className="text-xs text-red-600 mt-2">Below minimum level</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
          <p className="text-orange-700 font-medium text-sm uppercase">Expiring Soon</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{expiringItems.length}</p>
          <p className="text-xs text-orange-600 mt-2">Within 30 days</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
          <p className="text-emerald-700 font-medium text-sm uppercase">Total SKUs</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">{inventoryData.length}</p>
          <p className="text-xs text-emerald-600 mt-2">Active items</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['overview', 'low-stock', 'expiry', 'warehouses', 'transfers'].map(tab => (
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
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, SKU, or batch..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Product</th>
                  <th className="px-6 py-3 text-left font-semibold">SKU</th>
                  <th className="px-6 py-3 text-left font-semibold">Stock</th>
                  <th className="px-6 py-3 text-left font-semibold">Batch</th>
                  <th className="px-6 py-3 text-left font-semibold">Expiry</th>
                  <th className="px-6 py-3 text-left font-semibold">Warehouse</th>
                  <th className="px-6 py-3 text-left font-semibold">Value</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map(item => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.stock < item.minStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.stock} / {item.maxStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.batch}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(item.expiry).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-600">{item.warehouse}</td>
                    <td className="px-6 py-4 font-semibold">AED {item.value}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'low-stock' && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold">Low Stock Alert</h2>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-slate-500">All items are above minimum stock levels.</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">Current: {item.stock} | Minimum: {item.minStock}</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Create PO</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'expiry' && (
        <div className="bg-white rounded-2xl border border-orange-200 p-6">
          <h2 className="text-xl font-bold mb-4">Expiry Management</h2>
          {expiringItems.length === 0 ? (
            <p className="text-slate-500">No items expiring within the next 30 days.</p>
          ) : (
            <div className="space-y-3">
              {expiringItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">Batch: {item.batch} | Expiry: {new Date(item.expiry).toLocaleDateString()}</p>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700">Discount Sale</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Main', 'Cold Store', 'Branch 2', 'Transit'].map(warehouse => (
            <div key={warehouse} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-lg mb-4">{warehouse}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Items stored:</span><span className="font-semibold">12</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Total value:</span><span className="font-semibold">AED 2,450</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Capacity:</span><span className="font-semibold">85%</span></div>
              </div>
              <button className="mt-4 w-full py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200">View Details</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4">Stock Transfers</h2>
          <p className="text-slate-500 mb-4">No pending transfers.</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">New Transfer</button>
        </div>
      )}
    </div>
  );
}
