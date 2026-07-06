import { Restaurant } from '../types';

export const POPULAR_VOUCHERS = [
  {
    code: 'PANDAFREE',
    discountType: 'fixed' as const,
    discountValue: 250,
    minSpend: 1000,
    description: 'Rs. 250 off on orders above Rs. 1000'
  },
  {
    code: 'WELCOME50',
    discountType: 'percentage' as const,
    discountValue: 50,
    minSpend: 600,
    description: '50% off on your order (Up to Rs. 300)'
  },
  {
    code: 'FOODLOVE',
    discountType: 'percentage' as const,
    discountValue: 20,
    minSpend: 500,
    description: '20% off on all food items'
  }
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'kfc-pakistan',
    name: 'KFC',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Fast Food • Burgers • Fried Chicken',
    rating: 4.6,
    reviewsCount: 1250,
    deliveryTime: '20-30 min',
    deliveryFee: 99,
    minOrder: 199,
    featuredItem: 'Mighty Zinger',
    tags: ['Deals', 'Burgers', 'Fried Chicken'],
    menu: [
      {
        id: 'kfc-zinger',
        name: 'Mighty Zinger Combo',
        description: 'Double crispy breast fillet, cheese, spicy mayo, lettuce, regular fries, and a soft drink.',
        price: 890,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
        category: 'Burgers',
        isPopular: true
      },
      {
        id: 'kfc-wings',
        name: 'Hot Wings Bucket (10 Pcs)',
        description: '10 pieces of hot and crispy wings with dip.',
        price: 650,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400',
        category: 'Fried Chicken',
        isPopular: true
      },
      {
        id: 'kfc-twister',
        name: 'Twister Wrap',
        description: '2 crispy tenders wrapped in a warm tortilla with spicy mayo, lettuce, and diced tomatoes.',
        price: 490,
        image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=400',
        category: 'Burgers'
      },
      {
        id: 'kfc-krushers',
        name: 'Krushers Oreo',
        description: 'Chilled creamy beverage blended with real crushed Oreos and chocolate drizzle.',
        price: 320,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
        category: 'Beverages'
      }
    ]
  },
  {
    id: 'kababjees',
    name: 'Kababjees',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Pakistani • BBQ • Traditional',
    rating: 4.5,
    reviewsCount: 3100,
    deliveryTime: '30-40 min',
    deliveryFee: 120,
    minOrder: 499,
    featuredItem: 'Chicken Malai Boti',
    tags: ['BBQ', 'Pakistani', 'Family'],
    menu: [
      {
        id: 'kab-malaiboti',
        name: 'Chicken Malai Boti (Plate)',
        description: '12 pieces of melt-in-the-mouth creamy BBQ chicken, served with salad and special green chutney.',
        price: 1150,
        image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=400',
        category: 'Desi',
        isPopular: true
      },
      {
        id: 'kab-kebab',
        name: 'Beef Seekh Kebab (4 Pcs)',
        description: 'Traditionally spiced minced beef barbecued on open charcoal skewers.',
        price: 790,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
        category: 'Desi',
        isPopular: true
      },
      {
        id: 'kab-karahi',
        name: 'Chicken Karahi (Half)',
        description: 'Fresh chicken cooked in traditional tomato gravy, ginger, garlic, and special spices.',
        price: 1450,
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400',
        category: 'Desi'
      },
      {
        id: 'kab-naan',
        name: 'Garlic Naan',
        description: 'Soft tandoori flatbread topped with minced garlic and butter.',
        price: 110,
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400',
        category: 'Desi'
      }
    ]
  },
  {
    id: 'broadway-pizza',
    name: 'Broadway Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Pizza • Italian • Fast Food',
    rating: 4.4,
    reviewsCount: 890,
    deliveryTime: '25-35 min',
    deliveryFee: 79,
    minOrder: 299,
    featuredItem: 'Dancing Fajita Pizza',
    tags: ['Pizza', 'Italian', 'Deals'],
    menu: [
      {
        id: 'bway-fajita',
        name: 'Dancing Fajita Pizza (10" Medium)',
        description: 'Tender spicy chicken fajita chunks, onions, bell peppers, mozzarella cheese, and Broadway sauce.',
        price: 1290,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
        category: 'Pizzas',
        isPopular: true
      },
      {
        id: 'bway-wicked',
        name: 'Wicked Margherita Pizza',
        description: 'Loaded with premium mozzarella cheese, pure basil oil, and Broadway special marinara.',
        price: 990,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400',
        category: 'Pizzas',
        isVegetarian: true
      },
      {
        id: 'bway-sliders',
        name: 'Stuffed Garlic Sliders',
        description: '4 golden baked garlic buns stuffed with loaded cheese and chicken jalapeño chunks.',
        price: 450,
        image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
        category: 'Pizzas'
      }
    ]
  },
  {
    id: 'savour-foods',
    name: 'Savour Foods',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Traditional • Rice • Pulao Kebab',
    rating: 4.8,
    reviewsCount: 5200,
    deliveryTime: '15-25 min',
    deliveryFee: 60,
    minOrder: 150,
    featuredItem: 'Chicken Pulao Kebab Single',
    tags: ['Value', 'Traditional', 'Biryani'],
    menu: [
      {
        id: 'sav-pulaosingle',
        name: 'Savour Pulao Kebab (Single Plate)',
        description: 'High-quality basmati rice pulao, one chicken piece, two signature shami kebabs, and fresh salad & raita.',
        price: 420,
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=400',
        category: 'Desi',
        isPopular: true
      },
      {
        id: 'sav-pulaodouble',
        name: 'Savour Pulao Kebab (Double)',
        description: 'Double pulao rice served with two full chicken pieces and two delicious shami kebabs.',
        price: 690,
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=400',
        category: 'Desi',
        isPopular: true
      },
      {
        id: 'sav-shami',
        name: 'Extra Shami Kebab',
        description: 'Our signature crispy and savory lentil and chicken blended kebab.',
        price: 90,
        image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=400',
        category: 'Desi'
      },
      {
        id: 'sav-kheer',
        name: 'Traditional Kheer Cup',
        description: 'Rich, slow-cooked rice and milk pudding flavored with cardamom and garnished with almonds.',
        price: 180,
        image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&q=80&w=400',
        category: 'Desserts'
      }
    ]
  },
  {
    id: 'tehzeeb-bakery',
    name: 'Tehzeeb Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Bakery • Desserts • Sweets',
    rating: 4.7,
    reviewsCount: 2800,
    deliveryTime: '20-30 min',
    deliveryFee: 80,
    minOrder: 300,
    featuredItem: 'Pineapple Cake',
    tags: ['Cakes', 'Sweets', 'Snacks'],
    menu: [
      {
        id: 'tz-pinecake',
        name: 'Fresh Pineapple Cake (2 Lbs)',
        description: 'Extremely soft vanilla sponge cake layered with premium cream and sweet juicy pineapple chunks.',
        price: 1450,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=400',
        category: 'Desserts',
        isPopular: true
      },
      {
        id: 'tz-pizzaslice',
        name: 'Tehzeeb Special Pizza Slice',
        description: 'Loaded local-style bakery chicken pizza slice with thick cheese topping.',
        price: 350,
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=400',
        category: 'Pizzas'
      },
      {
        id: 'tz-patties',
        name: 'Chicken Puff Patties (4 Pcs)',
        description: 'Crispy, flaky puff pastry sheets stuffed with minced chicken and baked to perfect golden color.',
        price: 360,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
        category: 'Desi',
        isPopular: true
      },
      {
        id: 'tz-brownie',
        name: 'Fudge Brownie Box (2 Pcs)',
        description: 'Super gooey, dense chocolate fudge brownie topped with dark chocolate chunks.',
        price: 290,
        image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=400',
        category: 'Desserts'
      }
    ]
  },
  {
    id: 'sweet-tooth',
    name: 'Sweet Tooth',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=600',
    cuisine: 'Desserts • Shakes • Ice Cream',
    rating: 4.6,
    reviewsCount: 750,
    deliveryTime: '20-30 min',
    deliveryFee: 110,
    minOrder: 250,
    featuredItem: 'Chocolate Waffles',
    tags: ['Desserts', 'Sweet', 'Shakes'],
    menu: [
      {
        id: 'st-waffles',
        name: 'Nutella Belgian Waffles',
        description: 'Warm, crispy freshly baked Belgian waffles loaded with rich Nutella paste and vanilla scoop.',
        price: 750,
        image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=400',
        category: 'Desserts',
        isPopular: true
      },
      {
        id: 'st-shake',
        name: 'Loaded Lotus Shake',
        description: 'Thick, creamy ice cream milkshake blended with real Lotus Biscoff cookies and caramel syrup.',
        price: 620,
        image: 'https://images.unsplash.com/photo-1534706936160-d5ee67737249?auto=format&fit=crop&q=80&w=400',
        category: 'Beverages',
        isPopular: true
      },
      {
        id: 'st-lava',
        name: 'Molten Lava Cake',
        description: 'Rich dark chocolate cake with a piping-hot, liquid molten chocolate center. Served with ice cream.',
        price: 590,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
        category: 'Desserts'
      }
    ]
  }
];

export const CUISINES_LIST = [
  { name: 'All', icon: 'Utensils' },
  { name: 'Burgers', icon: 'Beef' },
  { name: 'Pizzas', icon: 'Pizza' },
  { name: 'Desi', icon: 'Flame' },
  { name: 'Desserts', icon: 'CakeSlice' },
  { name: 'Beverages', icon: 'CupSoda' }
];
