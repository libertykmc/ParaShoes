const API_BASE_URL = 'http://localhost:3000';

export interface BackendProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount: number;
  image?: string;
  quantityInStock: number;
  productStatus: boolean;
  categoryId?: string;
  category?: {
    id: string;
    material: string;
    size: number;
    season: string;
    style: string;
  };
  createdAt: Date;
}

export interface FrontendProduct {
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

// Стандартные размеры для обуви
const DEFAULT_SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];

// Преобразование товара с бэкенда в формат фронтенда
function transformProduct(backendProduct: BackendProduct): FrontendProduct {
  const category = backendProduct.category;
  const hasDiscount = backendProduct.discount > 0;
  const originalPrice = hasDiscount 
    ? Math.round(Number(backendProduct.price) / (1 - backendProduct.discount / 100))
    : undefined;

  // Используем размер из категории как базовый, генерируем диапазон вокруг него
  // Если размера нет, используем дефолтные размеры
  let sizes: number[];
  if (category?.size) {
    const generatedSizes = Array.from({ length: 7 }, (_, i) => category.size - 3 + i)
      .filter(s => s >= 38 && s <= 46);
    sizes = generatedSizes.length > 0 ? generatedSizes : DEFAULT_SIZES;
  } else {
    sizes = DEFAULT_SIZES;
  }

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    price: Number(backendProduct.price),
    originalPrice,
    discount: hasDiscount ? backendProduct.discount : undefined,
    image: backendProduct.image || 'https://via.placeholder.com/800',
    category: category?.season || 'Без категории',
    material: category?.material || 'Не указано',
    style: category?.style || 'Не указано',
    season: category?.season || 'Не указано',
    description: backendProduct.description || 'Описание отсутствует',
    inStock: backendProduct.productStatus && backendProduct.quantityInStock > 0,
    sizes,
  };
}

export async function fetchProducts(): Promise<FrontendProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: BackendProduct[] = await response.json();
    return data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function fetchProductById(id: string): Promise<FrontendProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: BackendProduct = await response.json();
    return transformProduct(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

