const API_BASE_URL = 'http://localhost:3001'

interface NamedEntity {
  id: string
  name: string
}

export interface BackendProductSize {
  id: string
  modelId: string
  size: number
  stock: number
}

export interface BackendProduct {
  id: string
  name: string
  description?: string
  price: number | string
  discount: number | string
  image?: string
  categoryId?: string
  category?: NamedEntity
  materialId?: string
  material?: NamedEntity
  styleId?: string
  style?: NamedEntity
  seasonId?: string
  season?: NamedEntity
  sizes?: BackendProductSize[]
  createdAt: string
}

export interface FrontendProductSize {
  size: number
  stock: number
  available: boolean
}

export interface FrontendProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  category: string
  material: string
  style: string
  season: string
  categoryId?: string
  materialId?: string
  styleId?: string
  seasonId?: string
  description: string
  inStock: boolean
  sizes: FrontendProductSize[]
}

function transformProduct(backendProduct: BackendProduct): FrontendProduct {
  const discount = Number(backendProduct.discount || 0)
  const price = Number(backendProduct.price)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount
    ? Math.round(price / (1 - discount / 100))
    : undefined

  const sizes = (backendProduct.sizes ?? [])
    .map((sizeItem) => ({
      size: Number(sizeItem.size),
      stock: Number(sizeItem.stock),
      available: Number(sizeItem.stock) > 0,
    }))
    .filter((sizeItem) => Number.isInteger(sizeItem.size) && sizeItem.size >= 35 && sizeItem.size <= 45)
    .sort((left, right) => left.size - right.size)

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    price,
    originalPrice,
    discount: hasDiscount ? discount : undefined,
    image: backendProduct.image || 'https://via.placeholder.com/800',
    category: backendProduct.category?.name || 'Без категории',
    material: backendProduct.material?.name || 'Не указано',
    style: backendProduct.style?.name || 'Не указано',
    season: backendProduct.season?.name || 'Не указано',
    categoryId: backendProduct.categoryId,
    materialId: backendProduct.materialId,
    styleId: backendProduct.styleId,
    seasonId: backendProduct.seasonId,
    description: backendProduct.description || 'Описание отсутствует',
    inStock: sizes.some((sizeItem) => sizeItem.available),
    sizes,
  }
}

export async function fetchProducts(): Promise<FrontendProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/models`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: BackendProduct[] = await response.json()
    return data.map(transformProduct)
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function fetchProductById(id: string): Promise<FrontendProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/models/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: BackendProduct = await response.json()
    return transformProduct(data)
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

