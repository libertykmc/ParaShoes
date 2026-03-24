import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { FrontendOrder } from '../api/orders'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface OrderDetailsPageProps {
  order: FrontendOrder
  onBack: () => void
  onCancelOrder?: (orderId: string) => Promise<void>
  cancellingOrderId?: string | null
}

function getStatusColor(status: string): string {
  const normalized = status.toLowerCase()

  if (normalized.includes('выполн')) {
    return 'bg-green-100 text-green-800 border-green-200'
  }
  if (normalized.includes('достав')) {
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }
  if (normalized.includes('готов')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  if (normalized.includes('отмен')) {
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return 'bg-gray-100 text-gray-800 border-gray-200'
}

function formatOrderDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function OrderDetailsPage({
  order,
  onBack,
  onCancelOrder,
  cancellingOrderId,
}: OrderDetailsPageProps) {
  const isCancelling = cancellingOrderId === order.id
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад в профиль
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-gray-900 mb-2">Заказ {order.id}</h1>
                  <p className="text-sm text-gray-500">{formatOrderDate(order.date)}</p>
                </div>

                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.modelId}-${item.size}-${index}`}
                    className="flex gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                      <ImageWithFallback
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-gray-900 mb-2">{item.productName}</h2>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Размер: {item.size}</p>
                        <p>Количество: {item.quantity}</p>
                        <p>Цена за штуку: {item.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-gray-900">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-gray-700" />
                  <h2 className="text-gray-900">Сводка по заказу</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Позиций:</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Товаров:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-900 pt-2 border-t border-gray-200">
                    <span>Итого:</span>
                    <span>{order.total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <h2 className="text-gray-900">Адрес доставки</h2>
                </div>
                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              </div>

              {order.isActive && onCancelOrder && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={isCancelling}
                  onClick={() => void onCancelOrder(order.id)}
                >
                  {isCancelling ? 'Отмена...' : 'Отменить заказ'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
