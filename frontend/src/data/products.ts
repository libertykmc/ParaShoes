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
    id: 'ORD-2026-001',
    date: '2026-01-27',
    status: 'Готовится',
    items: [
      {
        productId: '1',
        productName: 'Кроссовки мужские',
        quantity: 1,
        price: 5000,
        size: 42
      }
    ],
    total: 5000
  },
  {
    id: 'ORD-2026-002',
    date: '2026-01-25',
    status: 'Выполнен',
    items: [
      {
        productId: '3',
        productName: 'Обувь для малыша',
        quantity: 1,
        price: 2500,
        size: 34
      },
      {
        productId: '5',
        productName: 'Кроссовки мужские',
        quantity: 1,
        price: 5000,
        size: 42
      }
    ],
    total: 7500
  }
];


