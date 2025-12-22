import { ShoppingCart, Heart, User, Menu } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  cartCount?: number;
  favoritesCount?: number;
  onNavigate: (page: string) => void;
}

export function Header({ cartCount = 0, favoritesCount = 0, onNavigate }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center">
              <span className="text-white">PS</span>
            </div>
            <span className="text-gray-900 tracking-tight">ParaShoes</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate('catalog')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Каталог
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              О нас
            </button>
            <button 
              onClick={() => onNavigate('contacts')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Контакты
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('favorites')}
              className="relative"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('cart')}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('profile')}
            >
              <User className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
