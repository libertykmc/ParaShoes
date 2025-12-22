import { User, Mail, Phone, MapPin, Award, Package } from 'lucide-react';
import { Badge } from './ui/badge';
import { Order } from '../data/products';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    bonusPoints: number;
  };
  orders: Order[];
  onViewOrder?: (orderId: string) => void;
}

export function ProfilePage({ user, orders }: ProfilePageProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Выполнен':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Доставляется':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Готовится':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Отменён':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-8">Личный кабинет</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
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
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="text-gray-900">{user.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus Points */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-amber-700" />
                <h3 className="text-gray-900">Бонусные баллы</h3>
              </div>
              <p className="text-3xl text-amber-900 mb-2">{user.bonusPoints}</p>
              <p className="text-sm text-amber-800">
                1 балл = 1 рубль при следующей покупке
              </p>
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-gray-700" />
                <h2 className="text-gray-900">История заказов</h2>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">У вас пока нет заказов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-gray-900 mb-1">Заказ {order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {item.productName} (размер {item.size}) × {item.quantity}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Итого:</span>
                        <span className="text-gray-900">
                          {order.total.toLocaleString('ru-RU')} ₽
                        </span>
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
