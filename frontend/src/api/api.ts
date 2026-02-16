const API_BASE_URL = 'http://localhost:3000'

interface NamedEntity {
  id: string
  name: string
}

interface BackendProductItem {
  id: string
  size: number
}

export interface BackendProduct {
  id: string
  name: string
  description?: string
  price: number | string
  discount: number | string
  image?: string
  quantityInStock: number
  categoryId?: string
  category?: NamedEntity
  materialId?: string
  material?: NamedEntity
  styleId?: string
  style?: NamedEntity
  seasonId?: string
  season?: NamedEntity
  products?: BackendProductItem[]
  createdAt: string
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
  sizes: number[]
}

function transformProduct(backendProduct: BackendProduct): FrontendProduct {
  const discount = Number(backendProduct.discount || 0)
  const price = Number(backendProduct.price)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount
    ? Math.round(price / (1 - discount / 100))
    : undefined

  const availableSizes = Array.from(
    new Set((backendProduct.products ?? []).map((product) => Number(product.size))),
  )
    .filter((size) => Number.isInteger(size) && size >= 35 && size <= 45)
    .sort((a, b) => a - b)

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
    inStock: backendProduct.quantityInStock > 0 && availableSizes.length > 0,
    sizes: availableSizes,
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
