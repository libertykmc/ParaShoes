import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center">
                <span className="text-white">PS</span>
              </div>
              <span className="text-white tracking-tight">ParaShoes</span>
            </div>
            <p className="text-sm text-gray-400">
              Премиальная кожаная обувь для ценителей качества и стиля.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-amber-500 transition-colors">Каталог</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-500 transition-colors">О нас</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-500 transition-colors">Доставка</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-500 transition-colors">Возврат</a>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>+7 (903) 632-55-45</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@parashoes.ru</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-1" />
                <span>г. Иваново, ул. 8 марта д.32, 3 этаж магазин 4Б</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white mb-4">Социальные сети</h3>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com/parashoes_ivanovo"
                target = "_blank" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 ParaShoes. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
