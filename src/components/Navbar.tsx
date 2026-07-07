import React from 'react';
import { ShoppingCart, User, LogOut, MapPin, Search, ChevronDown, UserCheck } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface NavbarProps {
  user: any;
  onLoginClick: () => void;
  onCartClick: () => void;
  cartCount: number;
  deliveryAddress: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onSelectAddressClick: () => void;
  onViewChange: (view: any) => void;
}

export default function Navbar({
  user,
  onLoginClick,
  onCartClick,
  cartCount,
  deliveryAddress,
  onSearchChange,
  searchQuery,
  onSelectAddressClick,
  onViewChange
}: NavbarProps) {
  
  const handleLogout = async () => {
    try {
      localStorage.removeItem('fp_local_user');
      await auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Delivery Address */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-[#D70F64] rounded-full flex items-center justify-center shadow-md shadow-[#D70F64]/10">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" className="hidden"/>
                {/* Simplified cute panda silhouette */}
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
                <path d="M12 14c1.5 0 2.5-1 2.5-2H9.5c0 1 1 2 2.5 2z" />
                <circle cx="7" cy="7" r="2.5" />
                <circle cx="17" cy="7" r="2.5" />
              </svg>
            </div>
            <span className="text-[#D70F64] font-black text-2xl tracking-tight hidden sm:inline-block font-display">foodpanda</span>
          </div>

          {/* Delivery Address Selector */}
          <button 
            onClick={onSelectAddressClick}
            className="flex items-center gap-1.5 text-left max-w-[200px] sm:max-w-xs p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
          >
            <div className="bg-pink-50 p-1.5 rounded-lg text-[#D70F64]">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="hidden xs:block">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deliver to</p>
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight flex items-center gap-1">
                {deliveryAddress || "Select Delivery Address"}
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#D70F64] transition-colors" />
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#D70F64] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right: Auth, Language, Cart */}
        <div className="flex items-center gap-4">
          
          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onViewChange('admin-panel')}
                  className="hidden xs:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  <span>👑 Admin Hub</span>
                </button>
              )}
              {user.role === 'owner' && (
                <button
                  type="button"
                  onClick={() => onViewChange('owner-panel')}
                  className="hidden xs:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  <span>👨‍🍳 Owner Hub</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <div className="w-6 h-6 bg-[#D70F64]/10 text-[#D70F64] rounded-full flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                  {user.displayName || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-[#D70F64] hover:bg-pink-50/50 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 border border-[#D70F64] text-[#D70F64] hover:bg-[#D70F64] hover:text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

          {/* Cart Icon Button */}
          <button
            onClick={onCartClick}
            className="relative bg-[#D70F64] hover:bg-[#b50b52] text-white p-3 rounded-xl transition-all shadow-md shadow-[#D70F64]/20 cursor-pointer group hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#D70F64] text-[10px] font-black rounded-full h-5 min-w-5 flex items-center justify-center px-1 border-2 border-[#D70F64] animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile search bar (below nav header) */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#D70F64] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>
    </header>
  );
}
