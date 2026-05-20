import React, { useState } from 'react';
import { ShoppingCart, FileText, Check, AlertCircle, Plus } from 'lucide-react';

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('purchase-orders');
  
  const [purchaseOrders] = useState([
    { id: 'PO-2026-001', supplier: 'Gulf Food Supplies', items: 8, amount: 14500, status: 'Pending Delivery', createdDate: '2026-05-10', expectedDelivery: '2026-05-25' },
    { id: 'PO-2026-002', supplier: 'Desert Dairy', items: 5, amount: 8750, status: 'Approved', createdDate: '2026-05-15', expectedDelivery: '2026-05-28' },
    { id: 'PO-2026-003', supplier: 'Fresh Produce Co.', items: 12, amount: 6200, status: 'Received', createdDate: '2026-05-01', expectedDelivery: '2026-05-18' },
  ]);

  const [rfqs] = useState([
    { id: 'RFQ-001', description: 'Bulk Rice Supply 500kg', suppliers: 3, status: 'Quotes Received', dueDate: '2026-05-22' },
    { id: 'RFQ-002', description: 'Frozen Chicken 100kg', suppliers: 2, status: 'Pending Responses', dueDate: '2026-05-25' },
  ]);

  const [suppliers] = useState([
    { id: 1, name: 'Gulf Food Supplies', contact: '+971-4-XXX-XXXX', rating: 4.8, totalOrders: 12, status: 'Active' },
    { id: 2, name: 'Desert Dairy', contact: '+971-4-XXX-XXXX', rating: 4.5, totalOrders: 8, status: 'Active' },
    { id: 3, name: 'Fresh Produce Co.', contact: '+971-4-XXX-XXXX', rating: 4.2, totalOrders: 15, status: 'Active' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Procurement Management</h1>
          <p className="text-slate-500 mt-1">Purchase orders, RFQ, supplier management, and vendor performance.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Create PO
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Active POs</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{purchaseOrders.filter(po => po.status !== 'Received').length}</p>
          <p className="text-xs text-slate-500 mt-2">Total value: AED {purchaseOrders.filter(po => po.status !== 'Received').reduce((sum, po) => sum + po.amount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Pending Delivery</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{purchaseOrders.filter(po => po.status === 'Pending Delivery').length}</p>
          <p className="text-xs text-slate-500 mt-2">Expected this week: 2</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Active Suppliers</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{suppliers.filter(s => s.status === 'Active').length}</p>
          <p className="text-xs text-slate-500 mt-2">Avg rating: 4.5/5</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Open RFQs</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{rfqs.length}</p>
          <p className="text-xs text-slate-500 mt-2">Quotes: 5 total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['purchase-orders', 'rfq', 'suppliers', 'grn', 'performance'].map(tab => (
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
      {activeTab === 'purchase-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">PO Number</th>
                  <th className="px-6 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-6 py-3 text-left font-semibold">Items</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Expected Delivery</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{po.id}</td>
                    <td className="px-6 py-4">{po.supplier}</td>
                    <td className="px-6 py-4">{po.items} items</td>
                    <td className="px-6 py-4 font-semibold">AED {po.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        po.status === 'Pending Delivery' ? 'bg-orange-100 text-orange-700' :
                        po.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(po.expectedDelivery).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-semibold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'rfq' && (
        <div className="space-y-4">
          {rfqs.map(rfq => (
            <div key={rfq.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{rfq.id}</h3>
                  <p className="text-slate-600">{rfq.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  rfq.status === 'Quotes Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {rfq.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">{rfq.suppliers}</span> suppliers · Due: {new Date(rfq.dueDate).toLocaleDateString()}
                </div>
                <button className="text-blue-600 hover:underline text-sm font-semibold">View Quotes</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-2">{supplier.name}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div><span className="text-slate-600">Contact:</span> <span className="font-medium">{supplier.contact}</span></div>
                <div><span className="text-slate-600">Orders:</span> <span className="font-medium">{supplier.totalOrders}</span></div>
                <div><span className="text-slate-600">Rating:</span> <span className="font-semibold text-yellow-600">★ {supplier.rating}</span></div>
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Create PO</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'grn' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Check size={20} className="text-emerald-600" /> Goods Received Notes
          </h3>
          <div className="space-y-3">
            {[
              { grn: 'GRN-2026-145', po: 'PO-2026-003', supplier: 'Fresh Produce Co.', items: 12, receivedDate: '2026-05-18', status: 'Processed' },
              { grn: 'GRN-2026-144', po: 'PO-2026-001', supplier: 'Gulf Food Supplies', items: 8, receivedDate: '2026-05-16', status: 'Pending QC' },
            ].map((grn, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-sm">{grn.grn}</p>
                  <p className="text-xs text-slate-600">{grn.supplier} · {grn.items} items</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  grn.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {grn.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4">Vendor Performance Tracking</h3>
          <div className="space-y-4">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{supplier.name}</p>
                  <span className="text-sm font-semibold text-yellow-600">★ {supplier.rating}/5</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-slate-600">On-Time Delivery</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1"><div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}} /></div>
                    <p className="text-slate-700 font-semibold mt-1">92%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Quality Score</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1"><div className="bg-emerald-600 h-2 rounded-full" style={{width: '96%'}} /></div>
                    <p className="text-slate-700 font-semibold mt-1">96%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Price Competitiveness</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1"><div className="bg-orange-600 h-2 rounded-full" style={{width: '85%'}} /></div>
                    <p className="text-slate-700 font-semibold mt-1">85%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
