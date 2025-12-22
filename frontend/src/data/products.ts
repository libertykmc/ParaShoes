export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  material: string;
  style: string;
  season: string;
  description: string;
  inStock: boolean;
  sizes: number[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Классические оксфорды',
    price: 12990,
    originalPrice: 15990,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    category: 'Классика',
    material: 'Натуральная кожа',
    style: 'Классика',
    season: 'Осень',
    description: 'Элегантные оксфорды из премиальной натуральной кожи. Идеально подходят для делового стиля.',
    inStock: true,
    sizes: [39, 40, 41, 42, 43, 44, 45]
  },
  {
    id: '2',
    name: 'Зимние ботинки Timber',
    price: 18990,
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
    category: 'Зима',
    material: 'Нубук',
    style: 'Спорт',
    season: 'Зима',
    description: 'Утепленные ботинки из нубука с водоотталкивающим покрытием.',
    inStock: true,
    sizes: [40, 41, 42, 43, 44, 45]
  },
  {
    id: '3',
    name: 'Мокасины Premium',
    price: 9990,
    originalPrice: 12990,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
    category: 'Классика',
    material: 'Натуральная кожа',
    style: 'Классика',
    season: 'Весна',
    description: 'Комфортные мокасины из мягкой натуральной кожи.',
    inStock: true,
    sizes: [39, 40, 41, 42, 43, 44]
  },
  {
    id: '4',
    name: 'Кроссовки Urban',
    price: 14990,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    category: 'Спорт',
    material: 'Натуральная кожа',
    style: 'Спорт',
    season: 'Весна',
    description: 'Стильные спортивные кроссовки для повседневной носки.',
    inStock: true,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45]
  },
  {
    id: '5',
    name: 'Челси замшевые',
    price: 16990,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
    category: 'Осень',
    material: 'Замша',
    style: 'Классика',
    season: 'Осень',
    description: 'Универсальные ботинки челси из премиальной замши.',
    inStock: true,
    sizes: [40, 41, 42, 43, 44, 45]
  },
  {
    id: '6',
    name: 'Лоферы коричневые',
    price: 11990,
    image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&q=80',
    category: 'Классика',
    material: 'Натуральная кожа',
    style: 'Классика',
    season: 'Весна',
    description: 'Классические лоферы для элегантного образа.',
    inStock: false,
    sizes: [39, 40, 41, 42, 43]
  },
  {
    id: '7',
    name: 'Треккинговые ботинки',
    price: 19990,
    originalPrice: 24990,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1542834281-0e5abcbdc5b4?w=800&q=80',
    category: 'Спорт',
    material: 'Нубук',
    style: 'Спорт',
    season: 'Зима',
    description: 'Прочные треккинговые ботинки для активного отдыха.',
    inStock: true,
    sizes: [40, 41, 42, 43, 44, 45, 46]
  },
  {
    id: '8',
    name: 'Дерби классические',
    price: 13990,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    category: 'Классика',
    material: 'Натуральная кожа',
    style: 'Классика',
    season: 'Осень',
    description: 'Традиционные дерби для делового гардероба.',
    inStock: true,
    sizes: [39, 40, 41, 42, 43, 44]
  }
];

export interface Order {
  id: string;
  date: string;
  status: 'Принят' | 'Готовится' | 'Доставляется' | 'Выполнен' | 'Отменён';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    size: number;
  }>;
  total: number;
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    date: '2025-10-20',
    status: 'Доставляется',
    items: [
      {
        productId: '1',
        productName: 'Классические оксфорды',
        quantity: 1,
        price: 12990,
        size: 42
      }
    ],
    total: 12990
  },
  {
    id: 'ORD-2025-002',
    date: '2025-10-15',
    status: 'Выполнен',
    items: [
      {
        productId: '3',
        productName: 'Мокасины Premium',
        quantity: 1,
        price: 9990,
        size: 41
      },
      {
        productId: '5',
        productName: 'Челси замшевые',
        quantity: 1,
        price: 16990,
        size: 42
      }
    ],
    total: 26980
  }
];

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bonusPoints: number;
}

export const mockUser: User = {
  id: 'user-1',
  name: 'Алексей Иванов',
  email: 'alexey@example.com',
  phone: '+7 (999) 123-45-67',
  address: 'г. Москва, ул. Тверская, д. 10, кв. 25',
  bonusPoints: 1250
};
