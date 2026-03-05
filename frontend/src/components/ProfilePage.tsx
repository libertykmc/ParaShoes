import { Award, Mail, MapPin, Package, Phone, User } from 'lucide-react';
import { FrontendOrder } from '../api/orders';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    bonusPoints: number;
  };
  orders: FrontendOrder[];
  onCancelOrder?: (orderId: string) => Promise<void>;
  cancellingOrderId?: string | null;
}

function getStatusColor(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes('выполн')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (normalized.includes('достав')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (normalized.includes('готов')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (normalized.includes('отмен')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }

  return 'bg-gray-100 text-gray-800 border-gray-200';
}

export function ProfilePage({
  user,
  orders,
  onCancelOrder,
  cancellingOrderId,
}: ProfilePageProps) {
  const activeOrders = orders.filter((order) => order.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-8">Личный кабинет</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">Покупатель</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="text-gray-900">{user.phone || 'Не указан'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="text-gray-900">{user.address || 'Не указан'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-amber-700" />
                <h3 className="text-gray-900">Бонусные баллы</h3>
              </div>
              <p className="text-3xl text-amber-900 mb-2">{user.bonusPoints}</p>
              <p className="text-sm text-amber-800">1 балл = 1 рубль при следующей покупке</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">Активные заказы</h2>
              </div>

              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Активных заказов пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div>
                          <p className="text-gray-900 mb-1">Заказ {order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <p key={`${item.modelId}-${item.size}-${index}`} className="text-sm text-gray-600">
                            {item.productName} (размер {item.size}) x {item.quantity}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Адрес доставки:</span>
                        <span className="text-sm text-gray-700 text-right">{order.deliveryAddress}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-500">Итого:</span>
                        <span className="text-gray-900">{order.total.toLocaleString('ru-RU')} ₽</span>
                      </div>

                      <div className="pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          disabled={!onCancelOrder || cancellingOrderId === order.id}
                          onClick={() => void onCancelOrder?.(order.id)}
                        >
                          {cancellingOrderId === order.id ? 'Отмена...' : 'Отменить заказ'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
