import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, ShoppingBag, MapPin, Check } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'order';
}

interface NotificationsProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col text-sm"
          >
            {/* Top Pink Line like foodpanda brand */}
            <div className="h-1.5 bg-[#E21B70] w-full" />
            <div className="p-4 flex gap-3 items-start">
              <div className="bg-[#E21B70]/10 text-[#E21B70] p-2 rounded-lg flex-shrink-0">
                {notif.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : notif.type === 'order' ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                    foodpanda <span className="text-[10px] bg-[#E21B70] text-white px-1.5 py-0.2 rounded-full font-medium uppercase tracking-wider">Now</span>
                  </span>
                  <span className="text-xs text-gray-400">just now</span>
                </div>
                <h4 className="font-medium text-gray-800 text-xs mt-1">{notif.title}</h4>
                <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors self-center"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
