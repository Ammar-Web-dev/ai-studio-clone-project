import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  ShoppingBag, MapPin, Phone, Clock, ClipboardList, CheckCircle2,
  AlertTriangle, Eye, RefreshCw, Send, Trash2, MailCheck, Plus, Sparkles, AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, Restaurant, FoodItem } from '../types';

interface OwnerPanelProps {
  onBack: () => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'order') => void;
  restaurants: Restaurant[];
  onUpdateRestaurants: (updated: Restaurant[]) => void;
}

export default function OwnerPanel({ onBack, onTriggerNotification, restaurants, onUpdateRestaurants }: OwnerPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [emailLogs, setEmailLogs] = useState<{ id: string; orderId: string; type: string; recipient: string; sentAt: string }[]>([]);
  
  // Dashboard & Menu management mode toggle
  const [panelMode, setPanelMode] = useState<'orders' | 'menu'>('orders');
  const [selectedResId, setSelectedResId] = useState<string>(restaurants[0]?.id || '');
  
  // Menu Item Add Form states
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('Burgers');
  const [itemImage, setItemImage] = useState('');
  const [itemIsPopular, setItemIsPopular] = useState(false);
  const [itemIsVegetarian, setItemIsVegetarian] = useState(false);

  // 1. Fetch orders in real-time using Firestore onSnapshot
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error in OwnerPanel:", error);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Load simulated Gmail log history from localStorage
    const savedLogs = localStorage.getItem('fp_email_logs');
    if (savedLogs) {
      try {
        setEmailLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error(e);
      }
    }

    return () => unsubscribe();
  }, []);

  const triggerGmailNotification = async (order: Order, type: 'confirmed' | 'cancelled' | 'status_update') => {
    const emailSubject = type === 'confirmed' 
      ? `🎉 Foodpanda Order Confirmed - ${order.restaurantName}` 
      : type === 'cancelled' 
      ? `⚠️ Foodpanda Order Cancelled` 
      : `🛵 Foodpanda Order Status: ${order.status.toUpperCase()}`;

    const newLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      orderId: order.id,
      type: type.toUpperCase(),
      recipient: order.userEmail || "customer@foodpanda-clone.pk",
      subject: emailSubject,
      sentAt: new Date().toLocaleTimeString()
    };

    const updatedLogs = [newLog, ...emailLogs].slice(0, 50);
    setEmailLogs(updatedLogs);
    localStorage.setItem('fp_email_logs', JSON.stringify(updatedLogs));

    // Call server API to register email trigger
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          recipient: order.userEmail,
          subject: emailSubject,
          status: order.status,
          type
        })
      });
    } catch (e) {
      console.warn("Gmail API trigger endpoint failed, fallback to interactive simulation log:", e);
    }

    onTriggerNotification(
      "Gmail Received! 📧",
      `A real-time Gmail notification has been dispatched to ${order.userEmail || 'the user'}.`,
      'info'
    );
  };

  // 2. Update order status in Firestore
  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: newStatus });
      
      onTriggerNotification(
        "Status Updated! 📲",
        `Order ${order.id.slice(-5)} updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
        'success'
      );

      // Trigger standard email status notifications automatically
      if (newStatus === 'preparing') {
        triggerGmailNotification(order, 'confirmed');
      } else {
        triggerGmailNotification({ ...order, status: newStatus }, 'status_update');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Could not update status. Please check your Firestore rules.");
      handleFirestoreError(err, OperationType.UPDATE, 'orders/' + order.id);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (window.confirm("Are you sure you want to cancel this order? This will notify the customer via Gmail.")) {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, { status: 'delivered', cancelReason: 'Cancelled by Restaurant' }); // using delivered as end terminal state for simplicity or custom status
        triggerGmailNotification(order, 'cancelled');
      } catch (e) {
        console.error(e);
        handleFirestoreError(e, OperationType.UPDATE, 'orders/' + order.id);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Delete order permanently from database?")) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        onTriggerNotification("Order Deleted 🗑️", "Order permanently wiped from database.", "info");
      } catch (e) {
        console.error(e);
        handleFirestoreError(e, OperationType.DELETE, 'orders/' + orderId);
      }
    }
  };

  const activeRestaurant = restaurants.find(r => r.id === selectedResId) || restaurants[0];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestaurant) {
      alert("No active restaurant selected.");
      return;
    }
    if (!itemName.trim() || !itemPrice.trim()) {
      alert("Please provide an item name and price.");
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price greater than zero.");
      return;
    }

    const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";
    const finalImage = itemImage.trim() || defaultImage;

    const newFoodItem: FoodItem = {
      id: `${activeRestaurant.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: itemName.trim(),
      description: itemDesc.trim() || "Delicious selection fresh from our kitchen.",
      price: priceNum,
      image: finalImage,
      category: itemCategory.trim(),
      isPopular: itemIsPopular,
      isVegetarian: itemIsVegetarian
    };

    const updatedRestaurants = restaurants.map((r) => {
      if (r.id === activeRestaurant.id) {
        return {
          ...r,
          menu: [...r.menu, newFoodItem]
        };
      }
      return r;
    });

    onUpdateRestaurants(updatedRestaurants);
    
    // Reset form
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemImage('');
    setItemIsPopular(false);
    setItemIsVegetarian(false);

    onTriggerNotification(
      "Dish Added! 🍽️",
      `"${newFoodItem.name}" is now available in ${activeRestaurant.name}'s menu.`,
      "success"
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeRestaurant) return;
    
    const itemToRemove = activeRestaurant.menu.find(i => i.id === itemId);
    if (!itemToRemove) return;

    if (window.confirm(`Are you sure you want to remove "${itemToRemove.name}" from the menu?`)) {
      const updatedRestaurants = restaurants.map((r) => {
        if (r.id === activeRestaurant.id) {
          return {
            ...r,
            menu: r.menu.filter((i) => i.id !== itemId)
          };
        }
        return r;
      });

      onUpdateRestaurants(updatedRestaurants);
      onTriggerNotification(
        "Dish Removed 🗑️",
        `"${itemToRemove.name}" has been removed from the menu.`,
        "info"
      );
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return order.status !== 'delivered';
    }
    if (activeTab === 'completed') {
      return order.status === 'delivered';
    }
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner */}
        <div className="bg-emerald-800 text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-900/15">
          <div>
            <span className="bg-white/20 text-white font-bold px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase inline-block mb-3">
              Partner Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              Restaurant Manager Panel
            </h1>
            <p className="text-emerald-100 text-xs mt-1">
              Manage order preparation pipelines, dispatcher assignments, and real-time Gmail customer notifications.
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-6 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
          >
            Switch to Customer View
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setPanelMode('orders')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              panelMode === 'orders'
                ? 'border-[#D70F64] text-[#D70F64]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🛵 Active Orders Pipelines ({orders.length})
          </button>
          <button
            onClick={() => setPanelMode('menu')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              panelMode === 'menu'
                ? 'border-[#D70F64] text-[#D70F64]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🍽️ Manage Restaurant Menus ({restaurants.length})
          </button>
        </div>

        {panelMode === 'orders' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main order view (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Filter Tabs */}
              <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xs max-w-sm">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'all' ? 'bg-[#D70F64] text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'pending' ? 'bg-[#D70F64] text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active ({orders.filter(o => o.status !== 'delivered').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'completed' ? 'bg-[#D70F64] text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Delivered ({orders.filter(o => o.status === 'delivered').length})
                </button>
              </div>

              {loading ? (
                <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#D70F64] animate-spin" />
                  <p className="text-gray-400 text-xs font-medium">Syncing live foodpanda order database...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-[#D70F64]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-gray-800 font-bold text-sm">No active orders found</p>
                  <p className="text-gray-400 text-xs max-w-xs">When customers place orders on checkout, they will stream here in real-time without reloading the page!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative overflow-hidden"
                    >
                      {/* Visual left bar based on status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        order.status === 'received' ? 'bg-blue-500' :
                        order.status === 'preparing' ? 'bg-amber-500' :
                        order.status === 'picked_up' ? 'bg-orange-500' :
                        order.status === 'nearby' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`} />

                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order ID:</span>
                            <span className="text-xs font-mono font-bold text-gray-700 bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded">
                              {order.id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-800 mt-1">
                            From: {order.restaurantName}
                          </h3>
                        </div>

                        {/* Status pill */}
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                          order.status === 'received' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          order.status === 'preparing' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          order.status === 'picked_up' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          order.status === 'nearby' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Order items details */}
                      <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 mb-4 space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ordered Items</p>
                        <div className="divide-y divide-gray-100 text-xs">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="py-1.5 flex justify-between items-center text-gray-700">
                              <span>
                                <strong className="text-gray-900">{item.quantity}x</strong> {item.name}
                                {item.customization && <span className="text-[10px] text-gray-400 italic block">"{item.customization}"</span>}
                              </span>
                              <span className="font-bold text-gray-800">Rs. {item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between text-xs font-bold text-gray-900">
                          <span>Grand Total (Net Paid)</span>
                          <span className="text-[#D70F64]">Rs. {order.total}</span>
                        </div>
                      </div>

                      {/* Delivery & Customer details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 mb-5">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#D70F64] mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-400 uppercase text-[9px]">Delivery Address</p>
                            <p className="font-medium text-gray-700 leading-normal">{order.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-[#D70F64] mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-400 uppercase text-[9px]">Customer Details</p>
                            <p className="font-medium text-gray-700">{order.phone}</p>
                            <p className="text-[10px] text-gray-400">{order.userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pipeline transition buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'received' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'preparing')}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              👨‍🍳 Start Cooking (Confirm Order)
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'picked_up')}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              🛵 Hand Over to Rider (Out for Delivery)
                            </button>
                          )}
                          {order.status === 'picked_up' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'nearby')}
                              className="bg-purple-500 hover:bg-purple-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              📍 Rider Turning Street Corner (Nearby)
                            </button>
                          )}
                          {order.status === 'nearby' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'delivered')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              ✅ Mark Delivered
                            </button>
                          )}
                          
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              Cancel Order ⚠️
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => triggerGmailNotification(order, 'confirmed')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            title="Simulate Dispatching Gmail manually"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Permanently Delete Order document from DB"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Simulated Gmail logs (1 col) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2">
                  <MailCheck className="w-4.5 h-4.5 text-[#D70F64]" />
                  Gmail Outbox Simulator
                </h3>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Whenever you change order statuses, a professional HTML email notification is dispatched to the customer's gmail address.
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {emailLogs.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-xs italic">No emails dispatched yet.</p>
                  ) : (
                    emailLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] space-y-1 relative">
                        <span className={`absolute right-2 top-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          log.type === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                          log.type === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {log.type}
                        </span>
                        
                        <p className="font-bold text-gray-800 truncate pr-16">{log.subject}</p>
                        <p className="text-gray-400">To: <span className="font-mono text-gray-600">{log.recipient}</span></p>
                        <p className="text-[9px] text-gray-400 flex justify-between pt-1">
                          <span>Order: #{log.orderId.slice(-5).toUpperCase()}</span>
                          <span>Sent: {log.sentAt}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Menu Item List for the selected restaurant (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">Current Dishes</h3>
                    <p className="text-xs text-gray-400">Showing {activeRestaurant?.menu?.length || 0} items for {activeRestaurant?.name}</p>
                  </div>
                  
                  {/* Restaurant Selection Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase shrink-0">Select Restaurant:</label>
                    <select
                      value={selectedResId}
                      onChange={(e) => setSelectedResId(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-750 focus:outline-none focus:border-[#D70F64]"
                    >
                      {restaurants.map((res) => (
                        <option key={res.id} value={res.id}>
                          {res.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeRestaurant?.menu?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm italic">No items found in this restaurant's menu.</p>
                    <p className="text-xs mt-1">Add items using the form on the right.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeRestaurant?.menu?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 border border-gray-105 rounded-xl flex gap-3 relative group"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 leading-normal">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-black text-gray-900">Rs. {item.price}</span>
                            <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-150 px-2 py-0.5 rounded uppercase">{item.category}</span>
                          </div>
                        </div>

                        {/* Remove Button overlay */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white border border-red-100 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all shadow-xs opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove from menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Add Menu Item Form (1 col) */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
                <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2 mb-4">
                  <Plus className="w-4.5 h-4.5 text-[#D70F64]" />
                  Add New Dish
                </h3>

                <form onSubmit={handleAddItem} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Dish Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Garlic Cheese Naan, Spicy Burger"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Describe the ingredients, size, prep notes..."
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] h-16 resize-none text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Price (Rs.) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Category</label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] text-gray-700"
                      >
                        <option value="Burgers">Burgers</option>
                        <option value="Fried Chicken">Fried Chicken</option>
                        <option value="Desi">Desi</option>
                        <option value="Pizzas">Pizzas</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Deals">Deals</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      placeholder="Unsplash link or image address"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800 font-mono"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Leave blank to use a default high-quality food graphic.</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-popular"
                        checked={itemIsPopular}
                        onChange={(e) => setItemIsPopular(e.target.checked)}
                        className="rounded border-gray-300 text-[#D70F64] focus:ring-[#D70F64]"
                      />
                      <label htmlFor="chk-popular" className="font-bold text-gray-700 select-none cursor-pointer">
                        Mark as Popular (Featured item)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-veg"
                        checked={itemIsVegetarian}
                        onChange={(e) => setItemIsVegetarian(e.target.checked)}
                        className="rounded border-gray-300 text-[#D70F64] focus:ring-[#D70F64]"
                      />
                      <label htmlFor="chk-veg" className="font-bold text-gray-700 select-none cursor-pointer">
                        Mark as Vegetarian-Safe 🥬
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer flex items-center justify-center gap-1.5 mt-4"
                  >
                    <Sparkles className="w-4 h-4" />
                    Publish Dish to Menu
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
