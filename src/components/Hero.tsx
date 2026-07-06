import React, { useState } from 'react';
import { Search, MapPin, Compass } from 'lucide-react';

interface HeroProps {
  onAddressSubmit: (address: string) => void;
  currentAddress: string;
}

export default function Hero({ onAddressSubmit, currentAddress }: HeroProps) {
  const [address, setAddress] = useState(currentAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAddressSubmit(address);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Simulated reverse geocoding for Pakistani locations for realism
          const simulatedAddresses = [
            "F-7 Markaz, Islamabad, Pakistan",
            "Gulshan-e-Iqbal Block 5, Karachi, Pakistan",
            "DHA Phase 5, Lahore, Pakistan",
            "Bahria Town Phase 4, Rawalpindi, Pakistan",
            "Clifton Block 3, Karachi, Pakistan"
          ];
          const randomAddress = simulatedAddresses[Math.floor(Math.random() * simulatedAddresses.length)];
          setAddress(randomAddress);
          onAddressSubmit(randomAddress);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not retrieve current location. Please type your delivery address.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="relative bg-gray-50 overflow-hidden py-16 sm:py-24">
      {/* Background Graphic Accents */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:block overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-[#D70F64]/5 rounded-full blur-3xl" />
        <img
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800"
          alt="Delicious food background"
          className="w-full h-full object-cover object-center rounded-l-[100px] shadow-2xl brightness-90 saturate-125 translate-x-12 translate-y-6 rotate-2"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-[#D70F64] text-sm font-bold uppercase tracking-widest bg-pink-100/60 px-3 py-1.5 rounded-full inline-block mb-4">
            Hungry? Grab your meal in minutes!
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight font-display leading-none mb-6">
            It's the food you love, <br className="hidden sm:inline" />
            <span className="text-[#D70F64] relative inline-block mt-2">
              delivered.
              <span className="absolute bottom-1 left-0 w-full h-2 bg-[#D70F64]/10 -z-10 rounded-full" />
            </span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
            Order from your favorite local restaurants, bakers, and fast-food joints in Karachi, Lahore, Islamabad, and across Pakistan. Fast, secure, and hot.
          </p>

          {/* Address search box */}
          <form onSubmit={handleSubmit} className="bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl">
            <div className="flex-1 flex items-center gap-2 px-3 border border-gray-100 sm:border-none rounded-xl sm:rounded-none h-12 bg-gray-50 sm:bg-transparent">
              <MapPin className="w-5 h-5 text-[#D70F64] flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your street address, city..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-gray-400 hover:text-[#D70F64] p-1 rounded-md hover:bg-pink-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Locate Me"
              >
                <Compass className="w-4 h-4" />
                <span className="text-xs font-semibold hidden xs:inline">Locate</span>
              </button>
            </div>
            
            <button
              type="submit"
              className="bg-[#D70F64] hover:bg-[#b50b52] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#D70F64]/20 flex items-center justify-center gap-1.5 cursor-pointer text-sm font-sans"
            >
              <span>Find food</span>
            </button>
          </form>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-4 mt-8 text-xs font-semibold text-gray-500">
            <span>Popular Cities:</span>
            <button type="button" onClick={() => { setAddress("Gulshan-e-Iqbal, Karachi"); onAddressSubmit("Gulshan-e-Iqbal, Karachi"); }} className="bg-white hover:bg-pink-50 hover:text-[#D70F64] hover:border-pink-300 border border-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer">
              Karachi
            </button>
            <button type="button" onClick={() => { setAddress("DHA Phase 5, Lahore"); onAddressSubmit("DHA Phase 5, Lahore"); }} className="bg-white hover:bg-pink-50 hover:text-[#D70F64] hover:border-pink-300 border border-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer">
              Lahore
            </button>
            <button type="button" onClick={() => { setAddress("F-7 Markaz, Islamabad"); onAddressSubmit("F-7 Markaz, Islamabad"); }} className="bg-white hover:bg-pink-50 hover:text-[#D70F64] hover:border-pink-300 border border-gray-200 px-3 py-1.5 rounded-full transition-all cursor-pointer">
              Islamabad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
