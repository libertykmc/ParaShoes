import { getToken, setToken } from './auth'

const API_BASE_URL = 'http://localhost:3001'

export interface CreateOrderPayload {
  deliveryAddress: string
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
}

interface BackendOrderItem {
  modelId: string
  size: number
  quantity: number
  price: number | string
  model?: BackendOrderModel
}

interface BackendOrder {
  id: string
  orderDate: string
  status: string
  deliveryAddress: string
  totalAmount: number | string
  orderItems: BackendOrderItem[]
}

export interface FrontendOrderItem {
  modelId: string
  productName: string
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
  isActive: boolean
  items: FrontendOrderItem[]
}

function parseErrorPrefix(status: number): string {
  return `Order request failed: ${status}`
}

function isActiveStatus(status: string): boolean {
  const normalized = status.toLowerCase()
  return !normalized.includes('выполн') && !normalized.includes('отмен')
}

function transformOrder(order: BackendOrder): FrontendOrder {
  return {
    id: order.id,
    date: order.orderDate,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    total: Number(order.totalAmount),
    isActive: isActiveStatus(order.status),
    items: (order.orderItems || []).map((item) => ({
      modelId: item.modelId,
      productName: item.model?.name || 'Товар',
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

export async function deleteOrder(orderId: string): Promise<void> {
  const response = await authorizedFetch(`/orders/${orderId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || parseErrorPrefix(response.status))
  }
}

