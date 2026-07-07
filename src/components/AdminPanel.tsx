import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, Volume2, ShieldAlert, Zap, Clock, ShieldCheck,
  ToggleLeft, ToggleRight, Trash2, Sliders, RefreshCw, Layers, Star, MessageSquare, Building2
} from 'lucide-react';
import { Order, Restaurant } from '../types';

interface AdminPanelProps {
  onBack: () => void;
  onTriggerNotification: (title: string, message: string, type: 'info' | 'success' | 'order') => void;
  restaurants: Restaurant[];
}

export default function AdminPanel({ onBack, onTriggerNotification, restaurants }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // Tab within the overlook
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'reviews' | 'restaurants'>('orders');

  // Admin notification settings
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [riderSpeedModifier, setRiderSpeedModifier] = useState<number>(3); // default 3x speed for easy demoing
  const [autoStatusAdvance, setAutoStatusAdvance] = useState(false);

  useEffect(() => {
    // Read current settings from localStorage
    const savedSounds = localStorage.getItem('admin_sounds_enabled');
    const savedPush = localStorage.getItem('admin_push_enabled');
    const savedSpeed = localStorage.getItem('admin_rider_speed_modifier');
    const savedAuto = localStorage.getItem('admin_auto_advance');

    if (savedSounds !== null) setSoundsEnabled(savedSounds === 'true');
    if (savedPush !== null) setPushNotifications(savedPush === 'true');
    if (savedSpeed !== null) setRiderSpeedModifier(parseInt(savedSpeed));
    if (savedAuto !== null) setAutoStatusAdvance(savedAuto === 'true');

    // Subscribe to Firestore orders live stream
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error in AdminPanel:", error);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // Subscribe to reviews live stream
    const reviewsQ = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribeReviews = onSnapshot(reviewsQ, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setReviews(fetched);
      setReviewsLoading(false);
    }, (err) => {
      console.error("Error streaming reviews in AdminPanel:", err);
      setReviewsLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'reviews');
    });

    return () => {
      unsubscribeOrders();
      unsubscribeReviews();
    };
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this customer review? This will remove it from customer details.")) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        onTriggerNotification("Review Deleted ⚙️", "Feedback removed from database.", "info");
      } catch (err) {
        console.error("Error deleting review:", err);
      }
    }
  };

  const saveSetting = (key: string, value: any) => {
    localStorage.setItem(key, String(value));
    onTriggerNotification(
      "Configuration Saved! ⚙️",
      `Setting updated: ${key.replace('admin_', '').toUpperCase()} changed to ${value}`,
      'success'
    );
  };

  const handleToggleSounds = () => {
    const newVal = !soundsEnabled;
    setSoundsEnabled(newVal);
    saveSetting('admin_sounds_enabled', newVal);
  };

  const handleTogglePush = () => {
    const newVal = !pushNotifications;
    setPushNotifications(newVal);
    saveSetting('admin_push_enabled', newVal);
  };

  const handleSpeedChange = (speed: number) => {
    setRiderSpeedModifier(speed);
    saveSetting('admin_rider_speed_modifier', speed);
  };

  const handleToggleAutoAdvance = () => {
    const newVal = !autoStatusAdvance;
    setAutoStatusAdvance(newVal);
    saveSetting('admin_auto_advance', newVal);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Wipe this order completely from Firestore? This is irreversible.")) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        onTriggerNotification("Order Erased ⚙️", "Order wiped from live DB.", "info");
      } catch (e) {
        console.error(e);
        handleFirestoreError(e, OperationType.DELETE, 'orders/' + orderId);
      }
    }
  };

  // Calculations
  const totalRevenue = orders.reduce((acc, order) => {
    if (order.status === 'delivered') {
      return acc + (order.total || 0);
    }
    return acc;
  }, 0);

  const pendingCount = orders.filter(o => o.status !== 'delivered').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner */}
        <div className="bg-indigo-900 text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-indigo-900/15">
          <div>
            <span className="bg-white/20 text-white font-bold px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase inline-block mb-3">
              Admin Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              foodpanda System Administrator
            </h1>
            <p className="text-indigo-100 text-xs mt-1">
              Override notification rates, test push engines, and oversee direct cloud transactions.
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-6 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
          >
            Back to App View
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Gross Delivered Volume</p>
                <h3 className="text-2xl font-black text-gray-900 mt-2">Rs. {totalRevenue.toLocaleString()}</h3>
              </div>
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Active Pipeline</p>
                <h3 className="text-2xl font-black text-gray-900 mt-2">{pendingCount} Active</h3>
              </div>
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl animate-pulse">
                <Clock className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Delivered Orders</p>
                <h3 className="text-2xl font-black text-gray-900 mt-2">{completedCount} Orders</h3>
              </div>
              <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Live Database Count</p>
                <h3 className="text-2xl font-black text-gray-900 mt-2">{orders.length} Rows</h3>
              </div>
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Section (1 col) */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-1">
                <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                Notification & Speed Controls
              </h3>
              <p className="text-[11px] text-gray-400">
                Adjust how customer push-alerts, alerts sounds, and rider delivery simulators behave.
              </p>
            </div>

            <div className="space-y-4 border-t border-gray-50 pt-4">
              {/* Sounds Toggle */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Order Alert Audio Sounds</h4>
                  <p className="text-[10px] text-gray-400">Play ping & chime sound alerts on events</p>
                </div>
                <button onClick={handleToggleSounds} className="cursor-pointer">
                  {soundsEnabled ? (
                    <ToggleRight className="w-10 h-10 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Push Toggles */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Simulated Desktop Push Banners</h4>
                  <p className="text-[10px] text-gray-400">Show floating push banners at top of viewport</p>
                </div>
                <button onClick={handleTogglePush} className="cursor-pointer">
                  {pushNotifications ? (
                    <ToggleRight className="w-10 h-10 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>

              {/* Simulation Rider speed multiplier */}
              <div className="py-2 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Rider Map Speed Multiplier</h4>
                  <p className="text-[10px] text-gray-400">Control how fast the rider reaches destination on map</p>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl">
                  {[1, 2, 3, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        riderSpeedModifier === speed 
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {speed}x {speed === 3 ? '(Opt)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Pipeline state advance */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Auto Kitchen status transitions</h4>
                  <p className="text-[10px] text-gray-400">Auto-increment order pipeline step on map tracking</p>
                </div>
                <button onClick={handleToggleAutoAdvance} className="cursor-pointer">
                  {autoStatusAdvance ? (
                    <ToggleRight className="w-10 h-10 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Activity listing (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Live Database Overlook</h3>
                <p className="text-[11px] text-gray-400">Monitor and delete system-wide live records instantly.</p>
              </div>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                SYNCED LIVE
              </span>
            </div>

            {/* Sub-tab selection */}
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 gap-1">
              <button
                onClick={() => setAdminSubTab('orders')}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  adminSubTab === 'orders' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setAdminSubTab('reviews')}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  adminSubTab === 'reviews' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setAdminSubTab('restaurants')}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  adminSubTab === 'restaurants' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Restaurants ({restaurants.length})
              </button>
            </div>

            {/* Sub-tab content */}
            {adminSubTab === 'orders' && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Loading database...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-xs italic">No entries in order database.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50/60 border border-gray-100 rounded-xl flex justify-between items-start gap-4">
                      <div className="min-w-0 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-gray-700 bg-white border border-gray-150 px-1 rounded">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-gray-400">at</span>
                          <span className="font-bold text-gray-800">{order.restaurantName}</span>
                        </div>
                        
                        <p className="text-gray-500 mt-1.5 leading-normal truncate">
                          <strong>Deliver to:</strong> {order.address}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-gray-400">
                          <span>{order.userEmail}</span>
                          <span>•</span>
                          <span>Rs. {order.total}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-600 bg-indigo-50/50 px-1 rounded uppercase">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Erase order permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {adminSubTab === 'reviews' && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-xs italic">No customer reviews submitted yet.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-gray-50/60 border border-gray-100 rounded-xl flex justify-between items-start gap-4">
                      <div className="min-w-0 text-xs flex-1">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-800">{rev.reviewerName}</span>
                          <span className="text-gray-400 font-mono text-[9px]">{rev.reviewerEmail}</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase">For: {rev.restaurantName}</p>
                        <p className="text-gray-600 italic mt-1 font-serif text-xs leading-normal">
                          "{rev.comment}"
                        </p>
                        <div className="flex items-center gap-1 text-amber-600 font-black text-[10px] mt-2">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Rating: {rev.rating}/5</span>
                          <span className="text-gray-300 mx-1">•</span>
                          <span className="text-gray-400 font-normal">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete customer feedback"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {adminSubTab === 'restaurants' && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {restaurants.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-xs italic">No active restaurants found.</p>
                ) : (
                  restaurants.map((res) => (
                    <div key={res.id} className="p-4 bg-gray-50/60 border border-gray-100 rounded-xl flex items-center gap-4">
                      <img
                        src={res.image}
                        alt={res.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-150"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 text-xs flex-1">
                        <h4 className="font-bold text-gray-950 truncate text-xs">{res.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{res.cuisine}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <span className="font-bold text-indigo-600 bg-indigo-50/65 px-1.5 py-0.5 rounded uppercase font-sans">
                            {res.menu.length} Dishes
                          </span>
                          <span>•</span>
                          <span>Rating: {res.rating.toFixed(1)} ⭐</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
