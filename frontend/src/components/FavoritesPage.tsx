import { FrontendProduct } from '../api/api'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface FavoritesPageProps {
  products: FrontendProduct[]
  favorites: Set<string>
  onViewProduct: (productId: string) => void
}

export function FavoritesPage({
  products,
  favorites,
  onViewProduct,
}: FavoritesPageProps) {
  const favoriteProducts = products.filter((product) => favorites.has(product.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-8">Избранное</h1>
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Список избранного пуст</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onViewProduct(product.id)}
                className="bg-white rounded-xl p-4 border border-gray-200 text-left hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600">{product.price.toLocaleString('ru-RU')} ₽</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
