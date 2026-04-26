import { BackendProduct, FrontendProduct } from './api'
import { BackendUser, FrontendUser, getToken, setToken } from './auth'

const API_BASE_URL = 'http://localhost:3001'

export interface AdminOption {
  id: string
  name: string
}

export interface CreateAdminProductPayload {
  name: string
  description?: string
  price: number
  discount?: number
  image?: string
  categoryId?: string
  materialId?: string
  styleId?: string
  seasonId?: string
  sizes?: Array<{
    size: number
    stock: number
  }>
}

function transformUser(user: BackendUser): FrontendUser {
  const hasFullName =
    (user.firstName && user.firstName.trim()) || (user.lastName && user.lastName.trim())
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  return {
    id: user.id,
    name: hasFullName ? fullName : user.username,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    bonusPoints: user.bonusPoints,
    avatar: user.avatar,
    role: user.role,
  }
}

function transformProduct(backendProduct: BackendProduct): FrontendProduct {
  const discount = Number(backendProduct.discount || 0)
  const price = Number(backendProduct.price)
  const hasDiscount = discount > 0
  const originalPrice = hasDiscount ? Math.round(price / (1 - discount / 100)) : undefined

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

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  if (!token) {
    throw new Error('Требуется авторизация')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })

  if (response.status === 401) {
    setToken(null)
  }

  return response
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export async function fetchAdminUsers(): Promise<FrontendUser[]> {
  const response = await authorizedFetch('/users')
  const data = await readJsonOrThrow<BackendUser[]>(response)
  return data.map(transformUser)
}

export async function updateAdminUser(
  userId: string,
  payload: { role: string; bonusPoints: number },
): Promise<FrontendUser> {
  const response = await authorizedFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const data = await readJsonOrThrow<BackendUser>(response)
  return transformUser(data)
}

export async function fetchCategories(): Promise<AdminOption[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)
  return readJsonOrThrow<AdminOption[]>(response)
}

export async function fetchMaterials(): Promise<AdminOption[]> {
  const response = await fetch(`${API_BASE_URL}/materials`)
  return readJsonOrThrow<AdminOption[]>(response)
}

export async function fetchStyles(): Promise<AdminOption[]> {
  const response = await fetch(`${API_BASE_URL}/styles`)
  return readJsonOrThrow<AdminOption[]>(response)
}

export async function fetchSeasons(): Promise<AdminOption[]> {
  const response = await fetch(`${API_BASE_URL}/seasons`)
  return readJsonOrThrow<AdminOption[]>(response)
}

export async function createCategory(name: string): Promise<AdminOption> {
  const response = await authorizedFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return readJsonOrThrow<AdminOption>(response)
}

export async function createMaterial(name: string): Promise<AdminOption> {
  const response = await authorizedFetch('/materials', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return readJsonOrThrow<AdminOption>(response)
}

export async function createStyle(name: string): Promise<AdminOption> {
  const response = await authorizedFetch('/styles', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return readJsonOrThrow<AdminOption>(response)
}

export async function createSeason(name: string): Promise<AdminOption> {
  const response = await authorizedFetch('/seasons', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return readJsonOrThrow<AdminOption>(response)
}

async function updateReferenceName(path: string, name: string): Promise<AdminOption> {
  const response = await authorizedFetch(path, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })

  return readJsonOrThrow<AdminOption>(response)
}

export async function updateCategory(categoryId: string, name: string): Promise<AdminOption> {
  return updateReferenceName(`/categories/${categoryId}`, name)
}

export async function updateMaterial(materialId: string, name: string): Promise<AdminOption> {
  return updateReferenceName(`/materials/${materialId}`, name)
}

export async function updateStyle(styleId: string, name: string): Promise<AdminOption> {
  return updateReferenceName(`/styles/${styleId}`, name)
}

export async function updateSeason(seasonId: string, name: string): Promise<AdminOption> {
  return updateReferenceName(`/seasons/${seasonId}`, name)
}

export async function createAdminProduct(payload: CreateAdminProductPayload): Promise<FrontendProduct> {
  const response = await authorizedFetch('/models', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data = await readJsonOrThrow<BackendProduct>(response)
  return transformProduct(data)
}

export async function updateAdminProduct(
  productId: string,
  payload: CreateAdminProductPayload,
): Promise<FrontendProduct> {
  const response = await authorizedFetch(`/models/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const data = await readJsonOrThrow<BackendProduct>(response)
  return transformProduct(data)
}

async function deleteWithoutBody(path: string): Promise<void> {
  const response = await authorizedFetch(path, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await deleteWithoutBody(`/models/${productId}`)
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteWithoutBody(`/categories/${categoryId}`)
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await deleteWithoutBody(`/materials/${materialId}`)
}

export async function deleteStyle(styleId: string): Promise<void> {
  await deleteWithoutBody(`/styles/${styleId}`)
}

export async function deleteSeason(seasonId: string): Promise<void> {
  await deleteWithoutBody(`/seasons/${seasonId}`)
}
