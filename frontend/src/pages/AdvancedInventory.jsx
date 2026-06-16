
import React, { useMemo, useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, Plus, Save, X, Pencil, Camera, Upload, Download, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
          expiry: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
          value: p.price * p.stock
        })));
      } else {
        // Browser mode: load from localStorage or use demo data
        const stored = loadInventoryFromStorage();
        if (stored && stored.length > 0) {
          setInventoryData(stored);
        } else {
          // Try loading from derp_products (POS page stores this)
          const posStored = localStorage.getItem('derp_products');
          if (posStored) {
            try {
              const posProducts = JSON.parse(posStored);
              setInventoryData(posProducts.map(p => ({
                ...p,
                sku: p.barcode || p.sku || '',
                expiry: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
                value: p.price * p.stock,
                minStock: p.minStock || 10,
                maxStock: p.maxStock || 100,
                batch: p.batch || '',
                warehouse: p.warehouse || 'Main',
              })));
            } catch (e) {
              console.error('Failed to parse pos products:', e);
            }
          }
        }
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importFormat, setImportFormat] = useState('csv'); // 'csv' or 'excel'

  const openAddModal = () => {
    setDraft({
      id: Date.now(),
      name: '',
      sku: '',
      barcode: '',
      stock: 0,
      minStock: 10,
      maxStock: 100,
      price: 0,
      image: '',
      expiry: '',
      batch: '',
      warehouse: 'Main',
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setDraft(null);
  };

  const saveNewItem = () => {
    if (!draft || !draft.name || !draft.sku) {
      alert('Please fill in required fields (Name and SKU)');
      return;
    }
    setInventoryData([...inventoryData, draft]);
    closeAddModal();
  };

  const handleBulkImport = () => {
    try {
      const items = JSON.parse(bulkImportData);
      if (!Array.isArray(items)) {
        alert('Invalid format. Please provide a JSON array of items.');
        return;
      }
      const newItems = items.map((item, index) => ({
        ...item,
        id: item.id || Date.now() + index,
        sku: item.sku || item.barcode || '',
        stock: item.stock || 0,
        minStock: item.minStock || 10,
        maxStock: item.maxStock || 100,
        price: item.price || 0,
      }));
      setInventoryData([...inventoryData, ...newItems]);
      setShowBulkImport(false);
      setBulkImportData('');
      alert(`Successfully imported ${newItems.length} items!`);
    } catch (e) {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      // Parse CSV
      reader.onload = (event) => {
        try {
          const results = Papa.parse(event.target.result, { header: true, skipEmptyLines: true });
          if (results.data && Array.isArray(results.data)) {
            const newItems = results.data.map((item, index) => ({
              id: Date.now() + index,
              name: item.Name || item.name || 'Unnamed Item',
              sku: item.SKU || item.sku || item.Barcode || item.barcode || '',
              barcode: item.Barcode || item.barcode || item.SKU || item.sku || '',
              stock: Number(item.Stock || item.stock || 0),
              minStock: Number(item.Min_Stock || item.minStock || 10),
              maxStock: Number(item.Max_Stock || item.maxStock || 100),
              price: Number(item.Price || item.price || 0),
              batch: item.Batch || item.batch || '',
              warehouse: item.Warehouse || item.warehouse || 'Main',
              expiry: item.Expiry || item.expiry || '',
              image: item.Image || item.image || '',
            }));
            setInventoryData([...inventoryData, ...newItems]);
            alert(`Successfully imported ${newItems.length} items from CSV!`);
            setShowBulkImport(false);
          }
        } catch (err) {
          alert('Invalid CSV format. Please check your file.');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Parse Excel
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const results = XLSX.utils.sheet_to_json(firstSheet);
          
          if (results && Array.isArray(results)) {
            const newItems = results.map((item, index) => ({
              id: Date.now() + index,
              name: item.Name || item.name || 'Unnamed Item',
              sku: item.SKU || item.sku || item.Barcode || item.barcode || '',
              barcode: item.Barcode || item.barcode || item.SKU || item.sku || '',
              stock: Number(item.Stock || item.stock || 0),
              minStock: Number(item.Min_Stock || item.minStock || 10),
              maxStock: Number(item.Max_Stock || item.maxStock || 100),
              price: Number(item.Price || item.price || 0),
              batch: item.Batch || item.batch || '',
              warehouse: item.Warehouse || item.warehouse || 'Main',
              expiry: item.Expiry ? (typeof item.Expiry === 'number' ? new Date((item.Expiry - (25567 + 1))*86400*1000).toISOString().split('T')[0] : item.Expiry) : item.expiry || '',
              image: item.Image || item.image || '',
            }));
            setInventoryData([...inventoryData, ...newItems]);
            alert(`Successfully imported ${newItems.length} items from Excel!`);
            setShowBulkImport(false);
          }
        } catch (err) {
          console.error('Import error:', err);
          alert('Invalid Excel format. Please check your file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
    }
    setImportFile(null);
  };

  const handleExport = (format = 'csv') => {
    // Prepare data for export
    const exportData = inventoryData.map(item => ({
      Name: item.name,
      SKU: item.sku || item.barcode || '',
      Barcode: item.barcode || item.sku || '',
      Stock: item.stock || 0,
      Min_Stock: item.minStock || 10,
      Max_Stock: item.maxStock || 100,
      Price: item.price || 0,
      Value: item.value || (item.price * item.stock) || 0,
      Batch: item.batch || '',
      Warehouse: item.warehouse || 'Main',
      Expiry: item.expiry || '',
      Image: item.image || '',
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `inventory-export-${timestamp}`;

    if (format === 'csv') {
      // Export as CSV
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Export as Excel
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

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
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <button 
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2" 
              type="button"
            >
              <Download size={18} /> Export
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-t-2xl flex items-center gap-2"
              >
                <FileText size={16} /> Export as CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-b-2xl flex items-center gap-2"
              >
                <FileSpreadsheet size={16} /> Export as Excel
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2" 
            type="button"
          >
            <Upload size={18} /> Bulk Import
          </button>
          <button 
            onClick={openAddModal}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2" 
            type="button"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>
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
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={18} />
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
                      <td className="px-6 py-4 text-slate-600">{item.batch || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{item.expiry ? new Date(item.expiry).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{item.warehouse || '-'}</td>
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

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-950">Add New Item</h2>
              <button onClick={closeAddModal} className="rounded-2xl p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Product Name *</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g., Arabic Coffee"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">SKU / Barcode *</label>
                  <input
                    type="text"
                    value={draft.sku}
                    onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                    placeholder="e.g., DEM-1001"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price (AED)</label>
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Min Stock Level</label>
                  <input
                    type="number"
                    value={draft.minStock}
                    onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Max Stock Level</label>
                  <input
                    type="number"
                    value={draft.maxStock}
                    onChange={(e) => setDraft({ ...draft, maxStock: Number(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Batch Number</label>
                  <input
                    type="text"
                    value={draft.batch}
                    onChange={(e) => setDraft({ ...draft, batch: e.target.value })}
                    placeholder="e.g., BATCH-2026-001"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Warehouse</label>
                  <input
                    type="text"
                    value={draft.warehouse}
                    onChange={(e) => setDraft({ ...draft, warehouse: e.target.value })}
                    placeholder="e.g., Main Warehouse"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={draft.expiry}
                    onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Image URL</label>
                  <input
                    type="text"
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 border-t border-slate-200 bg-slate-50 p-4 mt-6 justify-end">
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNewItem}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 inline-flex items-center gap-2 justify-center"
              >
                <Save size={16} />
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-950">Bulk Import Items</h2>
              <button onClick={() => setShowBulkImport(false)} className="rounded-2xl p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Format</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setImportFormat('csv')}
                    className={`flex-1 py-3 px-4 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                      importFormat === 'csv'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText size={18} /> CSV
                  </button>
                  <button
                    onClick={() => setImportFormat('excel')}
                    className={`flex-1 py-3 px-4 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                      importFormat === 'excel'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet size={18} /> Excel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload {importFormat === 'csv' ? 'CSV' : 'Excel'} File
                </label>
                <input
                  type="file"
                  accept={importFormat === 'csv' ? '.csv' : '.xlsx,.xls'}
                  onChange={handleFileImport}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Supported formats: {importFormat === 'csv' ? '.csv' : '.xlsx, .xls'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-800 font-medium">Expected Column Headers:</p>
                <div className="mt-2 text-xs text-blue-700 grid grid-cols-2 gap-2">
                  <div>
                    <strong>Required:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Name (or name)</li>
                      <li>SKU / Barcode</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Optional:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Stock, Price</li>
                      <li>Min_Stock, Max_Stock</li>
                      <li>Batch, Warehouse</li>
                      <li>Expiry, Image</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Sample CSV:</p>
                  <pre className="text-[10px] text-blue-700 overflow-x-auto">
{`Name,SKU,Barcode,Stock,Price,Min_Stock,Max_Stock,Batch,Warehouse,Expiry
Arabic Coffee,DEM-1001,123456,50,45.00,10,100,BATCH-001,Main,2027-12-31
Fresh Milk,DEM-1002,789012,100,12.50,20,200,BATCH-002,Main,2026-06-30`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-3 border-t border-slate-200 bg-slate-50 p-4 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
