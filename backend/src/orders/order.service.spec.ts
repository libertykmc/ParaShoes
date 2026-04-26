import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { User } from '../users/user.entity'
import { OrderItem } from './order-item.entity'
import { Order, OrderStatus } from './order.entity'
import { OrdersService } from './order.service'

type MockRepo<T = unknown> = {
  findOne: jest.Mock
  findOneBy: jest.Mock
  findOneOrFail: jest.Mock
  create: jest.Mock
  save: jest.Mock
  remove: jest.Mock
  increment: jest.Mock
  createQueryBuilder: jest.Mock
}

const createRepoMock = (): MockRepo => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findOneOrFail: jest.fn(),
  create: jest.fn((payload) => payload),
  save: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
  createQueryBuilder: jest.fn(),
})

describe('OrdersService', () => {
  let service: OrdersService
  let ordersRepo: MockRepo<Order>
  let txOrdersRepo: MockRepo<Order>
  let modelRepo: MockRepo<Model>
  let orderItemRepo: MockRepo<OrderItem>
  let sizeStockRepo: MockRepo<ModelSizeStock>
  let userRepo: MockRepo<User>
  let sizeStockQueryBuilder: {
    setLock: jest.Mock
    where: jest.Mock
    andWhere: jest.Mock
    getOne: jest.Mock
  }
  let userQueryBuilder: {
    setLock: jest.Mock
    where: jest.Mock
    getOne: jest.Mock
  }
  let dataSource: DataSource

  beforeEach(() => {
    ordersRepo = createRepoMock()
    txOrdersRepo = createRepoMock()
    modelRepo = createRepoMock()
    orderItemRepo = createRepoMock()
    sizeStockRepo = createRepoMock()
    userRepo = createRepoMock()

    sizeStockQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }

    userQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }

    sizeStockRepo.createQueryBuilder.mockReturnValue(sizeStockQueryBuilder)
    userRepo.createQueryBuilder.mockReturnValue(userQueryBuilder)

    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Order) {
          return txOrdersRepo
        }
        if (entity === Model) {
          return modelRepo
        }
        if (entity === OrderItem) {
          return orderItemRepo
        }
        if (entity === ModelSizeStock) {
          return sizeStockRepo
        }
        if (entity === User) {
          return userRepo
        }
        throw new Error(`Unexpected repository request: ${entity?.name}`)
      }),
    }

    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    } as never

    service = new OrdersService(ordersRepo as never, dataSource)
  })

  it('rejects creating an order without items', async () => {
    await expect(
      service.create('user-1', { deliveryAddress: 'Moscow', items: [] }),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(dataSource.transaction).not.toHaveBeenCalled()
  })

  it('checks total reserved stock for repeated model and size pairs', async () => {
    modelRepo.findOneBy.mockResolvedValue({ id: 'model-1', name: 'Runner' })
    sizeStockQueryBuilder.getOne.mockResolvedValue({
      modelId: 'model-1',
      size: 42,
      stock: 2,
    })

    await expect(
      service.create('user-1', {
        deliveryAddress: 'Moscow',
        items: [
          { modelId: 'model-1', size: 42, quantity: 1, price: 5000 },
          { modelId: 'model-1', size: 42, quantity: 2, price: 5000 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(sizeStockRepo.createQueryBuilder).toHaveBeenCalledTimes(1)
  })

  it('creates an order, spends bonus points and decrements stock', async () => {
    const lockedSizeStock = {
      modelId: 'model-1',
      size: 42,
      stock: 5,
    }

    modelRepo.findOneBy.mockResolvedValue({ id: 'model-1', name: 'Runner' })
    sizeStockQueryBuilder.getOne.mockResolvedValue(lockedSizeStock)
    userQueryBuilder.getOne.mockResolvedValue({
      id: 'user-1',
      bonusPoints: 300,
    })
    txOrdersRepo.save.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
    })
    txOrdersRepo.findOneOrFail.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      totalAmount: 900,
    })

    const result = await service.create('user-1', {
      deliveryAddress: 'Moscow',
      bonusPointsToSpend: 100,
      items: [{ modelId: 'model-1', size: 42, quantity: 2, price: 500 }],
    })

    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        bonusPoints: 200,
      }),
    )
    expect(txOrdersRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        totalAmount: 900,
        status: OrderStatus.ACCEPTED,
        bonusPointsSpent: 100,
      }),
    )
    expect(orderItemRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        modelId: 'model-1',
        size: 42,
        quantity: 2,
        price: 500,
      }),
    )
    expect(sizeStockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        modelId: 'model-1',
        size: 42,
        stock: 3,
      }),
    )
    expect(result).toEqual(
      expect.objectContaining({
        id: 'order-1',
      }),
    )
  })

  it('rejects bonus spending above 10 percent of subtotal', async () => {
    modelRepo.findOneBy.mockResolvedValue({ id: 'model-1', name: 'Runner' })
    sizeStockQueryBuilder.getOne.mockResolvedValue({
      modelId: 'model-1',
      size: 42,
      stock: 5,
    })
    userQueryBuilder.getOne.mockResolvedValue({
      id: 'user-1',
      bonusPoints: 500,
    })

    await expect(
      service.create('user-1', {
        deliveryAddress: 'Moscow',
        bonusPointsToSpend: 101,
        items: [{ modelId: 'model-1', size: 42, quantity: 1, price: 1000 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('awards bonus points once when the order becomes completed', async () => {
    const initialOrder = {
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.ACCEPTED,
      totalAmount: 1234,
      bonusAwarded: false,
      bonusPointsSpent: 0,
      orderItems: [],
    } as Order

    txOrdersRepo.findOne
      .mockResolvedValueOnce(initialOrder)
      .mockResolvedValueOnce({
        ...initialOrder,
        status: OrderStatus.COMPLETED,
        bonusAwarded: true,
      })

    await service.update(
      'order-1',
      {
        status: OrderStatus.COMPLETED,
      },
      'user-1',
    )

    expect(userRepo.increment).toHaveBeenCalledWith(
      { id: 'user-1' },
      'bonusPoints',
      123,
    )
    expect(txOrdersRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        status: OrderStatus.COMPLETED,
        bonusAwarded: true,
      }),
    )
  })

  it('restores stock and spent bonus points on cancel', async () => {
    const activeOrder = {
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.ACCEPTED,
      totalAmount: 1000,
      bonusPointsSpent: 50,
      orderItems: [{ modelId: 'model-1', size: 42, quantity: 2 }],
    } as Order

    txOrdersRepo.findOne
      .mockResolvedValueOnce(activeOrder)
      .mockResolvedValueOnce({
        ...activeOrder,
        status: OrderStatus.CANCELLED,
      })
    sizeStockQueryBuilder.getOne.mockResolvedValue({
      modelId: 'model-1',
      size: 42,
      stock: 1,
    })

    await service.cancel('order-1', 'user-1')

    expect(sizeStockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        modelId: 'model-1',
        size: 42,
        stock: 3,
      }),
    )
    expect(userRepo.increment).toHaveBeenCalledWith(
      { id: 'user-1' },
      'bonusPoints',
      50,
    )
    expect(txOrdersRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        status: OrderStatus.CANCELLED,
      }),
    )
  })

  it('does not allow cancelling a completed order', async () => {
    txOrdersRepo.findOne.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.COMPLETED,
      totalAmount: 1000,
      bonusPointsSpent: 0,
      orderItems: [],
    })

    await expect(service.cancel('order-1', 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })
})
