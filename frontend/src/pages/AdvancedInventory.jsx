import React, { useMemo, useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, Plus, Save, X, Pencil, Camera } from 'lucide-react';

const loadInventoryFromStorage = () => {
  try {
    const stored = localStorage.getItem('nexapos_inventory');
    return stored ? JSON.parse(stored) : []; // Return empty array if no stored data
  } catch (e) {
    console.error('Failed to load inventory from localStorage:', e);
    return [];
  }
};

const saveInventoryToStorage = (inventory) => {
  try {
    localStorage.setItem('nexapos_inventory', JSON.stringify(inventory));
  } catch (e) {
    console.error('Failed to save inventory to localStorage:', e);
  }
};

export default function AdvancedInventory({ onInventoryUpdate }) {
  const tabKeys = ['overview', 'low-stock', 'expiry', 'warehouses', 'transfers'];
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (window.electron) {
        const products = await window.electron.getProducts();
        // Map database product fields to UI fields (e.g., barcode to sku)
        setInventoryData(products.map(p => ({
          ...p,
          sku: p.barcode,
          expiry: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '', // Format for date input
          value: p.price * p.stock // Calculate value for display
        })));
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    saveInventoryToStorage(inventoryData);
    if (onInventoryUpdate) {
      onInventoryUpdate(inventoryData);
    }
  }, [inventoryData, onInventoryUpdate]);
  const [draft, setDraft] = useState(null);

  const handleImageUpload = (file) => {
    if (!file || !draft) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setDraft({ ...draft, image: reader.result.toString() });
      }
    };
    reader.readAsDataURL(file);
  };

  const lowStockItems = useMemo(
    () => inventoryData.filter((item) => item.stock < item.minStock),
    [inventoryData]
  );

  const expiringItems = useMemo(() => {
    const today = new Date();
    return inventoryData.filter(item => item.expiry).filter((item) => { // Only filter if expiry exists
      const expiry = new Date(item.expiry);
      const daysUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry < 30;
    });
  }, [inventoryData]);

  const totalInventoryValue = useMemo(
    () => inventoryData.reduce((sum, item) => sum + item.value, 0),
    [inventoryData]
  );

  const filteredOverviewItems = useMemo(() => {
    if (!searchTerm.trim()) return inventoryData;
    const q = searchTerm.trim().toLowerCase();
    return inventoryData.filter((item) => {
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.batch.toLowerCase().includes(q);
    });
  }, [inventoryData, searchTerm]);

  const openEditModal = (id) => {
    const item = inventoryData.find((i) => i.id === id);
    if (!item) return;
    setDraft({ ...item });
  };

  const closeEditModal = () => {
    setDraft(null);
  };

  const saveEditModal = async () => {
    if (!draft) return;

    try {
      if (window.electron) {
        // Filter out fields not present in the Prisma schema (minStock, batch, etc.)
        // to prevent database validation errors.
        const updatePayload = {
          id: Number(draft.id),
          name: draft.name,
          barcode: draft.sku,
          category: draft.category,
          stock: Number(draft.stock),
          image: draft.image,
          minStock: Number(draft.minStock),
          maxStock: Number(draft.maxStock),
          batch: draft.batch,
          warehouse: draft.warehouse,
          price: draft.price, // Ensure price is also updated
          // Convert UI string date to ISO string for Prisma compatibility
          expiryDate: draft.expiry ? new Date(draft.expiry).toISOString() : null,
        };

        await window.electron.updateProduct(updatePayload);
      } else {
        console.warn("Running in Browser: Product changes not persisted to database.");
      }
      // Always update local state so the UI reflects changes immediately
      const updated = inventoryData.map((item) => (item.id === draft.id ? { ...draft } : item));
      setInventoryData(updated);
      closeEditModal();
    } catch (error) {
      console.error("Failed to save product changes in Advanced Inventory:", error);
      alert("Note: Changes saved to view but could not be persisted to the database. Ensure the product exists in your Inventory first.");
      closeEditModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track stock, expiry dates, warehouses, and batches across your business.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700" type="button">
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
        {tabKeys.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
            }`}
            type="button"
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

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Product</th>
                    <th className="px-6 py-3 text-left font-semibold">SKU</th>
                    <th className="px-6 py-3 text-left font-semibold">Image</th>
                    <th className="px-6 py-3 text-left font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left font-semibold">Batch</th>
                    <th className="px-6 py-3 text-left font-semibold">Expiry</th>
                    <th className="px-6 py-3 text-left font-semibold">Warehouse</th>
                    <th className="px-6 py-3 text-left font-semibold">Value</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOverviewItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.sku}</td>
                      <td className="px-6 py-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.stock < item.minStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.stock} / {item.maxStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.batch}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(item.expiry).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">{item.warehouse}</td>
                      <td className="px-6 py-4 font-semibold">AED {item.value}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(item.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredOverviewItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                        No items match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">
                      Current: {item.stock} | Minimum: {item.minStock}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(item.id)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700" type="button">
                      Create PO
                    </button>
                  </div>
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
              {expiringItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">
                      Batch: {item.batch} | Expiry: {new Date(item.expiry).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(item.id)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700" type="button">
                      Discount Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Main', 'Cold Store', 'Branch 2', 'Transit'].map((warehouse) => (
            <div key={warehouse} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-lg mb-4">{warehouse}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Items stored:</span>
                  <span className="font-semibold">{inventoryData.filter((i) => i.warehouse === warehouse).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total value:</span>
                  <span className="font-semibold">
                    AED {inventoryData.filter((i) => i.warehouse === warehouse).reduce((s, i) => s + i.value, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Capacity:</span>
                  <span className="font-semibold">85%</span>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold hover:bg-slate-200" type="button">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4">Stock Transfers</h2>
          <p className="text-slate-500 mb-4">No pending transfers.</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700" type="button">
            New Transfer
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">Edit Inventory Item</h2>
                <p className="text-sm text-slate-500">Update details and save changes.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 inline-flex items-center gap-2"
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">SKU</label>
                  <input
                    type="text"
                    value={draft.sku}
                    onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <input
                    type="text"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Warehouse</label>
                  <input
                    type="text"
                    value={draft.warehouse}
                    onChange={(e) => setDraft({ ...draft, warehouse: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Product Image</label>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {draft.image ? (
                        <img src={draft.image} alt={draft.name} className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="text-slate-400" size={24} />
                      )}
                    </div>
                    <label className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Upload a product image to help identify inventory items more quickly.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Batch</label>
                  <input
                    type="text"
                    value={draft.batch}
                    onChange={(e) => setDraft({ ...draft, batch: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry</label>
                  <input
                    type="date"
                    value={draft.expiry}
                    onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Stock</label>
                  <input
                    type="number"
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Min Stock</label>
                  <input
                    type="number"
                    value={draft.minStock}
                    onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Max Stock</label>
                  <input
                    type="number"
                    value={draft.maxStock}
                    onChange={(e) => setDraft({ ...draft, maxStock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Value (AED)</label>
                  <input
                    type="number"
                    value={draft.value}
                    onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditModal}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900 inline-flex items-center gap-2 justify-center"
              >
                <Save size={16} />
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
