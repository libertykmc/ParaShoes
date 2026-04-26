import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import sbpQrPlaceholder from '../assets/images/sbp-qr-placeholder.svg';
import { CartItem } from './CartPage';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CheckoutPageProps {
  items: CartItem[];
  availableBonusPoints: number;
  onBack: () => void;
  onConfirm: (orderData: OrderData) => Promise<string>;
  initialOrderData?: Partial<OrderData>;
}

export interface OrderData {
  fullName: string;
  phone: string;
  address: string;
  email: string;
  bonusPointsToSpend: number;
}

type PaymentMethod = 'sbp';

export function CheckoutPage({
  items,
  availableBonusPoints,
  onBack,
  onConfirm,
  initialOrderData,
}: CheckoutPageProps) {
  const [formData, setFormData] = useState<OrderData>({
    fullName: initialOrderData?.fullName || '',
    phone: initialOrderData?.phone || '',
    address: initialOrderData?.address || '',
    email: initialOrderData?.email || '',
    bonusPointsToSpend: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sbp');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 500;
  const maxBonusPointsByOrder = Math.floor(subtotal * 0.1);
  const maxSpendableBonusPoints = Math.max(
    0,
    Math.min(availableBonusPoints, maxBonusPointsByOrder),
  );
  const appliedBonusPoints = Math.min(formData.bonusPointsToSpend, maxSpendableBonusPoints);
  const total = subtotal - appliedBonusPoints + shipping;

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

  useEffect(() => {
    if (formData.bonusPointsToSpend <= maxSpendableBonusPoints) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      bonusPointsToSpend: maxSpendableBonusPoints,
    }));
  }, [formData.bonusPointsToSpend, maxSpendableBonusPoints]);

  const hasRequiredData = () =>
    Boolean(
      formData.fullName.trim() &&
        formData.phone.trim() &&
        formData.email.trim() &&
        formData.address.trim(),
    );

  const openPaymentDialog = (event?: FormEvent) => {
    event?.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!hasRequiredData()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!hasRequiredData()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await onConfirm({
        ...formData,
        bonusPointsToSpend: appliedBonusPoints,
      });
      setIsPaymentDialogOpen(false);
      setSubmittedOrderId(orderId);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось оформить заказ';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleBonusPointsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = Number.parseInt(event.target.value, 10);
    const nextValue = Number.isNaN(rawValue)
      ? 0
      : Math.max(0, Math.min(rawValue, maxSpendableBonusPoints));

    setFormData((prev) => ({
      ...prev,
      bonusPointsToSpend: nextValue,
    }));
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mb-3 text-gray-900">Заказ оформлен</h2>
          <p className="mb-6 text-gray-600">
            Спасибо за заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Номер заказа: <span className="text-gray-900">{submittedOrderId}</span>
          </p>
          <Button className="w-full bg-amber-700 hover:bg-amber-800" onClick={onBack}>
            Вернуться в корзину
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsPaymentDialogOpen(open);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          style={{
            maxHeight: 'calc(100vh - 2rem)',
            maxWidth: 'min(32rem, calc(100vw - 2rem))',
            overflowY: 'auto',
          }}
        >
          <DialogHeader>
            <DialogTitle>Оплата через СБП</DialogTitle>
            <DialogDescription>
              Отсканируйте QR-код
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center gap-4">
              <img
                src={sbpQrPlaceholder}
                alt="QR-код для оплаты через СБП"
                className="aspect-square rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                style={{
                  height: 'auto',
                  maxHeight: 'min(45vh, 260px)',
                  maxWidth: 'min(100%, 260px)',
                  objectFit: 'contain',
                  width: 'min(100%, 260px)',
                }}
              />

              <div className="text-center">
                <p className="text-sm text-gray-600">К оплате через СБП</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {total.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="bg-amber-700 hover:bg-amber-800"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создаём заказ...' : 'Я оплатил'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к корзине
        </Button>

        <h1 className="mb-8 text-gray-900">Оформление заказа</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form
              onSubmit={(event) => openPaymentDialog(event)}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <h2 className="mb-6 text-gray-900">Данные получателя</h2>

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 text-gray-900">Способ оплаты</h3>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('sbp')}
                  className={`mt-3 flex w-full items-start justify-between rounded-xl border p-4 text-left transition ${
                    paymentMethod === 'sbp'
                      ? 'border-emerald-500 bg-white shadow-sm'
                      : 'border-amber-200 bg-white/70 hover:border-amber-300'
                  }`}
                >
                  <div>
                    <p className="text-base text-gray-900">СБП</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Оплата по QR-коду. 
                    </p>
                  </div>
                  <div
                    className={`mt-1 h-5 w-5 rounded-full border-2 ${
                      paymentMethod === 'sbp'
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-gray-900">Списать бонусы</h3>
                    <p className="text-sm text-gray-600">
                      Доступно {availableBonusPoints.toLocaleString('ru-RU')} бонусов,
                      к списанию не более {maxSpendableBonusPoints.toLocaleString('ru-RU')}
                    </p>
                  </div>

                  {maxSpendableBonusPoints > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          bonusPointsToSpend: maxSpendableBonusPoints,
                        }))
                      }
                    >
                      Списать максимум
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="bonusPointsToSpend">Бонусов к списанию</Label>
                  <Input
                    id="bonusPointsToSpend"
                    name="bonusPointsToSpend"
                    type="number"
                    min={0}
                    max={maxSpendableBonusPoints}
                    step={1}
                    value={formData.bonusPointsToSpend}
                    onChange={handleBonusPointsChange}
                    className="mt-1"
                    disabled={maxSpendableBonusPoints === 0}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Можно списать до 10% суммы заказа:{' '}
                    {maxSpendableBonusPoints.toLocaleString('ru-RU')} бонусов.
                    1 бонус = 1 рубль.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-gray-900">Ваш заказ</h3>

              <div className="mb-6 space-y-3 border-b border-gray-200 pb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-gray-600">
                      {item.name} (размер {item.size}) x {item.quantity}
                    </span>
                    <span className="whitespace-nowrap text-gray-900">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-2 border-b border-gray-200 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары:</span>
                  <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{shipping.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Бонусы:</span>
                <span>-{appliedBonusPoints.toLocaleString('ru-RU')} ₽</span>
              </div>

              <div className="mb-6 flex justify-between">
                <span className="text-gray-900">Итого:</span>
                <span className="text-2xl text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-700 hover:bg-amber-800"
                disabled={isSubmitting}
                onClick={() => openPaymentDialog()}
              >
                {isSubmitting ? 'Обрабатываем...' : 'Оплатить'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
