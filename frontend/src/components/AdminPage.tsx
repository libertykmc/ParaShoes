import { useState } from 'react';
import { Users, Package, ShoppingCart, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AdminPageProps {
  products: any[];
  orders: any[];
  users: any[];
}

export function AdminPage({ products, orders, users }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Выполнен':
        return 'bg-green-100 text-green-800';
      case 'Доставляется':
        return 'bg-blue-100 text-blue-800';
      case 'Готовится':
        return 'bg-yellow-100 text-yellow-800';
      case 'Отменён':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 mb-8">Панель администратора</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Всего пользователей</p>
                <p className="text-3xl text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Товаров</p>
                <p className="text-3xl text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Заказов</p>
                <p className="text-3xl text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
            </TabsList>
          </div>

          {/* Products Tab */}
          <TabsContent value="products" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Input
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-amber-700 hover:bg-amber-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Добавить товар</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Название</Label>
                      <Input placeholder="Название товара" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Цена</Label>
                        <Input type="number" placeholder="12990" className="mt-1" />
                      </div>
                      <div>
                        <Label>Скидка (%)</Label>
                        <Input type="number" placeholder="0" className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Материал</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Выберите материал" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leather">Натуральная кожа</SelectItem>
                            <SelectItem value="suede">Замша</SelectItem>
                            <SelectItem value="nubuck">Нубук</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Категория</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Классика</SelectItem>
                            <SelectItem value="sport">Спорт</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-amber-700 hover:bg-amber-800">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Материал</TableHead>
                    <TableHead>Наличие</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.price.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>
                          {product.discount ? (
                            <Badge variant="secondary">{product.discount}%</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{product.material}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'В наличии' : 'Нет'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер заказа</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Товары</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>{order.items.length} шт.</TableCell>
                      <TableCell>{order.total.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Бонусы</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.bonusPoints}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
