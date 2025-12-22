import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import { Product } from '../data/products';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  products: Product[];
  onNavigate: (page: string) => void;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  favorites: Set<string>;
}

export function HomePage({ 
  products, 
  onNavigate, 
  onAddToCart, 
  onToggleFavorite, 
  onViewProduct,
  favorites 
}: HomePageProps) {
  const popularProducts = products.slice(0, 4);

  const categories = [
    {
      name: 'Осень',
      image: 'https://images.unsplash.com/photo-1637059037982-519896b99b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBib290c3xlbnwxfHx8fDE3NjE2NTkwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      season: 'Осень'
    },
    {
      name: 'Зима',
      image: 'https://images.unsplash.com/photo-1546544110-031042d2fb3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBmb290d2VhcnxlbnwxfHx8fDE3NjE2NTkwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      season: 'Зима'
    },
    {
      name: 'Классика',
      image: 'https://images.unsplash.com/photo-1714905733230-702715038fa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwc2hvZXN8ZW58MXx8fHwxNzYxNjU5MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      style: 'Классика'
    },
    {
      name: 'Спорт',
      image: 'https://images.unsplash.com/photo-1647597411979-b5e4a155281b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMHNuZWFrZXJzfGVufDF8fHx8MTc2MTY1OTAzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      style: 'Спорт'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-[1440px] mx-auto px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-white mb-6">
                Премиальная кожаная обувь
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Откройте для себя коллекцию классической и современной обуви из натуральной кожи
              </p>
              <Button 
                size="lg"
                className="bg-amber-700 hover:bg-amber-800"
                onClick={() => onNavigate('catalog')}
              >
                Перейти к покупкам
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1653868250450-b83e6263d427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2hvZXMlMjBoZXJvfGVufDF8fHx8MTc2MTY1OTAzNnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Premium leather shoes"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-gray-900">Популярные товары</h2>
          <Button 
            variant="outline"
            onClick={() => onNavigate('catalog')}
          >
            Смотреть все
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              onViewProduct={onViewProduct}
              isFavorite={favorites.has(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-6 py-16">
        <h2 className="text-gray-900 mb-8">Категории</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onNavigate('catalog')}
              className="group relative h-64 rounded-xl overflow-hidden"
            >
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white w-full">
                  <h3 className="text-white mb-2">{category.name}</h3>
                  <div className="flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Смотреть коллекцию
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-gray-900 mb-2">Качество</h3>
              <p className="text-gray-600">Только натуральная кожа и премиальные материалы</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-900 mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">Доставим ваш заказ в течение 1-3 дней</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-gray-900 mb-2">Легкий возврат</h3>
              <p className="text-gray-600">30 дней на возврат без объяснения причин</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
