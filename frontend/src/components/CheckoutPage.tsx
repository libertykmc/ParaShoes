import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from './CartPage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onConfirm: (orderData: OrderData) => Promise<string>;
  initialOrderData?: Partial<OrderData>;
}

export interface OrderData {
  fullName: string;
  phone: string;
  address: string;
  email: string;
}

export function CheckoutPage({
  items,
  onBack,
  onConfirm,
  initialOrderData,
}: CheckoutPageProps) {
  const [formData, setFormData] = useState<OrderData>({
    fullName: initialOrderData?.fullName || '',
    phone: initialOrderData?.phone || '',
    address: initialOrderData?.address || '',
    email: initialOrderData?.email || '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 500;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!initialOrderData) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || initialOrderData.fullName || '',
      phone: prev.phone || initialOrderData.phone || '',
      address: prev.address || initialOrderData.address || '',
      email: prev.email || initialOrderData.email || '',
    }));
  }, [initialOrderData]);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (isSubmitting) {
      return;
    }

    const hasRequiredData =
      formData.fullName.trim() &&
      formData.phone.trim() &&
      formData.email.trim() &&
      formData.address.trim();

    if (!hasRequiredData) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await onConfirm(formData);
      setSubmittedOrderId(orderId);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось оформить заказ';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-gray-900 mb-3">Заказ оформлен</h2>
          <p className="text-gray-600 mb-6">
            Спасибо за заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Номер заказа: <span className="text-gray-900">{submittedOrderId}</span>
          </p>
          <Button className="bg-amber-700 hover:bg-amber-800 w-full" onClick={onBack}>
            Вернуться в корзину
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к корзине
        </Button>

        <h1 className="text-gray-900 mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={(event) => void handleSubmit(event)} className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-gray-900 mb-6">Данные получателя</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">ФИО *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Иванов Иван Иванович"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+7 (999) 123-45-67"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@mail.ru"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Адрес доставки *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="г. Москва, ул. Тверская, д. 10, кв. 25"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-gray-900 mb-2">Способ оплаты</h3>
                <p className="text-sm text-gray-600">Оплата при получении наличными или картой</p>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h3 className="text-gray-900 mb-4">Ваш заказ</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-600">
                      {item.name} (размер {item.size}) x {item.quantity}
                    </span>
                    <span className="text-gray-900 whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Товары:</span>
                  <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{shipping.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-gray-900">Итого:</span>
                <span className="text-2xl text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-700 hover:bg-amber-800"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
