import { CakeDocument } from './types';

export const INITIAL_CAKES: Omit<CakeDocument, '_id'>[] = [
  // ==========================================
  // 🎂 13 ARTISANAL CAKES
  // ==========================================
  {
    id: 'pineapple-pastry-01',
    name: 'Pineapple Pastry Cake',
    description: 'Layers of ultra-soft vanilla sponge infused with fresh tropical pineapple compote, whipped dairy cream, and crowned with sweet glazed cherries.',
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Fruit Pastries',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 260 },
      { key: '1kg', price: 470 },
      { key: '2kg', price: 900 }
    ],
    flavours: [
      { key: 'Classic Pineapple', extra: 0 },
      { key: 'Vanilla Pineapple Cream', extra: 10 },
      { key: 'Extra Fruit Crush', extra: 15 }
    ],
    toppings: [
      { key: 'Glazed Pineapple Chunks', extra: 15 },
      { key: 'Maraschino Cherries', extra: 15 },
      { key: 'White Choco Shavings', extra: 10 },
      { key: 'Choco chips', extra: 10 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 },
      { key: 'Party Popper', extra: 20 }
    ]
  },
  {
    id: 'strawberry-pastry-02',
    name: 'Strawberry Pastry Cake',
    description: 'Airy vanilla chiffon layered with aromatic strawberry crush, silky pink strawberry frosting, and delicate white chocolate swirls.',
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Fruit Pastries',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 260 },
      { key: '1kg', price: 470 },
      { key: '2kg', price: 900 }
    ],
    flavours: [
      { key: 'Classic Strawberry', extra: 0 },
      { key: 'Strawberry Cream Cheese', extra: 15 },
      { key: 'Mixed Berry Swirl', extra: 20 }
    ],
    toppings: [
      { key: 'Fresh Strawberry Glaze', extra: 15 },
      { key: 'White Choco Curls', extra: 15 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Rainbow Sprinkles', extra: 10 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Birthday Hat', extra: 20 }
    ]
  },
  {
    id: 'black-currant-pastry-03',
    name: 'Black Currant Pastry Cake',
    description: 'Rich purple blackcurrant-soaked vanilla sponge with tangy wild berry coulis, smooth whipped frosting, and vibrant berry garnish.',
    images: [
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Fruit Pastries',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 260 },
      { key: '1kg', price: 470 },
      { key: '2kg', price: 900 }
    ],
    flavours: [
      { key: 'Black Currant Classic', extra: 0 },
      { key: 'Vanilla Currant Fusion', extra: 10 },
      { key: 'Dark Berry Ganache', extra: 20 }
    ],
    toppings: [
      { key: 'Blackcurrant Berry Glaze', extra: 15 },
      { key: 'Dark Choco Curls', extra: 15 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Silver Edible Pearls', extra: 10 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'butterscotch-pastry-04',
    name: 'Butterscotch Pastry Cake',
    description: 'Golden moist sponge layered with handcrafted butterscotch cream, crunchy roasted cashew praline, and warm caramel glaze drizzle.',
    images: [
      'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Classic',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 280 },
      { key: '1kg', price: 500 },
      { key: '2kg', price: 960 }
    ],
    flavours: [
      { key: 'Butterscotch Crunch', extra: 0 },
      { key: 'Caramel Fudge', extra: 15 },
      { key: 'Vanilla Butterscotch', extra: 10 }
    ],
    toppings: [
      { key: 'Butterscotch Cashew Praline', extra: 15 },
      { key: 'Toasted Almond Flakes', extra: 20 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Salted Caramel Drizzle', extra: 15 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Party Popper', extra: 20 }
    ]
  },
  {
    id: 'black-forest-05',
    name: 'Traditional Black Forest Cake',
    description: 'Authentic German dark cocoa sponge soaked in cherry syrup, layered with whipped fresh dairy cream, sour cherries, and shaved dark chocolate.',
    images: [
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Chocolate',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 280 },
      { key: '1kg', price: 500 },
      { key: '2kg', price: 960 }
    ],
    flavours: [
      { key: 'Classic Black Forest', extra: 0 },
      { key: 'Extra Cherry Ganache', extra: 20 },
      { key: 'Dark Chocolate Core', extra: 15 }
    ],
    toppings: [
      { key: 'Dark Chocolate Shavings', extra: 15 },
      { key: 'Maraschino Red Cherries', extra: 15 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Oreo Crumbs', extra: 20 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'white-forest-06',
    name: 'Royal White Forest Cake',
    description: 'Velvety vanilla sponge layered with sweetened cherry compote, luscious whipped cream, and covered in snow-white chocolate curls.',
    images: [
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Classic',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 300 },
      { key: '1kg', price: 550 },
      { key: '2kg', price: 1050 }
    ],
    flavours: [
      { key: 'White Forest Classic', extra: 0 },
      { key: 'White Vanilla Cream', extra: 10 },
      { key: 'Raspberry Cherry Infusion', extra: 20 }
    ],
    toppings: [
      { key: 'White Chocolate Curls', extra: 15 },
      { key: 'Candied Cherries', extra: 15 },
      { key: 'Rainbow Sprinkles', extra: 10 },
      { key: 'Silver Sugar Pearls', extra: 10 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Birthday Hat', extra: 20 }
    ]
  },
  {
    id: 'red-velvet-07',
    name: 'Royal Red Velvet Cream Cheese',
    description: 'Luxurious crimson cocoa-buttermilk sponge layered with authentic velvety Philadelphia cream cheese frosting and fine red velvet sponge crumbs.',
    images: [
      'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Classic',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 340 },
      { key: '1kg', price: 620 },
      { key: '2kg', price: 1200 }
    ],
    flavours: [
      { key: 'Red Velvet Cream Cheese', extra: 0 },
      { key: 'Vanilla Cream Frosting', extra: 10 },
      { key: 'Dark Chocolate Core', extra: 20 }
    ],
    toppings: [
      { key: 'Red Velvet Sponge Crumbs', extra: 10 },
      { key: 'White Chocolate Curls', extra: 15 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Ferrero Rocher Crunch', extra: 30 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'honey-almond-08',
    name: 'Honey Almond Delight Cake',
    description: 'Moist vanilla sponge infused with organic wild blossom honey, layered with honey-almond cream, and coated in oven-roasted sliced California almonds.',
    images: [
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Premium',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 370 },
      { key: '1kg', price: 670 },
      { key: '2kg', price: 1300 }
    ],
    flavours: [
      { key: 'Honey Almond', extra: 0 },
      { key: 'Honey Caramel', extra: 15 },
      { key: 'Vanilla Roasted Nut', extra: 10 }
    ],
    toppings: [
      { key: 'Toasted Almond Flakes', extra: 25 },
      { key: 'Caramelised Nuts', extra: 25 },
      { key: 'Wild Honey Drizzle', extra: 15 },
      { key: 'White Choco Chips', extra: 15 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'chocolate-truffle-09',
    name: 'Belgian Chocolate Truffle Cake',
    description: 'Decadent Dutch dark cocoa sponge generously smothered in dense molten Belgian chocolate truffle ganache and glistening dark chocolate glaze.',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Chocolate',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 370 },
      { key: '1kg', price: 670 },
      { key: '2kg', price: 1300 }
    ],
    flavours: [
      { key: 'Pure Belgian Truffle', extra: 0 },
      { key: 'Hazelnut Truffle', extra: 20 },
      { key: 'Espresso Ganache', extra: 20 }
    ],
    toppings: [
      { key: 'Dark Chocolate Chips', extra: 10 },
      { key: 'Oreo Cookie Crumbs', extra: 15 },
      { key: 'Ferrero Rocher Crunch', extra: 30 },
      { key: 'Handcrafted Truffle Balls', extra: 25 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Party Popper', extra: 20 }
    ]
  },
  {
    id: 'choco-almond-10',
    name: 'Choco Almond Crunch Cake',
    description: 'Rich Dutch cocoa sponge loaded with toasted crunchy almonds, smothered in silky dark chocolate fudge and crowned with almond clusters.',
    images: [
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Premium',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 400 },
      { key: '1kg', price: 730 },
      { key: '2kg', price: 1420 }
    ],
    flavours: [
      { key: 'Choco Almond Classic', extra: 0 },
      { key: 'Dark Choco Nut', extra: 15 },
      { key: 'Almond Mocha Fusion', extra: 20 }
    ],
    toppings: [
      { key: 'Roasted Almond Slices', extra: 25 },
      { key: 'Choco chips', extra: 10 },
      { key: 'Dark Choco Curls', extra: 15 },
      { key: 'Almond Praline', extra: 20 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'nutty-bubble-11',
    name: 'Nutty Bubble Celebration Cake',
    description: 'Showstopper celebration cake with crunchy bubble chocolate shell, filled with roasted hazelnuts, walnuts, almonds, and molten hazelnut mousse.',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Specialty',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 470 },
      { key: '1kg', price: 850 },
      { key: '2kg', price: 1650 }
    ],
    flavours: [
      { key: 'Nutty Bubble Special', extra: 0 },
      { key: 'Hazelnut Crunch Core', extra: 20 },
      { key: 'Triple Nut Dark Chocolate', extra: 25 }
    ],
    toppings: [
      { key: 'Mixed Roasted Nuts & Hazelnuts', extra: 30 },
      { key: 'Ferrero Rocher Crunch', extra: 30 },
      { key: 'Bubble Chocolate Shards', extra: 25 },
      { key: 'Choco chips', extra: 10 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Party Popper', extra: 20 },
      { key: 'Birthday Hat', extra: 20 }
    ]
  },
  {
    id: 'ordinary-cake-any-flavor-12',
    name: 'Classic Bakery Sponge Cake (Assorted Flavours)',
    description: 'Traditional soft and fluffy bakery sponge cake available in your choice of classic flavours like Vanilla, Pineapple, Strawberry, or Butterscotch.',
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Classic',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 150 },
      { key: '1kg', price: 260 },
      { key: '2kg', price: 500 }
    ],
    flavours: [
      { key: 'Vanilla', extra: 0 },
      { key: 'Pineapple', extra: 0 },
      { key: 'Strawberry', extra: 0 },
      { key: 'Butterscotch', extra: 10 },
      { key: 'Mango', extra: 10 }
    ],
    toppings: [
      { key: 'Rainbow Sprinkles', extra: 10 },
      { key: 'White Choco Chips', extra: 10 },
      { key: 'Glazed Cherries', extra: 10 },
      { key: 'Cashew Bits', extra: 15 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'ordinary-cake-chocolate-13',
    name: 'Classic Chocolate Bakery Cake',
    description: 'Classic everyday chocolate sponge cake frosted with smooth cocoa cream and chocolate sprinkles — simple, tasty, and economical.',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Chocolate',
    itemType: 'cake',
    weights: [
      { key: '0.5kg', price: 180 },
      { key: '1kg', price: 320 },
      { key: '2kg', price: 620 }
    ],
    flavours: [
      { key: 'Classic Chocolate', extra: 0 },
      { key: 'Dark Chocolate Frosting', extra: 10 },
      { key: 'Choco Vanilla Swirl', extra: 10 }
    ],
    toppings: [
      { key: 'Choco chips', extra: 10 },
      { key: 'Chocolate Vermicelli', extra: 10 },
      { key: 'Oreo Crumb', extra: 15 },
      { key: 'Dark Choco Curls', extra: 15 }
    ],
    addOns: [
      { key: 'Candles', extra: 10 },
      { key: 'Knife', extra: 10 },
      { key: 'Sparkler Candle', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },

  // ==========================================
  // 🍪 6 FRESH BAKED BISCUITS & COOKIES
  // ==========================================
  {
    id: 'biscuit-butter-shortbread-01',
    name: 'Artisan Butter Shortbread Biscuits',
    description: 'Melt-in-your-mouth Scottish style pure butter biscuits with a delicate golden crumb and rich caramelized butter aroma.',
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Butter',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 180 },
      { key: '500g Pack', price: 340 },
      { key: '1kg Box', price: 650 }
    ],
    flavours: [
      { key: 'Pure Butter Original', extra: 0 },
      { key: 'Vanilla Sugar Crust', extra: 10 },
      { key: 'Salted Caramel Butter', extra: 20 }
    ],
    toppings: [
      { key: 'Demerara Sugar Crystals', extra: 10 },
      { key: 'White Choco Drizzle', extra: 15 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'biscuit-choco-chip-02',
    name: 'Choco-Chip Crunch Cookies',
    description: 'Crispy on the edges with chewy centers, packed generously with semi-sweet Belgian chocolate chips and cocoa butter.',
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Chocolate',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 200 },
      { key: '500g Pack', price: 380 },
      { key: '1kg Box', price: 720 }
    ],
    flavours: [
      { key: 'Double Choco Chip', extra: 0 },
      { key: 'Triple Chocolate Noir', extra: 15 },
      { key: 'Hazelnut Choco Chunk', extra: 20 }
    ],
    toppings: [
      { key: 'Extra Dark Choco Chips', extra: 15 },
      { key: 'Sea Salt Flakes', extra: 10 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'biscuit-almond-biscotti-03',
    name: 'Roasted Almond Cantucci Biscotti',
    description: 'Twice-baked Italian style crunchy almond biscotti, infused with Madagascar vanilla and roasted California almond slivers.',
    images: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Nutty',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 220 },
      { key: '500g Pack', price: 420 },
      { key: '1kg Box', price: 800 }
    ],
    flavours: [
      { key: 'Classic Roasted Almond', extra: 0 },
      { key: 'Almond Orange Zest', extra: 15 },
      { key: 'Dark Chocolate Dipped', extra: 25 }
    ],
    toppings: [
      { key: 'Almond Flakes', extra: 15 },
      { key: 'Honey Glaze', extra: 15 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'biscuit-coconut-crunch-04',
    name: 'Desi Ghee Coconut Crunch Cookies',
    description: 'Crisp traditional Indian bakery cookies baked with pure cow ghee and freshly grated toasted coconut.',
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Traditional',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 170 },
      { key: '500g Pack', price: 320 },
      { key: '1kg Box', price: 600 }
    ],
    flavours: [
      { key: 'Toasted Coconut Classic', extra: 0 },
      { key: 'Cardamom Coconut', extra: 10 }
    ],
    toppings: [
      { key: 'Toasted Coconut Flakes', extra: 10 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'biscuit-pista-badam-05',
    name: 'Pista Badam Royal Nankhatai Biscuits',
    description: 'Rich, aromatic cardamom-spiced royal cookies made with fine semolina, pistachios, almonds, and pure clarified butter.',
    images: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Nutty',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 240 },
      { key: '500g Pack', price: 450 },
      { key: '1kg Box', price: 860 }
    ],
    flavours: [
      { key: 'Royal Pista Badam', extra: 0 },
      { key: 'Kesar Pista Infusion', extra: 20 }
    ],
    toppings: [
      { key: 'Pistachio Crumbs', extra: 20 },
      { key: 'Silver Edible Leaf', extra: 20 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  },
  {
    id: 'biscuit-oatmeal-raisin-06',
    name: 'Oatmeal Raisin & Honey Healthy Biscuits',
    description: 'Wholesome rolled oats blended with golden raisins, organic honey, and aromatic cinnamon for a crunchy guilt-free treat.',
    images: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
    ],
    isAvailable: true,
    category: 'Healthy',
    itemType: 'biscuit',
    weights: [
      { key: '250g Pack', price: 190 },
      { key: '500g Pack', price: 360 },
      { key: '1kg Box', price: 680 }
    ],
    flavours: [
      { key: 'Honey Cinnamon Oats', extra: 0 },
      { key: 'Dark Chocolate Cranberry', extra: 20 }
    ],
    toppings: [
      { key: 'Chia & Flax Seeds', extra: 15 },
      { key: 'Golden Raisin Clusters', extra: 15 }
    ],
    addOns: [
      { key: 'Gift Packaging Box', extra: 25 },
      { key: 'Celebration Card', extra: 15 }
    ]
  }
];
