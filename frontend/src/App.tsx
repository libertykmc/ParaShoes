import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchProducts, FrontendProduct } from './api/api'
import {
  fetchCurrentUser,
  FrontendUser,
  getToken,
  setToken,
  updateCurrentUser,
} from './api/auth'
import {
  addCartItem,
  clearCartItems,
  fetchCartItems,
  FrontendCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from './api/cart'
import { addToFavorites, fetchFavoriteIds, removeFromFavorites } from './api/favorites'
import { cancelOrder, createOrder, fetchOrders, FrontendOrder } from './api/orders'
import { AboutPage } from './components/AboutPage'
import { AdminPage } from './components/AdminPage'
import { CartPage } from './components/CartPage'
import { CatalogPage } from './components/CatalogPage'
import { CheckoutPage, OrderData } from './components/CheckoutPage'
import { EditProfilePage } from './components/EditProfilePage'
import { FavoritesPage } from './components/FavoritesPage'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomePage } from './components/HomePage'
import { LoginPage } from './components/LoginPage'
import { OrderDetailsPage } from './components/OrderDetailsPage'
import { ProductPage } from './components/ProductPage'
import { ProfilePage } from './components/ProfilePage'
import { RegisterPage } from './components/RegisterPage'
import { Toaster } from './components/ui/sonner'

type Page =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'edit-profile'
  | 'order-details'
  | 'admin'
  | 'about'
  | 'favorites'
  | 'login'
  | 'register'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<FrontendCartItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<FrontendProduct[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null)
  const [orders, setOrders] = useState<FrontendOrder[]>([])
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [repeatingOrderId, setRepeatingOrderId] = useState<string | null>(null)
  const [isProfileUpdating, setIsProfileUpdating] = useState<boolean>(false)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)

  const reloadProducts = async (): Promise<void> => {
    const fetchedProducts = await fetchProducts()
    setProducts(fetchedProducts)
  }

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavorites(new Set())
        return
      }

      try {
        const ids = await fetchFavoriteIds()
        setFavorites(new Set(ids))
      } catch (favoritesError) {
        console.error('Error loading favorites:', favoritesError)
        setFavorites(new Set())
      }
    }

    void loadFavorites()
  }, [currentUser])

  useEffect(() => {
    const loadCart = async () => {
      if (!currentUser) {
        setCartItems([])
        return
      }

      try {
        const items = await fetchCartItems()
        setCartItems(items)
      } catch (cartError) {
        const message =
          cartError instanceof Error ? cartError.message : 'Не удалось загрузить корзину'
        toast.error(message)
        console.error('Error loading cart:', cartError)
      }
    }

    void loadCart()
  }, [currentUser])

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = getToken()
        if (token) {
          try {
            const user = await fetchCurrentUser()
            setCurrentUser(user)
          } catch (authError) {
            console.error('Error loading current user:', authError)
            setToken(null)
          }
        }
        setIsAuthLoading(false)

        await reloadProducts()
      } catch (initError) {
        const errorMessage =
          initError instanceof Error ? initError.message : 'Не удалось загрузить товары'
        setError(errorMessage)
        toast.error('Ошибка загрузки товаров')
        console.error('Error loading products:', initError)
      } finally {
        setIsLoading(false)
      }
    }

    void init()
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) {
        setOrders([])
        return
      }

      try {
        const userOrders = await fetchOrders()
        setOrders(userOrders)
      } catch (ordersError) {
        const message =
          ordersError instanceof Error ? ordersError.message : 'Не удалось загрузить заказы'
        toast.error(message)
        console.error('Error loading orders:', ordersError)
      }
    }

    void loadOrders()
  }, [currentUser])

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page)
    window.scrollTo(0, 0)
  }

  const handleViewProduct = (modelId: string) => {
    setSelectedProductId(modelId)
    setCurrentPage('product')
    window.scrollTo(0, 0)
  }

  const handleOpenOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCurrentPage('order-details')
    window.scrollTo(0, 0)
  }

  const handleAddToCart = async (modelId: string, size?: number) => {
    if (!currentUser) {
      toast.info('Войдите в аккаунт, чтобы добавить товар в корзину')
      setCurrentPage('login')
      return
    }

    const product = products.find((item) => item.id === modelId)
    if (!product) {
      return
    }

    const selectedSizeInfo = size
      ? product.sizes.find((item) => item.size === size)
      : product.sizes.find((item) => item.available)

    if (!selectedSizeInfo || !selectedSizeInfo.available) {
      toast.error('Выбранный размер недоступен')
      return
    }

    const selectedSize = selectedSizeInfo.size
    const existingItem = cartItems.find(
      (item) => item.modelId === modelId && item.size === selectedSize,
    )
    const nextQuantity = (existingItem?.quantity || 0) + 1

    if (nextQuantity > selectedSizeInfo.stock) {
      toast.error('Недостаточно остатка для выбранного размера')
      return
    }

    try {
      const savedItem = await addCartItem({
        modelId,
        size: selectedSize,
        quantity: 1,
      })

      setCartItems((prev) => {
        const itemExists = prev.some((item) => item.id === savedItem.id)
        if (!itemExists) {
          return [...prev, savedItem]
        }
        return prev.map((item) => (item.id === savedItem.id ? savedItem : item))
      })

      toast.success(
        existingItem ? 'Количество товара увеличено' : 'Товар добавлен в корзину',
      )
    } catch (addToCartError) {
      const message =
        addToCartError instanceof Error
          ? addToCartError.message
          : 'Ошибка добавления в корзину'
      toast.error(message)
      console.error('Error adding to cart:', addToCartError)
    }
  }

  const handleToggleFavorite = (modelId: string) => {
    if (!currentUser) {
      toast.info('Войдите в аккаунт, чтобы использовать избранное')
      setCurrentPage('login')
      return
    }

    const toggle = async () => {
      try {
        if (favorites.has(modelId)) {
          await removeFromFavorites(modelId)
          setFavorites((prev) => {
            const next = new Set(prev)
            next.delete(modelId)
            return next
          })
          toast.info('Товар удален из избранного')
        } else {
          await addToFavorites(modelId)
          setFavorites((prev) => {
            const next = new Set(prev)
            next.add(modelId)
            return next
          })
          toast.success('Товар добавлен в избранное')
        }
      } catch (toggleError) {
        const message =
          toggleError instanceof Error ? toggleError.message : 'Ошибка обновления избранного'
        toast.error(message)
        console.error('Error toggling favorites:', toggleError)
      }
    }

    void toggle()
  }

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    const cartItem = cartItems.find((item) => item.id === id)
    if (!cartItem) {
      return
    }

    const product = products.find((item) => item.id === cartItem.modelId)
    const sizeInfo = product?.sizes.find((sizeItem) => sizeItem.size === cartItem.size)
    if (!sizeInfo || !sizeInfo.available) {
      toast.error('Выбранный размер больше недоступен')
      return
    }

    const normalizedQuantity = Math.max(1, quantity)
    if (normalizedQuantity > sizeInfo.stock) {
      toast.error('Недостаточно остатка для выбранного размера')
      return
    }

    try {
      const updatedItem = await updateCartItemQuantity(id, normalizedQuantity)
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item)),
      )
    } catch (updateCartError) {
      const message =
        updateCartError instanceof Error
          ? updateCartError.message
          : 'Ошибка обновления количества'
      toast.error(message)
      console.error('Error updating cart quantity:', updateCartError)
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      await removeCartItem(id)
      setCartItems((prev) => prev.filter((item) => item.id !== id))
      toast.info('Товар удален из корзины')
    } catch (removeCartError) {
      const message =
        removeCartError instanceof Error
          ? removeCartError.message
          : 'Ошибка удаления товара из корзины'
      toast.error(message)
      console.error('Error removing cart item:', removeCartError)
    }
  }

  const handleCheckout = () => {
    if (!currentUser) {
      toast.info('Войдите в аккаунт, чтобы оформить заказ')
      setCurrentPage('login')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    setCurrentPage('checkout')
    window.scrollTo(0, 0)
  }

  const handleConfirmOrder = async (orderData: OrderData): Promise<string> => {
    if (!currentUser) {
      throw new Error('Требуется авторизация')
    }

    if (cartItems.length === 0) {
      throw new Error('Корзина пуста')
    }

    const createdOrder = await createOrder({
      deliveryAddress: orderData.address.trim(),
      items: cartItems.map((item) => ({
        modelId: item.modelId,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
    })

    setOrders((prev) => [createdOrder, ...prev])

    try {
      await clearCartItems()
    } catch (clearCartError) {
      console.error('Order created but cart cleanup failed:', clearCartError)
    }

    setCartItems([])
    await reloadProducts()
    toast.success('Заказ оформлен')
    return createdOrder.id
  }

  const handleCancelOrder = async (orderId: string): Promise<void> => {
    const hasConfirmed = window.confirm('Отменить этот заказ? Он останется доступен в истории заказов.')
    if (!hasConfirmed) {
      return
    }

    try {
      setCancellingOrderId(orderId)
      const cancelledOrder = await cancelOrder(orderId)
      setOrders((prev) =>
        prev.map((order) => (order.id === cancelledOrder.id ? cancelledOrder : order)),
      )
      await reloadProducts()
      toast.success('Заказ отменен и перенесен в историю')
    } catch (cancelError) {
      const message =
        cancelError instanceof Error ? cancelError.message : 'Не удалось отменить заказ'
      toast.error(message)
      console.error('Error cancelling order:', cancelError)
    } finally {
      setCancellingOrderId(null)
    }
  }

  const handleRepeatOrder = async (orderId: string): Promise<void> => {
    const order = orders.find((item) => item.id === orderId)
    if (!order) {
      toast.error('Не удалось найти заказ для повторения')
      return
    }

    try {
      setRepeatingOrderId(orderId)

      const results = await Promise.allSettled(
        order.items.map((item) =>
          addCartItem({
            modelId: item.modelId,
            size: item.size,
            quantity: item.quantity,
          }),
        ),
      )

      const successfulCount = results.filter((result) => result.status === 'fulfilled').length
      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      )

      if (successfulCount === 0) {
        throw new Error(
          failedResults[0]?.reason instanceof Error
            ? failedResults[0].reason.message
            : 'Не удалось повторить заказ',
        )
      }

      const refreshedCart = await fetchCartItems()
      setCartItems(refreshedCart)
      setCurrentPage('cart')
      window.scrollTo(0, 0)

      if (failedResults.length > 0) {
        toast.info('Часть товаров добавлена в корзину. Некоторые позиции сейчас недоступны.')
        return
      }

      toast.success('Товары из заказа добавлены в корзину')
    } catch (repeatError) {
      const message =
        repeatError instanceof Error ? repeatError.message : 'Не удалось повторить заказ'
      toast.error(message)
      console.error('Error repeating order:', repeatError)
    } finally {
      setRepeatingOrderId(null)
    }
  }

  const handleUpdateProfile = async (payload: {
    fullName: string
    phone: string
    address: string
  }): Promise<void> => {
    try {
      setIsProfileUpdating(true)
      const updatedUser = await updateCurrentUser(payload)
      setCurrentUser(updatedUser)
      setCurrentPage('profile')
      toast.success('Профиль обновлен')
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : 'Не удалось обновить профиль'
      toast.error(message)
      console.error('Error updating profile:', updateError)
      throw updateError
    } finally {
      setIsProfileUpdating(false)
    }
  }

  const handleBackFromCheckout = () => {
    setCurrentPage('cart')
    window.scrollTo(0, 0)
  }

  const handleLogout = () => {
    setToken(null)
    setCurrentUser(null)
    setCartItems([])
    setFavorites(new Set())
    toast.info('Вы вышли из аккаунта')
    setCurrentPage('home')
  }

  const selectedProduct = selectedProductId
    ? products.find((item) => item.id === selectedProductId)
    : null
  const selectedOrder = selectedOrderId
    ? orders.find((item) => item.id === selectedOrderId) || null
    : null

  const relatedProducts = selectedProduct
    ? products
        .filter(
          (item) =>
            item.id !== selectedProduct.id &&
            (item.category === selectedProduct.category || item.style === selectedProduct.style),
        )
        .slice(0, 4)
    : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.size}
        onNavigate={handleNavigate}
        isAuthorized={!!currentUser}
        isAdmin={currentUser?.role === 'Администратор'}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {(isLoading || isAuthLoading) && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
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
                onLoginSuccess={(user) => {
                  setCurrentUser(user)
                }}
                onNavigateToRegister={() => setCurrentPage('register')}
                onBack={() => setCurrentPage('home')}
              />
            )}

            {currentPage === 'register' && (
              <RegisterPage
                onRegisterSuccess={(user) => {
                  setCurrentUser(user)
                }}
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
                initialOrderData={{
                  fullName: currentUser?.name || '',
                  phone: currentUser?.phone || '',
                  address: currentUser?.address || '',
                  email: currentUser?.email || '',
                }}
              />
            )}

            {currentPage === 'profile' &&
              (currentUser ? (
                <ProfilePage
                  user={currentUser}
                  orders={orders}
                  onCancelOrder={handleCancelOrder}
                  cancellingOrderId={cancellingOrderId}
                  onRepeatOrder={handleRepeatOrder}
                  repeatingOrderId={repeatingOrderId}
                  onEditProfile={() => setCurrentPage('edit-profile')}
                  onOpenOrder={handleOpenOrder}
                />
              ) : (
                <LoginPage
                  onLoginSuccess={(user) => {
                    setCurrentUser(user)
                    setCurrentPage('profile')
                  }}
                  onNavigateToRegister={() => setCurrentPage('register')}
                  onBack={() => setCurrentPage('home')}
                />
              ))}

            {currentPage === 'edit-profile' &&
              (currentUser ? (
                <EditProfilePage
                  user={currentUser}
                  isLoading={isProfileUpdating}
                  onSave={handleUpdateProfile}
                  onCancel={() => setCurrentPage('profile')}
                />
              ) : (
                <LoginPage
                  onLoginSuccess={(user) => {
                    setCurrentUser(user)
                    setCurrentPage('profile')
                  }}
                  onNavigateToRegister={() => setCurrentPage('register')}
                  onBack={() => setCurrentPage('home')}
                />
              ))}

            {currentPage === 'order-details' &&
              (currentUser ? (
                selectedOrder ? (
                  <OrderDetailsPage
                    order={selectedOrder}
                    onBack={() => setCurrentPage('profile')}
                    onCancelOrder={handleCancelOrder}
                    cancellingOrderId={cancellingOrderId}
                  />
                ) : (
                  <ProfilePage
                    user={currentUser}
                    orders={orders}
                    onCancelOrder={handleCancelOrder}
                    cancellingOrderId={cancellingOrderId}
                    onRepeatOrder={handleRepeatOrder}
                    repeatingOrderId={repeatingOrderId}
                    onEditProfile={() => setCurrentPage('edit-profile')}
                    onOpenOrder={handleOpenOrder}
                  />
                )
              ) : (
                <LoginPage
                  onLoginSuccess={(user) => {
                    setCurrentUser(user)
                    setCurrentPage('profile')
                  }}
                  onNavigateToRegister={() => setCurrentPage('register')}
                  onBack={() => setCurrentPage('home')}
                />
              ))}

            {currentPage === 'admin' &&
              (currentUser?.role === 'Администратор' ? (
                <AdminPage
                  currentUser={currentUser}
                  initialProducts={products}
                  initialOrders={orders}
                  onProductCreated={(product) => {
                    setProducts((prev) => [product, ...prev.filter((item) => item.id !== product.id)])
                  }}
                  onOrderUpdated={(updatedOrder) => {
                    setOrders((prev) =>
                      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
                    )
                  }}
                />
              ) : (
                <HomePage
                  products={products}
                  onNavigate={handleNavigate}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onViewProduct={handleViewProduct}
                  favorites={favorites}
                />
              ))}

            {currentPage === 'favorites' && (
              <FavoritesPage
                products={products}
                favorites={favorites}
                onViewProduct={handleViewProduct}
              />
            )}

            {currentPage === 'about' && <AboutPage />}
          </>
        )}
      </main>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}
