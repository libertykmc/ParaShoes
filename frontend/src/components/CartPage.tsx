import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: number;
  quantity: number;
}

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartPage({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  onContinueShopping 
}: CartPageProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">Корзина пуста</h2>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину, чтобы продолжить покупки</p>
          <Button 
            className="bg-amber-700 hover:bg-amber-800"
            onClick={onContinueShopping}
          >
            Перейти к покупкам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-gray-900">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">Размер: {item.size}</p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="h-8 w-8"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-gray-900">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {item.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h3 className="text-gray-900 mb-4">Итого</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({items.length}):</span>
                  <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{shipping === 0 ? 'Бесплатно' : `${shipping.toLocaleString('ru-RU')} ₽`}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-gray-900">Итого:</span>
                <span className="text-2xl text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-amber-700 hover:bg-amber-800 mb-3"
                onClick={onCheckout}
              >
                Оформить заказ
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={onContinueShopping}
              >
                Продолжить покупки
              </Button>

              {subtotal < 5000 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Добавьте товаров на {(5000 - subtotal).toLocaleString('ru-RU')} ₽ для бесплатной доставки
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
