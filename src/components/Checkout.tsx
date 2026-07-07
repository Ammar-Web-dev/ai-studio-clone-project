import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MapPin, Phone, CreditCard, ShieldCheck, 
  Lock, Calendar, Sparkles, Building2, HelpCircle, Loader2, CheckCircle 
} from 'lucide-react';
import { CartItem, Voucher } from '../types';
import LocationInput from './LocationInput';

interface CheckoutProps {
  cartItems: CartItem[];
  restaurantName: string;
  deliveryFee: number;
  appliedVoucher: Voucher | null;
  discountAmount: number;
  onBack: () => void;
  onOrderCompleted: (orderId: string, txnId: string, deliveryAddress: string, deliveryPhone: string, paymentMethod: 'cod' | 'card') => void;
  userId: string;
  userEmail: string | null;
  restaurantId: string;
  currentAddress: string;
}

export default function Checkout({
  cartItems,
  restaurantName,
  deliveryFee,
  appliedVoucher,
  discountAmount,
  onBack,
  onOrderCompleted,
  userId,
  userEmail,
  restaurantId,
  currentAddress
}: CheckoutProps) {
  const [address, setAddress] = useState(currentAddress);
  const [phone, setPhone] = useState('03001234567'); // Standard format in Pakistan
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  
  // Credit Card States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Cost calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const platformFee = 19;
  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee - discountAmount);

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    let formatted = value;
    if (value.length >= 2) {
      formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(formatted.substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/gi, '');
    setCvv(value.substring(0, 3));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError('Please provide a valid delivery address.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid Pakistani phone number (e.g. 03001234567).');
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s+/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (expiry.length < 5) {
        setError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (cvv.length < 3) {
        setError('Please enter a valid 3-digit CVV pin.');
        return;
      }
    }

    // Begin multi-step Secure Gateway processing simulation
    setProcessing(true);
    try {
      if (paymentMethod === 'card') {
        setProcessingStep('Connecting to secure payment gateway...');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setProcessingStep('Tokenizing card details & validating credentials...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProcessingStep('Contacting your bank for 3D Secure verification...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProcessingStep('Authorizing funds & processing checkout securely...');
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        setProcessingStep('Verifying order parameters & contact info...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProcessingStep('Registering order on foodpanda delivery engine...');
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Hit secure server-side checkout route
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          restaurantId,
          restaurantName,
          items: cartItems.map(item => ({
            itemId: item.foodItem.id,
            name: item.foodItem.name,
            price: item.foodItem.price,
            quantity: item.quantity,
            customization: item.customization
          })),
          subtotal,
          deliveryFee,
          discountApplied: discountAmount,
          total: grandTotal,
          address,
          phone,
          paymentMethod,
          voucherCode: appliedVoucher?.code || undefined,
          paymentCardDetails: paymentMethod === 'card' ? {
            number: cardNumber.substring(0, 4) + ' •••• •••• ' + cardNumber.substring(15), // Safe mask
            expiry
          } : undefined
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onOrderCompleted(data.orderId, data.transactionId, address, phone, paymentMethod);
      } else {
        throw new Error(data.error || 'Server rejected order processing request.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment processing failed. Please check your network.');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* 3D Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 text-white text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-sm w-full bg-white text-gray-900 rounded-3xl p-8 border border-gray-100 shadow-2xl flex flex-col items-center"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-[#D70F64]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base font-black text-gray-900 mb-1">PCI-DSS Secure Checkout</h3>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-6">Secured by SSL Encryption</p>
            
            <p className="text-xs font-semibold text-gray-700 animate-pulse bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl w-full">
              {processingStep}
            </p>

            <span className="text-[10px] text-gray-400 mt-6 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Your actual card credentials are never stored.
            </span>
          </motion.div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurant</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-sans mb-8">
          Secure Checkout
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0 rotate-180" />
            <div>
              <p className="font-bold">Checkout error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Delivery Details & Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery address card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#D70F64]" />
                1. Delivery Location
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Street Address</label>
                <LocationInput
                  value={address}
                  onChange={setAddress}
                  placeholder="Enter complete house number, floor, building, street..."
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800 bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="Ring doorbell, leave with guard, etc."
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#D70F64]" />
                  2. Payment Method
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  SSL Secured
                </span>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    paymentMethod === 'cod'
                      ? 'border-[#D70F64] bg-pink-50/50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight">Pay cash in hand when food is delivered.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    paymentMethod === 'card'
                      ? 'border-[#D70F64] bg-pink-50/50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                    Credit / Debit Card
                    <Sparkles className="w-4 h-4 text-[#D70F64] animate-bounce" />
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight">Secure checkout using Visa, Mastercard.</span>
                </button>
              </div>

              {/* Secure Card Payment Input Forms */}
              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700 pb-2 border-b border-gray-200/50">
                    <ShieldCheck className="w-4 h-4 text-[#D70F64]" />
                    <span>Enter Simulated Card Credentials (PCI Compliant sandbox)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      required={paymentMethod === 'card'}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="E.g. Muhammad Kashif"
                      className="w-full border border-gray-200 bg-white rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required={paymentMethod === 'card'}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full border border-gray-200 bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiration Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full border border-gray-200 bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">CVV Security Pin</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          required={paymentMethod === 'card'}
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full border border-gray-200 bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Order Basket Summary Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider border-b border-gray-50 pb-3">
                Order Summary
              </h3>

              {/* Items checklist */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                {cartItems.map((item) => (
                  <div key={item.foodItem.id} className="flex justify-between items-start text-xs gap-3">
                    <span className="text-gray-500 font-bold flex-shrink-0">{item.quantity}x</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.foodItem.name}</p>
                      {item.customization && (
                        <p className="text-[10px] text-gray-400 italic">"{item.customization}"</p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">Rs. {item.foodItem.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-800">Rs. {deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-bold text-gray-800">Rs. {platformFee}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-[#D70F64] font-bold">
                    <span>Voucher Applied ({appliedVoucher.code})</span>
                    <span>- Rs. {discountAmount}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900 font-sans">
                  <span>Total Amount</span>
                  <span>Rs. {grandTotal}</span>
                </div>
              </div>

              {/* Secure order button */}
              <button
                type="submit"
                className="w-full bg-[#D70F64] hover:bg-[#b50b52] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#D70F64]/20 flex items-center justify-center gap-2 cursor-pointer text-sm mt-4"
              >
                <Lock className="w-4 h-4 fill-white" />
                <span>Place Secure Order</span>
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-normal">
                By placing this order, you agree to foodpanda's Terms & Conditions. All transactions are securely processed.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
