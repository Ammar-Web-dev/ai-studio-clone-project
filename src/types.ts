export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  featuredItem?: string;
  tags: string[];
  menu: FoodItem[];
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  customization?: string;
}

export interface Voucher {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  description: string;
}

export type OrderStatus = 'received' | 'preparing' | 'picked_up' | 'nearby' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  userEmail: string | null;
  restaurantId: string;
  restaurantName: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    customization?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discountApplied: number;
  total: number;
  address: string;
  phone: string;
  paymentMethod: 'cod' | 'card';
  paymentStatus: 'pending' | 'paid' | 'simulated_success';
  status: OrderStatus;
  createdAt: any; // Firestore timestamp
}
