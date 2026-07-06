import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus, Tag, CheckCircle2, Ticket } from 'lucide-react';
import { CartItem, Voucher } from '../types';
import { POPULAR_VOUCHERS } from '../data/restaurants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  restaurantName: string;
  deliveryFee: number;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (appliedVoucher: Voucher | null, discountAmount: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  restaurantName,
  deliveryFee,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const platformFee = subtotal > 0 ? 19 : 0;

  // Calculate discount dynamically on the client
  let discountAmount = 0;
  if (appliedVoucher) {
    if (subtotal < appliedVoucher.minSpend) {
      // Auto-invalidate if subtotal drops below limit
      setAppliedVoucher(null);
      setVoucherError(`Minimum spend of Rs. ${appliedVoucher.minSpend} required.`);
    } else {
      if (appliedVoucher.discountType === 'fixed') {
        discountAmount = appliedVoucher.discountValue;
      } else {
        discountAmount = Math.round(subtotal * (appliedVoucher.discountValue / 100));
        if (appliedVoucher.code === 'WELCOME50') {
          discountAmount = Math.min(300, discountAmount); // Cap at Rs 300
        }
      }
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee - discountAmount);

  const handleApplyVoucher = (codeToApply: string) => {
    setVoucherError(null);
    const code = codeToApply.trim().toUpperCase();
    
    if (!code) return;

    const voucher = POPULAR_VOUCHERS.find(v => v.code === code);
    if (!voucher) {
      setVoucherError('Invalid voucher code. Try WELCOME50 or PANDAFREE.');
      setAppliedVoucher(null);
      return;
    }

    if (subtotal < voucher.minSpend) {
      setVoucherError(`Min. spend of Rs. ${voucher.minSpend} required for this code.`);
      setAppliedVoucher(null);
      return;
    }

    setAppliedVoucher({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minSpend: voucher.minSpend,
      description: voucher.description
    });
    setVoucherCode('');
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-white flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-base font-black text-gray-900 font-sans flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D70F64]" />
                Your Basket
              </h2>
              {cartItems.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 font-semibold">from {restaurantName}</p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cartItems.length > 0 ? (
              <>
                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item.foodItem.id}
                      className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 text-sm"
                    >
                      {/* Left: Quantity and details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-xs truncate mb-0.5">
                          {item.foodItem.name}
                        </h4>
                        {item.customization && (
                          <p className="text-[11px] text-gray-400 italic font-medium leading-tight mb-2">
                            "{item.customization}"
                          </p>
                        )}
                        <span className="text-xs font-black text-[#D70F64] font-sans">
                          Rs. {item.foodItem.price}
                        </span>
                      </div>

                      {/* Right: Quantity controls & Delete */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5 border border-gray-100 rounded-lg p-0.5 bg-gray-50">
                          <button
                            onClick={() => onUpdateQuantity(item.foodItem.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:bg-white text-gray-500 rounded-md transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs text-gray-700 w-3 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.foodItem.id, item.quantity + 1)}
                            className="p-1 hover:bg-white text-gray-500 rounded-md transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.foodItem.id)}
                          className="text-gray-300 hover:text-[#D70F64] p-1.5 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voucher Code System */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-[#D70F64]" />
                    Promotions & Vouchers
                  </h4>

                  {appliedVoucher ? (
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 flex items-center justify-between text-xs text-[#D70F64]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Voucher Applied: {appliedVoucher.code}</p>
                          <p className="text-[10px] text-pink-600/90">{appliedVoucher.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-xs font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter voucher (e.g. WELCOME50)"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          className="flex-1 border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] uppercase text-gray-800"
                        />
                        <button
                          onClick={() => handleApplyVoucher(voucherCode)}
                          className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {voucherError && (
                        <p className="text-[11px] text-red-600 font-semibold">{voucherError}</p>
                      )}
                    </>
                  )}

                  {/* Quick voucher clickable items */}
                  {!appliedVoucher && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold mb-2">TAP TO APPLY VOUCHERS:</p>
                      <div className="space-y-1.5">
                        {POPULAR_VOUCHERS.map((v) => {
                          const spendMet = subtotal >= v.minSpend;
                          return (
                            <button
                              key={v.code}
                              onClick={() => spendMet && handleApplyVoucher(v.code)}
                              disabled={!spendMet}
                              className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                                spendMet
                                  ? 'border-dashed border-pink-300 hover:bg-pink-50 text-gray-800 cursor-pointer'
                                  : 'border-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-xs">
                                <Ticket className={`w-3.5 h-3.5 ${spendMet ? 'text-[#D70F64]' : 'text-gray-300'}`} />
                                <span className="font-bold">{v.code}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {v.description.split('on')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost Calculations */}
                <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-gray-900">Rs. {deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-bold text-gray-900">Rs. {platformFee}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-[#D70F64] font-bold">
                      <span>Voucher Discount</span>
                      <span>- Rs. {discountAmount}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 my-1" />
                  <div className="flex justify-between text-base font-black text-gray-900 font-sans">
                    <span>Total (Incl. VAT)</span>
                    <span>Rs. {grandTotal}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-pink-50 p-6 rounded-full text-[#D70F64] mb-4">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5px]" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">Your cart is empty</h3>
                <p className="text-gray-400 text-xs max-w-[200px] leading-relaxed mx-auto">
                  Add items from your favorite restaurants to place an order.
                </p>
              </div>
            )}
          </div>

          {/* Footer Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-lg">
              <button
                onClick={() => onCheckout(appliedVoucher, discountAmount)}
                className="w-full bg-[#D70F64] hover:bg-[#b50b52] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#D70F64]/20 flex items-center justify-between px-6 cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-[10px] text-white/80 block font-normal uppercase tracking-wider">Total amount</span>
                  <span className="text-sm font-black font-sans">Rs. {grandTotal}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>Go to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
