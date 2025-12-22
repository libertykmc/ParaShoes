import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleFavorite, 
  onViewProduct,
  isFavorite = false 
}: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <button 
          onClick={() => onViewProduct(product.id)}
          className="w-full h-full"
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </button>
        
        {/* Discount Badge */}
        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
            -{product.discount}%
          </Badge>
        )}

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onToggleFavorite(product.id)}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Нет в наличии</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <button 
          onClick={() => onViewProduct(product.id)}
          className="text-left w-full"
        >
          <h3 className="text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </button>
        
        <p className="text-sm text-gray-500 mb-3">{product.material}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-900">{product.price.toLocaleString('ru-RU')} ₽</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>

        <Button
          className="w-full bg-amber-700 hover:bg-amber-800"
          onClick={() => onAddToCart(product.id)}
          disabled={!product.inStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          В корзину
        </Button>
      </div>
    </div>
  );
}
