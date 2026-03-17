import { getToken, setToken } from './auth'

const API_BASE_URL = 'http://localhost:3001'

interface BackendCartModel {
  id: string
  name?: string
  price: number | string
  image?: string
}

interface BackendCartItem {
  id: string
  userId: string
  modelId: string
  size: number
  quantity: number
  model?: BackendCartModel
}

export interface FrontendCartItem {
  id: string
  modelId: string
  size: number
  quantity: number
  name: string
  price: number
  image: string
}

export interface AddToCartPayload {
  modelId: string
  size: number
  quantity: number
}

function transformCartItem(item: BackendCartItem): FrontendCartItem {
  return {
    id: item.id,
    modelId: item.modelId,
    size: item.size,
    quantity: item.quantity,
    name: item.model?.name || 'Товар',
    price: Number(item.model?.price || 0),
    image: item.model?.image || 'https://via.placeholder.com/800',
  }
}

function parseErrorPrefix(status: number): string {
  return `Cart request failed: ${status}`
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

export async function fetchCartItems(): Promise<FrontendCartItem[]> {
  const response = await authorizedFetch('/cart')
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendCartItem[]
  return data.map(transformCartItem)
}

export async function addCartItem(payload: AddToCartPayload): Promise<FrontendCartItem> {
  const response = await authorizedFetch('/cart', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendCartItem
  return transformCartItem(data)
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<FrontendCartItem> {
  const response = await authorizedFetch(`/cart/${cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendCartItem
  return transformCartItem(data)
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  const response = await authorizedFetch(`/cart/${cartItemId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }
}

export async function clearCartItems(): Promise<void> {
  const response = await authorizedFetch('/cart', {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }
}
