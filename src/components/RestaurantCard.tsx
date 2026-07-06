import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, Bike, Flame } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  key?: string;
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden cursor-pointer group flex flex-col h-full transition-all duration-300 hover:shadow-lg"
    >
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Promotion tag or delivery time overlay */}
        <div className="absolute top-3 left-3 bg-[#D70F64] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-white" />
          <span>Top Choice</span>
        </div>
        
        {/* Delivery time bottom badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D70F64]" />
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>

      {/* Content details */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Rating and Cuisine */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#D70F64] font-bold tracking-wide uppercase truncate max-w-[70%]">
            {restaurant.cuisine.split('•')[0]}
          </span>
          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md text-yellow-700 font-bold text-xs flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span>{restaurant.rating.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400 font-normal">({restaurant.reviewsCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#D70F64] transition-colors line-clamp-1 mb-1">
          {restaurant.name}
        </h3>
        
        {/* Secondary description */}
        <p className="text-gray-500 text-xs line-clamp-1 mb-4 flex-1">
          {restaurant.cuisine}
        </p>

        {/* Delivery Pricing Bottom Row */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-600">
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rs. {restaurant.deliveryFee === 0 ? 'Free' : restaurant.deliveryFee}</span>
          </span>
          <span className="text-gray-400 font-medium">
            Min. Rs. {restaurant.minOrder}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
