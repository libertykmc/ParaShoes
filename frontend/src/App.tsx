import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { ProductPage } from './components/ProductPage';
import { CartPage, CartItem } from './components/CartPage';
import { CheckoutPage, OrderData } from './components/CheckoutPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPage } from './components/AdminPage';
import { mockOrders } from './data/products';
import { fetchProducts, FrontendProduct } from './api/api';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { fetchCurrentUser, FrontendUser, getToken, setToken } from './api/auth';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type Page =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'admin'
  | 'about'
  | 'contacts'
  | 'favorites'
  | 'login'
  | 'register';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Загружаем текущего пользователя, если есть токен
        const token = getToken();
        if (token) {
          try {
            const user = await fetchCurrentUser();
            setCurrentUser(user);
          } catch (authError) {
            console.error('Error loading current user:', authError);
            setToken(null);
          }
        }
        setIsAuthLoading(false);

        // Загружаем товары
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить товары';
        setError(errorMessage);
        toast.error('Ошибка загрузки товаров');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (productId: string, size?: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const selectedSize = size || product.sizes[0];
    if (!selectedSize || !product.sizes.includes(selectedSize)) {
      toast.error('Size is not available');
      return;
    }
    const existingItem = cartItems.find(
      item => item.productId === productId && item.size === selectedSize
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success('Количество товара увеличено');
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${productId}`,
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity: 1
      };
      setCartItems([...cartItems, newItem]);
      toast.success('Товар добавлен в корзину');
    }
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.info('Товар удален из избранного');
      } else {
        newFavorites.add(productId);
        toast.success('Товар добавлен в избранное');
      }
      return newFavorites;
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.info('Товар удален из корзины');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleConfirmOrder = (orderData: OrderData) => {
    console.log('Order confirmed:', orderData, cartItems);
    setCartItems([]);
  };

  const handleBackFromCheckout = () => {
    setCurrentPage('cart');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    toast.info('Вы вышли из аккаунта');
    setCurrentPage('home');
  };

  const selectedProduct = selectedProductId
    ? products.find(p => p.id === selectedProductId)
    : null;

  const relatedProducts = selectedProduct
    ? products.filter(p => 
        p.id !== selectedProduct.id && 
        (p.category === selectedProduct.category || p.style === selectedProduct.style)
      ).slice(0, 4)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.size}
        onNavigate={handleNavigate}
        isAuthorized={!!currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {(isLoading || isAuthLoading) && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        )}

        {error && !isLoading && !isAuthLoading && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Ошибка: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isAuthLoading && !error && (
          <>
            {currentPage === 'login' && (
              <LoginPage
                onLoginSuccess={(user) => setCurrentUser(user)}
                onNavigateToRegister={() => setCurrentPage('register')}
                onBack={() => setCurrentPage('home')}
              />
            )}

            {currentPage === 'register' && (
              <RegisterPage
                onRegisterSuccess={(user) => setCurrentUser(user)}
                onNavigateToLogin={() => setCurrentPage('login')}
                onBack={() => setCurrentPage('home')}
              />
            )}

            {currentPage === 'home' && (
              <HomePage
                products={products}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onViewProduct={handleViewProduct}
                favorites={favorites}
              />
            )}

            {currentPage === 'catalog' && (
              <CatalogPage
                products={products}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onViewProduct={handleViewProduct}
                favorites={favorites}
              />
            )}

            {currentPage === 'product' && selectedProduct && (
              <ProductPage
                product={selectedProduct}
                relatedProducts={relatedProducts}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onViewProduct={handleViewProduct}
                onBack={() => handleNavigate('catalog')}
                isFavorite={favorites.has(selectedProduct.id)}
                favorites={favorites}
              />
            )}

            {currentPage === 'cart' && (
              <CartPage
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                onContinueShopping={() => handleNavigate('catalog')}
              />
            )}

            {currentPage === 'checkout' && (
              <CheckoutPage
                items={cartItems}
                onBack={handleBackFromCheckout}
                onConfirm={handleConfirmOrder}
              />
            )}

            {currentPage === 'profile' && (
              currentUser ? (
                <ProfilePage
                  user={currentUser}
                  orders={mockOrders}
                />
              ) : (
                <LoginPage
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    setCurrentPage('profile');
                  }}
                  onNavigateToRegister={() => setCurrentPage('register')}
                  onBack={() => setCurrentPage('home')}
                />
              )
            )}

            {currentPage === 'admin' && (
              <AdminPage
                products={products}
                orders={mockOrders}
                users={currentUser ? [currentUser] : []}
              />
            )}

            {currentPage === 'favorites' && (
              <div className="min-h-screen bg-gray-50">
                <div className="max-w-[1440px] mx-auto px-6 py-8">
                  <h1 className="text-gray-900 mb-8">Избранное</h1>
                  {favorites.size === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-500 mb-4">Список избранного пуст</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {products
                        .filter(p => favorites.has(p.id))
                        .map(product => (
                          <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-gray-600">{product.price.toLocaleString('ru-RU')} ₽</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(currentPage === 'about' || currentPage === 'contacts') && (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-gray-900 mb-4">
                    {currentPage === 'about' ? 'О нас' : 'Контакты'}
                  </h1>
                  <p className="text-gray-600">Эта страница в разработке</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
