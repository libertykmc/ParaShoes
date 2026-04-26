import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AdminOption,
  createAdminProduct,
  createCategory,
  createMaterial,
  createSeason,
  createStyle,
  deleteAdminProduct,
  deleteCategory,
  deleteMaterial,
  deleteSeason,
  deleteStyle,
  fetchAdminUsers,
  fetchCategories,
  fetchMaterials,
  fetchSeasons,
  fetchStyles,
  updateCategory,
  updateAdminProduct,
  updateMaterial,
  updateSeason,
  updateStyle,
  updateAdminUser,
} from '../api/admin'
import { FrontendProduct } from '../api/api'
import { FrontendUser } from '../api/auth'
import { FrontendOrder, updateOrderStatus } from '../api/orders'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

interface AdminPageProps {
  currentUser: FrontendUser
  initialProducts: FrontendProduct[]
  initialOrders: FrontendOrder[]
  onProductCreated?: (product: FrontendProduct) => void
  onOrderUpdated?: (order: FrontendOrder) => void
}

const ORDER_STATUSES = ['Принят', 'Готовится', 'Доставляется', 'Выполнен', 'Отменен']
type ReferenceType = 'category' | 'material' | 'style' | 'season'
const CHART_COLORS = ['#b45309', '#0f766e', '#1d4ed8', '#b91c1c', '#7c3aed', '#475569']

interface MonthlyModelStat {
  modelId: string
  productName: string
  quantity: number
  revenue: number
  ordersCount: number
}

function getStatusColor(status: string): string {
  const normalized = status.toLowerCase()

  if (normalized.includes('выполн')) return 'bg-green-100 text-green-800'
  if (normalized.includes('достав')) return 'bg-blue-100 text-blue-800'
  if (normalized.includes('готов')) return 'bg-yellow-100 text-yellow-800'
  if (normalized.includes('отмен')) return 'bg-red-100 text-red-800'

  return 'bg-gray-100 text-gray-800'
}

function parseSizesInput(rawValue: string): Array<{ size: number; stock: number }> {
  const normalized = rawValue.trim()
  if (!normalized) return []

  return normalized
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [sizePart, stockPart] = chunk.split(':').map((part) => part.trim())
      const size = Number(sizePart)
      const stock = Number(stockPart)

      if (!Number.isInteger(size) || !Number.isInteger(stock)) {
        throw new Error('Размеры нужно задавать в формате 36:4, 37:2')
      }

      return { size, stock }
    })
}

function createEmptyProductForm() {
  return {
    name: '',
    description: '',
    price: '',
    discount: '',
    image: '',
    categoryId: '',
    materialId: '',
    styleId: '',
    seasonId: '',
    sizes: '',
  }
}

function createEmptyReferenceForm() {
  return {
    type: 'category' as ReferenceType,
    name: '',
  }
}

function isCompletedOrder(order: FrontendOrder): boolean {
  return order.status.toLowerCase().includes('выполн')
}

function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month
}

export function AdminPage({
  currentUser,
  initialProducts,
  initialOrders,
  onProductCreated,
  onOrderUpdated,
}: AdminPageProps) {
  const [products, setProducts] = useState(initialProducts)
  const [orders, setOrders] = useState(initialOrders)
  const [users, setUsers] = useState<FrontendUser[]>([])
  const [categories, setCategories] = useState<AdminOption[]>([])
  const [materials, setMaterials] = useState<AdminOption[]>([])
  const [styles, setStyles] = useState<AdminOption[]>([])
  const [seasons, setSeasons] = useState<AdminOption[]>([])
  const [activeTab, setActiveTab] = useState('orders')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isSavingOrderId, setIsSavingOrderId] = useState<string | null>(null)
  const [isSavingUserId, setIsSavingUserId] = useState<string | null>(null)
  const [creatingReference, setCreatingReference] = useState<string | null>(null)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [deletingReferenceKey, setDeletingReferenceKey] = useState<string | null>(null)
  const [userDrafts, setUserDrafts] = useState<Record<string, { role: string; bonusPoints: string }>>({})
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({})
  const [isSavingReference, setIsSavingReference] = useState(false)
  const [referenceForm, setReferenceForm] = useState(createEmptyReferenceForm)
  const [productForm, setProductForm] = useState(createEmptyProductForm)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    setOrders(initialOrders)
    setOrderDrafts(Object.fromEntries(initialOrders.map((order) => [order.id, order.status])))
  }, [initialOrders])

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoadingUsers(true)

        const [fetchedUsers, fetchedCategories, fetchedMaterials, fetchedStyles, fetchedSeasons] =
          await Promise.all([
            fetchAdminUsers(),
            fetchCategories(),
            fetchMaterials(),
            fetchStyles(),
            fetchSeasons(),
          ])

        setUsers(fetchedUsers)
        setCategories(fetchedCategories)
        setMaterials(fetchedMaterials)
        setStyles(fetchedStyles)
        setSeasons(fetchedSeasons)
        setUserDrafts(
          Object.fromEntries(
            fetchedUsers.map((user) => [
              user.id,
              { role: user.role, bonusPoints: String(user.bonusPoints) },
            ]),
          ),
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось загрузить данные админки'
        toast.error(message)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    void loadAdminData()
  }, [])

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()),
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()),
  )
  const now = new Date()
  const currentMonthYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()
  const monthlyCompletedOrders = orders.filter((order) => {
    if (!isCompletedOrder(order)) {
      return false
    }

    const orderDate = new Date(order.date)
    return isSameMonth(orderDate, currentMonthYear, currentMonthIndex)
  })

  const monthlyStatsMap = new Map<string, MonthlyModelStat>()
  for (const order of monthlyCompletedOrders) {
    const processedModels = new Set<string>()

    for (const item of order.items) {
      const current =
        monthlyStatsMap.get(item.modelId) || {
          modelId: item.modelId,
          productName: item.productName,
          quantity: 0,
          revenue: 0,
          ordersCount: 0,
        }

      current.quantity += item.quantity
      current.revenue += item.price * item.quantity

      if (!processedModels.has(item.modelId)) {
        current.ordersCount += 1
        processedModels.add(item.modelId)
      }

      monthlyStatsMap.set(item.modelId, current)
    }
  }

  const monthlyModelStats = Array.from(monthlyStatsMap.values()).sort(
    (left, right) => right.quantity - left.quantity || right.revenue - left.revenue,
  )
  const totalPairsSoldThisMonth = monthlyModelStats.reduce((sum, item) => sum + item.quantity, 0)
  const totalRevenueThisMonth = monthlyModelStats.reduce((sum, item) => sum + item.revenue, 0)
  const topModel = monthlyModelStats[0] || null
  const averagePairsPerOrder = monthlyCompletedOrders.length
    ? totalPairsSoldThisMonth / monthlyCompletedOrders.length
    : 0
  const chartBaseData = monthlyModelStats.slice(0, 5).map((item) => ({
    name: item.productName,
    value: item.quantity,
  }))
  const remainingPairs = monthlyModelStats
    .slice(5)
    .reduce((sum, item) => sum + item.quantity, 0)
  const chartData =
    remainingPairs > 0
      ? [...chartBaseData, { name: 'Остальные', value: remainingPairs }]
      : chartBaseData
  const statsMonthLabel = now.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const resetProductForm = () => {
    setEditingProductId(null)
    setProductForm(createEmptyProductForm())
  }

  const resetReferenceForm = () => {
    setEditingReferenceId(null)
    setReferenceForm(createEmptyReferenceForm())
  }

  const handleOrderStatusSave = async (orderId: string) => {
    const status = orderDrafts[orderId]
    if (!status) return

    try {
      setIsSavingOrderId(orderId)
      const updatedOrder = await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)))
      onOrderUpdated?.(updatedOrder)
      toast.success('Статус заказа обновлен')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить статус заказа'
      toast.error(message)
    } finally {
      setIsSavingOrderId(null)
    }
  }

  const handleUserSave = async (userId: string) => {
    const draft = userDrafts[userId]
    if (!draft) return

    try {
      setIsSavingUserId(userId)
      const updatedUser = await updateAdminUser(userId, {
        role: draft.role,
        bonusPoints: Number(draft.bonusPoints || 0),
      })
      setUsers((prev) => prev.map((user) => (user.id === userId ? updatedUser : user)))
      toast.success('Пользователь обновлен')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить пользователя'
      toast.error(message)
    } finally {
      setIsSavingUserId(null)
    }
  }

  const handleEditReference = (type: ReferenceType, item: AdminOption) => {
    setEditingReferenceId(item.id)
    setReferenceForm({
      type,
      name: item.name,
    })
  }

  const handleReferenceSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const { type } = referenceForm
    const name = referenceForm.name.trim()
    if (!name) {
      toast.error('Введите название')
      return
    }

    try {
      setIsSavingReference(true)

      if (editingReferenceId) {
        let updated: AdminOption
        if (type === 'category') {
          updated = await updateCategory(editingReferenceId, name)
          setCategories((prev) => prev.map((entry) => (entry.id === editingReferenceId ? updated : entry)))
        } else if (type === 'material') {
          updated = await updateMaterial(editingReferenceId, name)
          setMaterials((prev) => prev.map((entry) => (entry.id === editingReferenceId ? updated : entry)))
        } else if (type === 'style') {
          updated = await updateStyle(editingReferenceId, name)
          setStyles((prev) => prev.map((entry) => (entry.id === editingReferenceId ? updated : entry)))
        } else {
          updated = await updateSeason(editingReferenceId, name)
          setSeasons((prev) => prev.map((entry) => (entry.id === editingReferenceId ? updated : entry)))
        }

        toast.success('Справочник обновлен')
      } else {
        let created: AdminOption
        setCreatingReference(type)

        if (type === 'category') {
          created = await createCategory(name)
          setCategories((prev) => [created, ...prev])
        } else if (type === 'material') {
          created = await createMaterial(name)
          setMaterials((prev) => [created, ...prev])
        } else if (type === 'style') {
          created = await createStyle(name)
          setStyles((prev) => [created, ...prev])
        } else {
          created = await createSeason(name)
          setSeasons((prev) => [created, ...prev])
        }

        toast.success('Справочник обновлен')
      }

      resetReferenceForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить справочник'
      toast.error(message)
    } finally {
      setIsSavingReference(false)
      setCreatingReference(null)
    }
  }

  const handleEditProduct = (product: FrontendProduct) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      description: product.description === 'Описание отсутствует' ? '' : product.description,
      price: String(product.price),
      discount: product.discount ? String(product.discount) : '',
      image: product.image === 'https://via.placeholder.com/800' ? '' : product.image,
      categoryId: product.categoryId || '',
      materialId: product.materialId || '',
      styleId: product.styleId || '',
      seasonId: product.seasonId || '',
      sizes: product.sizes.map((size) => `${size.size}:${size.stock}`).join(', '),
    })
  }

  const handleDeleteProduct = async (product: FrontendProduct) => {
    const confirmed = window.confirm(`Удалить товар "${product.name}"?`)
    if (!confirmed) return

    try {
      setDeletingProductId(product.id)
      await deleteAdminProduct(product.id)
      setProducts((prev) => prev.filter((item) => item.id !== product.id))
      if (editingProductId === product.id) resetProductForm()
      toast.success('Товар удален')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить товар'
      toast.error(message)
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleDeleteReference = async (
    type: ReferenceType,
    item: AdminOption,
  ) => {
    const confirmed = window.confirm(`Удалить "${item.name}"?`)
    if (!confirmed) return

    const key = `${type}:${item.id}`

    try {
      setDeletingReferenceKey(key)

      if (type === 'category') {
        await deleteCategory(item.id)
        setCategories((prev) => prev.filter((entry) => entry.id !== item.id))
      } else if (type === 'material') {
        await deleteMaterial(item.id)
        setMaterials((prev) => prev.filter((entry) => entry.id !== item.id))
      } else if (type === 'style') {
        await deleteStyle(item.id)
        setStyles((prev) => prev.filter((entry) => entry.id !== item.id))
      } else {
        await deleteSeason(item.id)
        setSeasons((prev) => prev.filter((entry) => entry.id !== item.id))
      }

      if (editingReferenceId === item.id) {
        resetReferenceForm()
      }
      toast.success('Элемент справочника удален')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить элемент'
      toast.error(message)
    } finally {
      setDeletingReferenceKey(null)
    }
  }

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!productForm.name.trim() || !productForm.price.trim()) {
      toast.error('Заполните название и цену товара')
      return
    }

    try {
      setIsSavingProduct(true)
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        price: Number(productForm.price),
        discount: productForm.discount ? Number(productForm.discount) : undefined,
        image: productForm.image.trim() || undefined,
        categoryId: productForm.categoryId || undefined,
        materialId: productForm.materialId || undefined,
        styleId: productForm.styleId || undefined,
        seasonId: productForm.seasonId || undefined,
        sizes: parseSizesInput(productForm.sizes),
      }

      if (editingProductId) {
        const updatedProduct = await updateAdminProduct(editingProductId, payload)
        setProducts((prev) =>
          prev.map((product) => (product.id === editingProductId ? updatedProduct : product)),
        )
        onProductCreated?.(updatedProduct)
        toast.success('Товар обновлен')
      } else {
        const createdProduct = await createAdminProduct(payload)
        setProducts((prev) => [createdProduct, ...prev])
        onProductCreated?.(createdProduct)
        toast.success('Новый товар создан')
      }

      resetProductForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить товар'
      toast.error(message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-2">Панель администратора</h1>
        <p className="text-gray-600 mb-8">
          Управление заказами, пользователями и каталогом для {currentUser.name}
        </p>

        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Пользователей</p>
            <p className="text-3xl text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Заказов</p>
            <p className="text-3xl text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Товаров</p>
            <p className="text-3xl text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Активных заказов</p>
            <p className="text-3xl text-gray-900">{orders.filter((order) => order.isActive).length}</p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="border-b border-gray-200 px-6 overflow-x-auto">
            <TabsList className="bg-transparent">
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="analytics">Статистика</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="references">Справочники</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Поиск заказа по id"
                value={orderSearchTerm}
                onChange={(event) => setOrderSearchTerm(event.target.value)}
                className="max-w-md"
              />
              <p className="text-sm text-gray-500">Администратор может менять статусы заказов</p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Заказ</TableHead>
                    <TableHead>Покупатель</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead>Состав</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{order.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.date).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div>{order.customer?.name || 'Неизвестно'}</div>
                        <div className="text-xs text-gray-500">Адрес заказа: {order.deliveryAddress}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div>{order.customer?.phone || 'Телефон не указан'}</div>
                        <div className="text-xs text-gray-500">
                          {order.customer?.address || 'Адрес в профиле не указан'}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={`${order.id}-${index}`} className="text-xs text-gray-600">
                              {item.productName}, размер {item.size}, {item.quantity} шт.
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">{order.total.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          
                          <select
                            style={{ width: '110px' }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={orderDrafts[order.id] || order.status}
                            onChange={(event) =>
                              setOrderDrafts((prev) => ({ ...prev, [order.id]: event.target.value }))
                            }
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <Button
                          size="sm"
                          className="bg-amber-700 hover:bg-amber-800"
                          disabled={isSavingOrderId === order.id}
                          onClick={() => void handleOrderStatusSave(order.id)}
                        >
                          {isSavingOrderId === order.id ? 'Сохраняем...' : 'Сохранить'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="p-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-gray-900">Статистика продаж по моделям</h2>
                <p className="text-sm text-gray-500">
                  Выполненные заказы за {statsMonthLabel}
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-900">
                {monthlyCompletedOrders.length} заказов в выборке
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div style={{padding: "10px"}} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Продано пар</p>
                <p  className="text-3xl text-gray-900">{totalPairsSoldThisMonth}</p>
              </div>
              <div style={{padding: "10px"}} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Выручка по моделям</p>
                <p className="text-3xl text-gray-900">
                  {totalRevenueThisMonth.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              
              <div style={{padding: "10px"}} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Рекордсмен месяца</p>
                <p className="text-lg text-gray-900">
                  {topModel ? topModel.productName : 'Пока нет данных'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {topModel ? `${topModel.quantity} пар` : 'Нет выполненных заказов'}
                </p>
              </div>
            </div>

            {monthlyModelStats.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                За текущий месяц пока нет выполненных заказов, поэтому статистика еще не сформирована.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-gray-900">Доли продаж по моделям</h3>
                    <p className="text-sm text-gray-500">
                      Круговая диаграмма по количеству проданных пар
                    </p>
                  </div>

                  <div className="h-80">
                    {activeTab === 'analytics' && (
                      <ResponsiveContainer
                        key={chartData.map((item) => `${item.name}-${item.value}`).join('|')}
                        width="100%"
                        height="100%"
                        minWidth={280}
                        minHeight={280}
                      >
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={2}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) => [`${value} пар`, 'Продано']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-4">
                  
                    <p className="text-sm text-gray-500">
                      Топ моделей за текущий месяц
                    </p>
                  </div>

                  <div className="space-y-3">
                    {monthlyModelStats.slice(0, 6).map((item, index) => (
                      <div
                        key={item.modelId}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">#{index + 1}</p>
                            <p className="text-gray-900">{item.productName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900">{item.quantity} пар</p>
                            <p className="text-sm text-gray-500">
                              {item.revenue.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Встречалась в {item.ordersCount} заказах
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="p-6">
            {isLoadingUsers ? (
              <p className="text-gray-500">Загрузка пользователей...</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Бонусы</TableHead>
                      <TableHead className="text-right">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'Не указан'}</TableCell>
                        <TableCell>{user.address || 'Не указан'}</TableCell>
                        <TableCell>
                          <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={userDrafts[user.id]?.role || user.role}
                            onChange={(event) =>
                              setUserDrafts((prev) => ({
                                ...prev,
                                [user.id]: {
                                  role: event.target.value,
                                  bonusPoints: prev[user.id]?.bonusPoints || String(user.bonusPoints),
                                },
                              }))
                            }
                          >
                            <option value="Пользователь">Пользователь</option>
                            <option value="Администратор">Администратор</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={userDrafts[user.id]?.bonusPoints || String(user.bonusPoints)}
                            onChange={(event) =>
                              setUserDrafts((prev) => ({
                                ...prev,
                                [user.id]: {
                                  role: prev[user.id]?.role || user.role,
                                  bonusPoints: event.target.value,
                                },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="bg-amber-700 hover:bg-amber-800"
                            disabled={isSavingUserId === user.id}
                            onClick={() => void handleUserSave(user.id)}
                          >
                            {isSavingUserId === user.id ? 'Сохраняем...' : 'Сохранить'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="p-6 space-y-6">
            <form
              onSubmit={(event) => void handleProductSubmit(event)}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-gray-900">
                    {editingProductId ? 'Редактирование товара' : 'Создание товара'}
                  </h2>
                  {editingProductId && (
                    <Button type="button" variant="outline" onClick={resetProductForm}>
                      Отменить редактирование
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Название товара"
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Textarea
                  placeholder="Описание товара"
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Цена"
                    value={productForm.price}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Скидка %"
                    value={productForm.discount}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, discount: event.target.value }))}
                  />
                </div>
                <Input
                  placeholder="Ссылка на картинку"
                  value={productForm.image}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))}
                />
                <Input
                  placeholder="Размеры и остатки: 36:4, 37:2, 38:0"
                  value={productForm.sizes}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, sizes: event.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={productForm.categoryId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                >
                  <option value="">Категория</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={productForm.materialId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, materialId: event.target.value }))}
                >
                  <option value="">Материал</option>
                  {materials.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={productForm.styleId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, styleId: event.target.value }))}
                >
                  <option value="">Стиль</option>
                  {styles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={productForm.seasonId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, seasonId: event.target.value }))}
                >
                  <option value="">Сезон</option>
                  {seasons.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800"
                  disabled={isSavingProduct}
                >
                  {isSavingProduct
                    ? editingProductId
                      ? 'Сохраняем товар...'
                      : 'Создаем товар...'
                    : editingProductId
                      ? 'Сохранить изменения'
                      : 'Создать товар'}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-200">
              <Input
                placeholder="Поиск товаров"
                value={productSearchTerm}
                onChange={(event) => setProductSearchTerm(event.target.value)}
                className="max-w-md mb-4"
              />

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Материал</TableHead>
                      <TableHead>Стиль</TableHead>
                      <TableHead>Сезон</TableHead>
                      <TableHead className="text-right">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.price.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.material}</TableCell>
                        <TableCell>{product.style}</TableCell>
                        <TableCell>{product.season}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                              disabled={deletingProductId === product.id}
                              onClick={() => void handleDeleteProduct(product)}
                            >
                              {deletingProductId === product.id ? 'Удаляем...' : 'Удалить'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="references" className="p-6 space-y-6">
            <form
              onSubmit={(event) => void handleReferenceSubmit(event)}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-gray-900">
                    {editingReferenceId ? 'Редактирование справочника' : 'Создание элемента справочника'}
                  </h2>
                  {editingReferenceId && (
                    <Button type="button" variant="outline" onClick={resetReferenceForm}>
                      Отменить редактирование
                    </Button>
                  )}
                </div>

                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={referenceForm.type}
                  disabled={!!editingReferenceId}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({
                      ...prev,
                      type: event.target.value as ReferenceType,
                    }))
                  }
                >
                  <option value="category">Категория</option>
                  <option value="material">Материал</option>
                  <option value="style">Стиль</option>
                  <option value="season">Сезон</option>
                </select>

                <Input
                  placeholder="Название элемента справочника"
                  value={referenceForm.name}
                  onChange={(event) =>
                    setReferenceForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  {editingReferenceId
                    ? 'Измените название выбранного элемента и сохраните изменения.'
                    : 'Выберите тип справочника, укажите название и создайте новый элемент.'}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800"
                  disabled={
                    isSavingReference ||
                    creatingReference === referenceForm.type
                  }
                >
                  {isSavingReference
                    ? editingReferenceId
                      ? 'Сохраняем справочник...'
                      : 'Создаем элемент...'
                    : editingReferenceId
                      ? 'Сохранить изменения'
                      : 'Создать элемент'}
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'Категории', type: 'category' as const, items: categories },
                { title: 'Материалы', type: 'material' as const, items: materials },
                { title: 'Стили', type: 'style' as const, items: styles },
                { title: 'Сезоны', type: 'season' as const, items: seasons },
              ].map((group) => (
                <div key={group.title} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <h3 className="text-gray-900 mb-3">{group.title}</h3>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const key = `${group.type}:${item.id}`

                      return (
                        <div
                          key={item.id}
                          className="rounded-md bg-white px-3 py-2 border border-gray-200 flex items-center justify-between gap-3"
                        >
                          <span className="text-sm text-gray-600">{item.name}</span>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditReference(group.type, item)}
                            >
                              Изменить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                              disabled={deletingReferenceKey === key}
                              onClick={() => void handleDeleteReference(group.type, item)}
                            >
                              {deletingReferenceKey === key ? '...' : 'Удалить'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
