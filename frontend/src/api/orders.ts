import { getToken, setToken } from './auth'

const API_BASE_URL = 'http://localhost:3001'

export interface CreateOrderPayload {
  deliveryAddress: string
  bonusPointsToSpend?: number
  items: Array<{
    modelId: string
    size: number
    quantity: number
    price: number
  }>
}

interface BackendOrderModel {
  id: string
  name?: string
  image?: string
}

interface BackendOrderItem {
  modelId: string
  size: number
  quantity: number
  price: number | string
  model?: BackendOrderModel
}

interface BackendOrderUser {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

interface BackendOrder {
  id: string
  orderDate: string
  status: string
  deliveryAddress: string
  totalAmount: number | string
  bonusPointsSpent?: number | string
  orderItems: BackendOrderItem[]
  user?: BackendOrderUser
}

export interface FrontendOrderItem {
  modelId: string
  productName: string
  productImage: string
  size: number
  quantity: number
  price: number
}

export interface FrontendOrder {
  id: string
  date: string
  status: string
  deliveryAddress: string
  total: number
  bonusPointsSpent: number
  isActive: boolean
  items: FrontendOrderItem[]
  customer: {
    id: string
    name: string
    phone: string
    address: string
  } | null
}

function parseErrorPrefix(status: number): string {
  return `Order request failed: ${status}`
}

function isActiveStatus(status: string): boolean {
  const normalized = status.toLowerCase()
  return !normalized.includes('выполн') && !normalized.includes('отмен')
}

function transformOrder(order: BackendOrder): FrontendOrder {
  const fullName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ').trim()

  return {
    id: order.id,
    date: order.orderDate,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    total: Number(order.totalAmount),
    bonusPointsSpent: Number(order.bonusPointsSpent || 0),
    isActive: isActiveStatus(order.status),
    customer: order.user
      ? {
          id: order.user.id,
          name: fullName || order.user.username || 'Пользователь',
          phone: order.user.phone || '',
          address: order.user.address || '',
        }
      : null,
    items: (order.orderItems || []).map((item) => ({
      modelId: item.modelId,
      productName: item.model?.name || 'Товар',
      productImage: item.model?.image || 'https://via.placeholder.com/400',
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
    })),
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

export async function fetchOrders(): Promise<FrontendOrder[]> {
  const response = await authorizedFetch('/orders')
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendOrder[]
  return data.map(transformOrder)
}

export async function createOrder(payload: CreateOrderPayload): Promise<FrontendOrder> {
  const response = await authorizedFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendOrder
  return transformOrder(data)
}

export async function cancelOrder(orderId: string): Promise<FrontendOrder> {
  const response = await authorizedFetch(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendOrder
  return transformOrder(data)
}

export async function updateOrderStatus(orderId: string, status: string): Promise<FrontendOrder> {
  const response = await authorizedFetch(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }

  const data = (await response.json()) as BackendOrder
  return transformOrder(data)
}
