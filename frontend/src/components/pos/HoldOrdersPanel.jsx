import React, { useState } from 'react';
import { PauseCircle, RotateCcw, Clock, User, Table2, X, Trash2 } from 'lucide-react';

export default function HoldOrdersPanel({ 
  heldOrders, 
  onResumeOrder, 
  onEditOrder, 
  onDeleteOrder,
  cart,
  selectedCustomer,
  selectedTable 
}) {
  const [showPanel, setShowPanel] = useState(false);

  const holdCurrentOrder = () => {
    if (!cart || cart.length === 0) {
      alert('Cart is empty. Add items before holding the order.');
      return;
    }

    const hold = {
      id: Date.now(),
      label: `Hold #${heldOrders.length + 1}`,
      items: cart,
      customer: selectedCustomer?.name || 'Walk-in',
      table: selectedTable?.name || null,
      total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
      createdAt: new Date().toLocaleString(),
    };

    onEditOrder(hold);
    setShowPanel(false);
  };

  return (
    <>
      {/* Hold Orders Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 relative"
      >
        <PauseCircle size={18} />
        Hold Orders
        {heldOrders.length > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {heldOrders.length}
          </span>
        )}
      </button>

      {/* Hold Orders Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
                <Clock className="text-amber-600" size={24} />
                Held Orders
              </h2>
              <button onClick={() => setShowPanel(false)} className="rounded-2xl p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Hold Current Order Button */}
            <button
              onClick={holdCurrentOrder}
              className="w-full mb-6 rounded-2xl bg-amber-600 px-4 py-4 text-sm font-semibold text-white hover:bg-amber-700 flex items-center justify-center gap-2"
            >
              <PauseCircle size={18} />
              Hold Current Order
            </button>

            {/* Held Orders List */}
            {heldOrders.length > 0 ? (
              <div className="space-y-3">
                {heldOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-slate-900">{order.label}</span>
                          {order.table && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Table2 size={12} /> {order.table}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <User size={12} /> {order.customer}
                          </p>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <Clock size={12} /> {order.createdAt}
                          </p>
                          <p className="text-xs text-slate-600">
                            {order.items.length} items · <span className="font-semibold text-slate-900">AED {order.total.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onResumeOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Recall
                        </button>
                        <button
                          onClick={() => onEditOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <PauseCircle size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No held orders</p>
                <p className="text-xs text-slate-400 mt-1">Hold an order to save it for later</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
