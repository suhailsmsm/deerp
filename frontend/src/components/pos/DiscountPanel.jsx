import React, { useState } from 'react';
import { Percent, AED, Gift, Tag, X } from 'lucide-react';

export default function DiscountPanel({ 
  subtotal, 
  discount, 
  setDiscount, 
  onApplyDiscount,
  cart 
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  // Available promotions
  const promotions = [
    { code: 'SUMMER20', type: 'percentage', value: 20, description: 'Summer Sale - 20% Off', minAmount: 100 },
    { code: 'WELCOME10', type: 'fixed', value: 10, description: 'First Purchase - AED 10 Off', minAmount: 50 },
    { code: 'BULK15', type: 'percentage', value: 15, description: 'Bulk Buy - 15% Off', minAmount: 200 },
    { code: 'WEEKEND25', type: 'percentage', value: 25, description: 'Weekend Special - 25% Off', minAmount: 150 },
  ];

  const applyDiscount = () => {
    if (discountType === 'percentage') {
      const value = parseFloat(discountValue);
      if (value > 0 && value <= 100) {
        setDiscount({ type: 'percentage', value });
        onApplyDiscount?.({ type: 'percentage', value });
      }
    } else {
      const value = parseFloat(discountValue);
      if (value > 0 && value <= subtotal) {
        setDiscount({ type: 'fixed', value });
        onApplyDiscount?.({ type: 'fixed', value });
      }
    }
    setShowPanel(false);
    setDiscountValue('');
  };

  const applyPromoCode = (promo) => {
    if (subtotal >= promo.minAmount) {
      setDiscount({ type: promo.type, value: promo.value, code: promo.code });
      onApplyDiscount?.({ type: promo.type, value: promo.value, code: promo.code });
      setShowPanel(false);
    } else {
      alert(`Minimum order amount for this promotion is AED ${promo.minAmount}`);
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    setDiscountCode('');
    onApplyDiscount?.(null);
  };

  const discountAmount = discount 
    ? discount.type === 'percentage' 
      ? (subtotal * discount.value / 100)
      : discount.value
    : 0;

  return (
    <>
      {/* Discount Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
      >
        <Gift size={18} />
        {discount ? 'Discount Applied' : 'Add Discount'}
      </button>

      {/* Discount Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
                <Gift className="text-blue-600" size={24} />
                Apply Discount
              </h2>
              <button onClick={() => setShowPanel(false)} className="rounded-2xl p-2 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Current Discount */}
            {discount && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {discount.code || (discount.type === 'percentage' ? `${discount.value}% Off` : `AED ${discount.value} Off`)}
                    </p>
                    <p className="text-xs text-emerald-700">Discount: AED {discountAmount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Discount Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Discount Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`py-3 px-4 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                    discountType === 'percentage'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Percent size={18} /> Percentage
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`py-3 px-4 rounded-2xl border font-semibold flex items-center justify-center gap-2 ${
                    discountType === 'fixed'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <AED size={18} /> Fixed Amount
                </button>
              </div>
            </div>

            {/* Custom Discount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (AED)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter AED'}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 outline-none focus:border-blue-500"
                  min="0"
                  max={discountType === 'percentage' ? '100' : subtotal.toString()}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">
                  {discountType === 'percentage' ? '%' : 'AED'}
                </span>
              </div>
              {discountValue && (
                <p className="mt-2 text-xs text-slate-500">
                  Discount amount: <span className="font-semibold text-slate-900">AED {discountAmount.toFixed(2)}</span>
                </p>
              )}
            </div>

            <button
              onClick={applyDiscount}
              disabled={!discountValue || parseFloat(discountValue) <= 0}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Discount
            </button>

            {/* Available Promotions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Tag size={16} /> Available Promotions
              </h3>
              <div className="space-y-2">
                {promotions.map((promo) => (
                  <button
                    key={promo.code}
                    onClick={() => applyPromoCode(promo)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{promo.description}</p>
                        <p className="text-xs text-slate-500">Code: <span className="font-mono">{promo.code}</span> · Min: AED {promo.minAmount}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {promo.type === 'percentage' ? `${promo.value}% OFF` : `AED ${promo.value} OFF`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
