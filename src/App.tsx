import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './lib/firebase';
import { RESTAURANTS, CUISINES_LIST } from './data/restaurants';
import { Restaurant, FoodItem, CartItem, Voucher } from './types';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RestaurantCard from './components/RestaurantCard';
import RestaurantDetail from './components/RestaurantDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import AuthModal from './components/AuthModal';
import Notifications, { NotificationItem } from './components/Notifications';

// Icons
import { Star, Clock, Bike, Search, MapPin, Grid, Heart, Smile } from 'lucide-react';

export default function App() {
  // Navigation & Screen View
  const [view, setView] = useState<'home' | 'restaurant-detail' | 'checkout' | 'tracking'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Authentication State
  const [user, setUser] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('F-7 Markaz, Islamabad, Pakistan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Checkout Promos
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Completed Order Tracking Details
  const [lastOrderId, setLastOrderId] = useState('');
  const [lastTxnId, setLastTxnId] = useState('');
  const [lastAddress, setLastAddress] = useState('');
  const [lastPhone, setLastPhone] = useState('');
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'cod' | 'card'>('cod');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    // Check if there is a local user saved in localStorage
    const savedLocalUser = localStorage.getItem('fp_local_user');
    if (savedLocalUser) {
      try {
        setUser(JSON.parse(savedLocalUser));
      } catch (e) {
        console.error("Failed to parse local user: ", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // Only clear user state if we don't have a local guest user either
        if (!localStorage.getItem('fp_local_user')) {
          setUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Utility to push an in-app system notification
  const handleTriggerNotification = (title: string, message: string, type: 'info' | 'success' | 'order' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    const newNotification: NotificationItem = { id, title, message, type };
    setNotifications((prev) => [newNotification, ...prev]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      handleDismissNotification(id);
    }, 6000);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Cart Handlers
  const handleAddToCart = (foodItem: FoodItem, quantity: number, customization?: string) => {
    if (!selectedRestaurant) return;

    // Check if adding from a different restaurant
    const isDifferentRestaurant = cart.length > 0 && cart[0].foodItem.id.split('-')[0] !== foodItem.id.split('-')[0];
    
    if (isDifferentRestaurant) {
      const confirmChange = window.confirm("You have items from another restaurant in your basket. Discard those and start a new order?");
      if (!confirmChange) return;
      setCart([]); // Reset basket
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.foodItem.id === foodItem.id && item.customization === customization
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevCart, { foodItem, quantity, customization }];
    });

    handleTriggerNotification(
      "Added to Basket! 🛒",
      `${quantity}x ${foodItem.name} added from ${selectedRestaurant.name}.`,
      'success'
    );
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.foodItem.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prevCart) => {
      const targetItem = prevCart.find((i) => i.foodItem.id === itemId);
      if (targetItem) {
        handleTriggerNotification(
          "Removed Item 🗑️",
          `Removed ${targetItem.foodItem.name} from basket.`,
          'info'
        );
      }
      return prevCart.filter((item) => item.foodItem.id !== itemId);
    });
  };

  // Checkout Redirects
  const handleCheckoutRedirect = (voucher: Voucher | null, discount: number) => {
    if (!user) {
      handleTriggerNotification(
        "Authentication Required 🔒",
        "Please login to foodpanda to proceed with checking out your meal safely.",
        'info'
      );
      setShowAuthModal(true);
      return;
    }
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
    setShowCartDrawer(false);
    setView('checkout');
  };

  const handleOrderCompleted = (
    orderId: string, 
    txnId: string, 
    addr: string, 
    ph: string, 
    method: 'cod' | 'card'
  ) => {
    // Save order fields for invoice tracker
    setLastOrderId(orderId);
    setLastTxnId(txnId);
    setLastAddress(addr);
    setLastPhone(ph);
    setLastPaymentMethod(method);

    // Empty basket & vouchers
    setCart([]);
    setAppliedVoucher(null);
    setDiscountAmount(0);

    // Redirect to real-time maps tracker screen
    setView('tracking');
  };

  const handleSelectAddressClick = () => {
    const newAddr = window.prompt("Enter your street address or landmark in Pakistan:", deliveryAddress);
    if (newAddr && newAddr.trim()) {
      setDeliveryAddress(newAddr.trim());
      handleTriggerNotification("Address Updated 📍", `Deliver to: ${newAddr.trim()}`, 'success');
    }
  };

  // Filtering Logic
  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter((res) => {
      const matchesSearch = 
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCuisine = 
        selectedCuisine === 'All' || 
        res.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()) ||
        res.tags.some(tag => tag.toLowerCase() === selectedCuisine.toLowerCase());

      return matchesSearch && matchesCuisine;
    });
  }, [searchQuery, selectedCuisine]);

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 min-h-screen">
      {/* 1. Global Navigation Navbar */}
      <Navbar
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onCartClick={() => setShowCartDrawer(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        deliveryAddress={deliveryAddress}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectAddressClick={handleSelectAddressClick}
      />

      {/* 2. Page Screens Renderer */}
      <main className="pb-16">
        {view === 'home' && (
          <div>
            {/* Search Hero Banner */}
            <Hero
              currentAddress={deliveryAddress}
              onAddressSubmit={(addr) => {
                setDeliveryAddress(addr);
                handleTriggerNotification("Delivery Location Set 📍", `foodpanda: We will deliver your meal to ${addr}`, 'success');
              }}
            />

            {/* Quick Cuisine Shortcut Categories Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight font-sans mb-6">
                Explore Cuisines in Pakistan
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {CUISINES_LIST.map((cuisine) => {
                  const isActive = selectedCuisine === cuisine.name;
                  return (
                    <button
                      key={cuisine.name}
                      onClick={() => {
                        setSelectedCuisine(cuisine.name);
                        handleTriggerNotification(
                          "Filtering Cuisine",
                          `Showing restaurants categorized under "${cuisine.name}"`,
                          'info'
                        );
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-3 ${
                        isActive
                          ? 'border-[#D70F64] bg-pink-50 text-[#D70F64] shadow-sm'
                          : 'border-gray-150 hover:border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {/* Stylized visual color dot for brand feel */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isActive ? 'bg-[#D70F64] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cuisine.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold font-sans">{cuisine.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Restaurants Grid List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 font-sans">
                    {selectedCuisine === 'All' ? 'Available Restaurants' : `${selectedCuisine} Hotspots`}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Explore delivery hubs near you with live tracking</p>
                </div>
                
                {selectedCuisine !== 'All' && (
                  <button 
                    onClick={() => setSelectedCuisine('All')} 
                    className="text-xs font-bold text-[#D70F64] hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map((res) => (
                    <RestaurantCard
                      key={res.id}
                      restaurant={res}
                      onClick={() => {
                        setSelectedRestaurant(res);
                        setView('restaurant-detail');
                        handleTriggerNotification(
                          "Welcome!",
                          `Entering the menu of ${res.name}`,
                          'info'
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 max-w-lg mx-auto">
                  <div className="text-4xl mb-3">📍</div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">No delivery partners found</h4>
                  <p className="text-gray-500 text-xs leading-normal max-w-xs mx-auto">
                    We couldn't find any delivery partners for "{searchQuery || selectedCuisine}". Try searching for popular tags like Burgers, Pizza, Desi or KFC.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'restaurant-detail' && selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            cartItems={cart}
            onBack={() => setView('home')}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === 'checkout' && selectedRestaurant && (
          <Checkout
            cartItems={cart}
            restaurantName={selectedRestaurant.name}
            restaurantId={selectedRestaurant.id}
            deliveryFee={selectedRestaurant.deliveryFee}
            appliedVoucher={appliedVoucher}
            discountAmount={discountAmount}
            userId={user?.uid || "guest"}
            userEmail={user?.email || null}
            currentAddress={deliveryAddress}
            onBack={() => setView('restaurant-detail')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {view === 'tracking' && selectedRestaurant && (
          <OrderTracking
            orderId={lastOrderId}
            transactionId={lastTxnId}
            deliveryAddress={lastAddress}
            deliveryPhone={lastPhone}
            paymentMethod={lastPaymentMethod}
            restaurantName={selectedRestaurant.name}
            subtotal={cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0)} // fallback for calculation
            deliveryFee={selectedRestaurant.deliveryFee}
            platformFee={19}
            discountAmount={discountAmount}
            grandTotal={Math.max(0, cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0) + selectedRestaurant.deliveryFee + 19 - discountAmount)}
            voucherCode={appliedVoucher?.code}
            onTriggerNotification={handleTriggerNotification}
            onNewOrderClick={() => {
              setSelectedRestaurant(null);
              setView('home');
            }}
          />
        )}
      </main>

      {/* 3. Global CartDrawer */}
      {selectedRestaurant && (
        <CartDrawer
          isOpen={showCartDrawer}
          onClose={() => setShowCartDrawer(false)}
          cartItems={cart}
          restaurantName={selectedRestaurant.name}
          deliveryFee={selectedRestaurant.deliveryFee}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleCheckoutRedirect}
        />
      )}

      {/* 4. Authentications Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          const savedLocalUser = localStorage.getItem('fp_local_user');
          if (savedLocalUser) {
            try {
              setUser(JSON.parse(savedLocalUser));
            } catch (e) {
              console.error(e);
            }
          }
          handleTriggerNotification("Authentication Successful! 🔑", "foodpanda: Welcome to your secure account dashboard.", "success");
        }}
      />

      {/* 5. Simulated Push Notifications Toast List */}
      <Notifications
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
}
