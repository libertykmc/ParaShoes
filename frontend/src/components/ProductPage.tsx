import { useState } from 'react';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../data/products';

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  onAddToCart: (productId: string, size: number) => void;
  onToggleFavorite: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  onBack: () => void;
  isFavorite: boolean;
  favorites: Set<string>;
}

export function ProductPage({ 
  product, 
  relatedProducts,
  onAddToCart, 
  onToggleFavorite, 
  onViewProduct,
  onBack,
  isFavorite,
  favorites
}: ProductPageProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const handleAddToCart = () => {
    if (selectedSize) {
      onAddToCart(product.id, selectedSize);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к каталогу
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h1 className="text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl text-gray-900">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {product.originalPrice.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              {product.inStock ? (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  В наличии
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-700">
                  Нет в наличии
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Specifications */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Материал:</span>
                <span className="text-gray-900">{product.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Стиль:</span>
                <span className="text-gray-900">{product.style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сезон:</span>
                <span className="text-gray-900">{product.season}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Категория:</span>
                <span className="text-gray-900">{product.category}</span>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-gray-900 mb-3">Выберите размер</h3>
              <div className="grid grid-cols-7 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!product.inStock}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${selectedSize === size 
                        ? 'border-amber-700 bg-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      ${!product.inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-amber-700 hover:bg-amber-800"
                onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Добавить в корзину
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => onToggleFavorite(product.id)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {!selectedSize && product.inStock && (
              <p className="text-sm text-amber-700 mt-3">Пожалуйста, выберите размер</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-gray-900 mb-6">Похожие товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAddToCart={(id) => onAddToCart(id, relatedProduct.sizes[0])}
                onToggleFavorite={onToggleFavorite}
                onViewProduct={onViewProduct}
                isFavorite={favorites.has(relatedProduct.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
