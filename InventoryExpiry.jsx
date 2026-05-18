import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package, Calendar } from 'lucide-react';

export default function InventoryExpiry() {
  const [expiringItems, setExpiringItems] = useState([]);

  useEffect(() => {
    if (window.electron) {
      window.electron.getExpiringProducts().then(setExpiringItems);
    } else {
      // Mock data for Web Version Demo
      setExpiringItems([
        { 
          id: 99, 
          name: 'Demo Milk Carton', 
          stock: 12, unit: 'pcs', 
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ]);
    }
  }, []);

  if (expiringItems.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
      <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <AlertTriangle size={20} />
          <span>Expiry Alerts (Next 30 Days)</span>
        </div>
        <span className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">
          {expiringItems.length} Items
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {expiringItems.map((item) => {
          const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          return (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Package size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">Stock: {item.stock} {item.unit}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-bold ${daysLeft <= 7 ? 'text-red-500' : 'text-amber-600'}`}>
                  <Calendar size={14} />
                  {daysLeft} days left
                </div>
                <div className="text-[10px] text-slate-400">
                  Exp: {new Date(item.expiryDate).toLocaleDateString('en-AE')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 bg-slate-50 text-center">
        <button className="text-blue-600 text-xs font-bold hover:underline">View Full Inventory Report</button>
      </div>
    </div>
  );
}