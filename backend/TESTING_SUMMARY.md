# Testing Summary

## Что покрыто тестами

### `ProductsService`

Файл: `src/products/product.service.spec.ts`

Проверены сценарии:

- создание товара с нормализацией размеров и сортировкой по возрастанию;
- обновление товара с полной заменой таблицы размеров и остатков;
- преобразование `NotFoundException` по категории в бизнес-ошибку `BadRequestException`;
- запрет дублирующихся размеров в `sizes`;
- безопасная обработка ошибки удаления товара, если он связан с заказами, корзиной или избранным.

### `CartService`

Файл: `src/cart/cart.service.spec.ts`

Проверены сценарии:

- добавление новой позиции в корзину при достаточном остатке;
- увеличение количества существующей позиции вместо создания дубликата;
- ошибка при попытке превысить остаток на складе;
- успешное обновление количества;
- ошибка при обновлении количества сверх доступного остатка.

### `OrdersService`

Файл: `src/orders/order.service.spec.ts`

Проверены сценарии:

- запрет создания заказа без товаров;
- контроль суммарного резерва, если одна и та же модель и размер встречаются в нескольких строках заказа;
- создание заказа со списанием бонусов и уменьшением складского остатка;
- запрет списания бонусов сверх 10% от суммы заказа;
- начисление бонусов при переводе заказа в статус `COMPLETED`;
- возврат остатков и ранее списанных бонусов при отмене заказа;
- запрет отмены уже выполненного заказа.

### `AuthService`

Файл: `src/auth/auth.service.spec.ts`

Проверены сценарии:

- запрет регистрации при занятом email;
- успешная регистрация с хешированием пароля и выдачей JWT;
- ошибка логина при неверном пароле.

### `AppController`

Файл: `src/app.controller.spec.ts`

Проверен базовый smoke-тест:

- контроллер корректно создаётся в `TestingModule`.

## Какие моки использовались

### `ProductsService`

Использованы моки:

- `productsRepo`: `findOne`, `findOneOrFail`, `save`, `create`, `remove`, `delete`;
- `modelRepo`: репозиторий внутри транзакции для создания и чтения товара;
- `sizeStockRepo`: репозиторий внутри транзакции для записи размеров;
- `categoriesService.findById`: для проверки существования категории;
- `dataSource.transaction`: мок транзакции, который сразу вызывает callback с фейковым manager;
- `manager.getRepository(...)`: разруливает возврат `Model` и `ModelSizeStock` репозиториев;
- `QueryFailedError`: эмулирует ошибку удаления, приходящую из TypeORM.

### `CartService`

Использованы моки:

- `cartRepo`: `findOne`, `save`, `create`;
- `modelsRepo`: `findOneBy` для поиска модели;
- `sizeStocksRepo`: `findOne` для проверки доступного остатка;
- `service.findById`: локально подменялся через `jest.spyOn(...)`, чтобы не повторять загрузку сущности из репозитория в каждом сценарии.

### `OrdersService`

Использованы моки:

- `ordersRepo`: внешний репозиторий сервиса;
- `txOrdersRepo`: репозиторий заказа внутри транзакции;
- `modelRepo`: поиск модели в рамках транзакции;
- `orderItemRepo`: сохранение строк заказа;
- `sizeStockRepo`: чтение и сохранение остатков;
- `userRepo`: чтение пользователя, списание и возврат бонусов, `increment(...)`;
- `dataSource.transaction`: мок транзакции с фейковым `manager`;
- `manager.getRepository(...)`: возвращает нужный репозиторий по сущности;
- `sizeStockRepo.createQueryBuilder(...)`: мок для pessimistic lock по остаткам;
- `userRepo.createQueryBuilder(...)`: мок для pessimistic lock по пользователю;
- query builder methods: `setLock`, `where`, `andWhere`, `getOne`.

### `AuthService`

Использованы моки:

- `usersService.findByEmail`;
- `usersService.findByUsername`;
- `usersService.create`;
- `jwtService.sign`;
- `bcrypt.hash`;
- `bcrypt.compare`.

`bcrypt` замокан через `jest.mock('bcrypt', ...)`, чтобы не использовать реальное хеширование в unit-тестах.

