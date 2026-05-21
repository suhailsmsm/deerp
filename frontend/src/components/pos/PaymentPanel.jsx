import React, { useState } from 'react';
import { Wallet, CreditCard, Building, Smartphone, Split, AED } from 'lucide-react';

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Wallet, color: 'text-emerald-600' },
  { id: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-600' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building, color: 'text-indigo-600' },
  { id: 'apple_pay', label: 'Apple Pay', icon: Smartphone, color: 'text-slate-900' },
  { id: 'google_pay', label: 'Google Pay', icon: Smartphone, color: 'text-blue-500' },
  { id: 'tabby', label: 'Tabby', icon: Split, color: 'text-purple-600' },
  { id: 'tamara', label: 'Tamara', icon: Split, color: 'text-pink-600' },
];

const currencies = [
  { code: 'AED', symbol: 'د.إ', rate: 1 },
  { code: 'USD', symbol: '$', rate: 0.27 },
  { code: 'EUR', symbol: '€', rate: 0.25 },
  { code: 'GBP', symbol: '£', rate: 0.21 },
  { code: 'SAR', symbol: '﷼', rate: 1.02 },
];

export default function PaymentPanel({ 
  total, 
  paymentMethod, 
  setPaymentMethod,
  onPaymentComplete,
  selectedCurrency,
  setSelectedCurrency,
  allowSplit = true 
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [splitPayments, setSplitPayments] = useState([]);
  const [showSplitPayment, setShowSplitPayment] = useState(false);

  const handlePayment = () => {
    onPaymentComplete?.({
      method: paymentMethod,
      currency: selectedCurrency,
      amount: total,
    });
    setShowPanel(false);
  };

  const convertAmount = (amount) => {
    return (amount * selectedCurrency.rate).toFixed(2);
  };

  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { method: 'cash', amount: 0 }]);
  };

  const updateSplitPayment = (index, field, value) => {
    const updated = [...splitPayments];
    updated[index][field] = value;
    setSplitPayments(updated);
  };

  const removeSplitPayment = (index) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const splitTotal = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = total - splitTotal;

  return (
    <>
      {/* Payment Method Selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {paymentMethods.slice(0, 6).map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                paymentMethod === method.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Icon size={20} className={paymentMethod === method.id ? 'text-blue-600' : method.color} />
              <span className="text-[10px] font-semibold">{method.label}</span>
            </button>
          );
        })}
      </div>

      {/* More Payment Methods */}
      <div className="mb-4">
        <button
          onClick={() => setShowPanel(true)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          View All Payment Methods
        </button>
      </div>

      {/* Currency Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-500 mb-2">Currency</label>
        <div className="grid grid-cols-5 gap-2">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => setSelectedCurrency(currency)}
              className={`py-2 rounded-xl border text-sm font-bold transition ${
                selectedCurrency.code === currency.code
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {currency.code}
            </button>
          ))}
        </div>
        {selectedCurrency.code !== 'AED' && (
          <p className="mt-2 text-xs text-slate-500 text-center">
            {selectedCurrency.symbol}{convertAmount(total)} ({selectedCurrency.code})
          </p>
        )}
      </div>

      {/* Split Payment Button */}
      {allowSplit && (
        <button
          onClick={() => setShowSplitPayment(true)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2"
        >
          <Split size={16} /> Split Payment
        </button>
      )}

      {/* Payment Method Modal */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950 mb-4">Payment Methods</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id);
                      setShowPanel(false);
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={24} className={paymentMethod === method.id ? 'text-blue-600' : method.color} />
                    <span className="text-xs font-semibold">{method.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Split Payment Modal */}
      {showSplitPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-950 mb-4 flex items-center gap-2">
              <Split size={20} /> Split Payment
            </h2>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Amount:</span>
                <span className="text-lg font-bold text-slate-900">AED {total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-slate-600">Split Total:</span>
                <span className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  AED {splitTotal.toFixed(2)}
                </span>
              </div>
              {remaining !== 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Remaining:</span>
                  <span className={`text-lg font-bold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    AED {remaining.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {splitPayments.map((split, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={split.method}
                    onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={split.amount || ''}
                    onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => removeSplitPayment(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Wallet size={16} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addSplitPayment}
              className="w-full mb-4 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            >
              + Add Payment Split
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSplitPayment(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Process split payment
                  setShowSplitPayment(false);
                }}
                disabled={splitTotal !== total || splitPayments.length === 0}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
