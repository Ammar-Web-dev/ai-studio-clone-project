import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Clock, Bike, ShoppingBag, Search, CheckCircle2, ChevronRight, Info, Heart, Minus, Plus } from 'lucide-react';
import { Restaurant, FoodItem, CartItem } from '../types';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
  onAddToCart: (item: FoodItem, quantity: number, customization?: string) => void;
  cartItems: CartItem[];
}

export default function RestaurantDetail({ restaurant, onBack, onAddToCart, cartItems }: RestaurantDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingItem, setCustomizingItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [favorite, setFavorite] = useState(false);

  // Extract all categories in this restaurant's menu
  const categories = useMemo(() => {
    const list = new Set<string>();
    restaurant.menu.forEach((item) => list.add(item.category));
    return ['All', ...Array.from(list)];
  }, [restaurant]);

  // Filter menu items by category and search query
  const filteredMenu = useMemo(() => {
    return restaurant.menu.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [restaurant, selectedCategory, searchQuery]);

  const handleOpenCustomize = (item: FoodItem) => {
    setCustomizingItem(item);
    setQuantity(1);
    setCustomizationText('');
  };

  const handleAddConfirm = () => {
    if (customizingItem) {
      onAddToCart(customizingItem, quantity, customizationText.trim() || undefined);
      setCustomizingItem(null);
    }
  };

  // Helper to count how many of an item are in the cart
  const getItemCartQuantity = (itemId: string) => {
    return cartItems
      .filter((ci) => ci.foodItem.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* 1. Hero Header Banner */}
      <div className="relative h-64 sm:h-80 bg-gray-900 overflow-hidden text-white">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <button
            onClick={onBack}
            className="bg-white/95 backdrop-blur-xs hover:bg-white text-gray-800 p-2.5 rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setFavorite(!favorite)}
            className="bg-white/95 backdrop-blur-xs hover:bg-white text-gray-800 p-2.5 rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105"
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-[#D70F64] text-[#D70F64]' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Bottom Details Overlaid */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] bg-[#D70F64] text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
                {restaurant.tags[0]}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
                {restaurant.cuisine} • Delivery by foodpanda
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-semibold bg-black/40 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <div className="flex flex-col items-center">
                <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {restaurant.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400">{restaurant.reviewsCount}+ reviews</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-white text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#D70F64]" />
                  {restaurant.deliveryTime}
                </span>
                <span className="text-[10px] text-gray-400">Delivery Time</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  Rs. {restaurant.deliveryFee}
                </span>
                <span className="text-[10px] text-gray-400">Delivery Fee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs sticky top-24">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Categories</h3>
              <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex-shrink-0 lg:flex-shrink ${
                        isActive
                           ? 'bg-pink-50 text-[#D70F64] border-l-4 border-[#D70F64] pl-3'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Menu Search and Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
                </h2>
                <p className="text-xs text-gray-500">Showing {filteredMenu.length} items in menu</p>
              </div>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#D70F64] text-gray-800"
                />
              </div>
            </div>

            {/* Menu Grid */}
            {filteredMenu.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenu.map((item) => {
                  const cartQty = getItemCartQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-300 flex justify-between gap-4 relative group"
                    >
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {item.isPopular && (
                              <span className="bg-amber-50 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
                                Popular
                              </span>
                            )}
                            {item.isVegetarian && (
                              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
                                Veg
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#D70F64] transition-colors mb-1">
                            {item.name}
                          </h4>
                          
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        <span className="text-sm font-black text-gray-900 font-sans">
                          Rs. {item.price}
                        </span>
                      </div>

                      {/* Right: Food Image and Quick Plus Button */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Quick Add Overlay Icon */}
                        <button
                          onClick={() => handleOpenCustomize(item)}
                          className="absolute bottom-2 right-2 bg-white hover:bg-pink-50 text-[#D70F64] border border-gray-100 rounded-full p-2 hover:scale-110 shadow-lg cursor-pointer flex items-center justify-center transition-all"
                        >
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        </button>

                        {/* Cart count status badge */}
                        {cartQty > 0 && (
                          <div className="absolute top-2 right-2 bg-[#D70F64] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                            {cartQty}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 mb-1">No dishes found</h4>
                <p className="text-gray-500 text-xs max-w-xs mx-auto">
                  We couldn't find any dishes matching "{searchQuery}" in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Customization Modal / Drawer */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Top Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{customizingItem.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{customizingItem.description}</p>
              
              {/* Special Instructions Input */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Special Instructions
                </label>
                <textarea
                  placeholder="E.g. Make it extra spicy, no onions, sauce on the side, etc."
                  value={customizationText}
                  onChange={(e) => setCustomizationText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#D70F64] h-20 resize-none text-gray-800 bg-gray-50"
                />
              </div>

              {/* Bottom Quantity Selector & Pricing */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-1 bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-white text-gray-500 hover:text-gray-800 rounded-lg transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm text-gray-800 w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 hover:bg-white text-gray-500 hover:text-gray-800 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Confirm Add */}
                <button
                  onClick={handleAddConfirm}
                  className="bg-[#D70F64] hover:bg-[#b50b52] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md shadow-[#D70F64]/10 cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to cart (Rs. {customizingItem.price * quantity})</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
