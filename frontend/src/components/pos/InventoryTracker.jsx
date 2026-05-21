import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';

export default function InventoryTracker({ products = [], onProductUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock
  const [editingProduct, setEditingProduct] = useState(null);

  const lowStockThreshold = 10;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = product.stock || 0;
    const matchesFilter = filter === 'all' || 
                         (filter === 'low-stock' && stock > 0 && stock <= lowStockThreshold) ||
                         (filter === 'out-of-stock' && stock === 0);
    
    return matchesSearch && matchesFilter;
  });

  const stockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'In Stock', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  const stats = {
    total: products.length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    inStock: products.filter(p => (p.stock || 0) > lowStockThreshold).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-medium text-blue-700">Total Products</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-700">In Stock</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.inStock}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-medium text-amber-700">Low Stock</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats.lowStock}</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-xs font-medium text-red-700">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or barcode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="all">All Products</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <button className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU/Barcode</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Price</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const status = stockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {product.barcode || product.sku || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${product.stock <= lowStockThreshold ? 'text-amber-600' : 'text-slate-700'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      AED {product.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No products found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
