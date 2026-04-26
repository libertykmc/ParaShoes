import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { User } from '../users/user.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderItem } from './order-item.entity'
import { Order, OrderStatus } from './order.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId?: string): Promise<Order[]> {
    const where = userId ? { userId } : {}
    return this.ordersRepo.find({
      where,
      relations: ['orderItems', 'orderItems.model', 'user'],
      order: { orderDate: 'DESC' },
    })
  }

  async findById(id: string, userId?: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.model', 'user'],
    })

    if (!order) {
      throw new NotFoundException(`Заказ с id ${id} не найден`)
    }
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому заказу')
    }

    return order
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Заказ должен содержать минимум один товар')
    }

    return this.dataSource.transaction(async (manager) => {
      const modelRepo = manager.getRepository(Model)
      const orderRepo = manager.getRepository(Order)
      const orderItemRepo = manager.getRepository(OrderItem)
      const sizeStockRepo = manager.getRepository(ModelSizeStock)
      const userRepo = manager.getRepository(User)

      let subtotalAmount = 0
      const lockedSizeStocks = new Map<string, ModelSizeStock>()
      const reservedByKey = new Map<string, number>()

      for (const item of dto.items) {
        if (item.size < 35 || item.size > 45) {
          throw new BadRequestException(
            `Размер ${item.size} вне допустимого диапазона 35-45`,
          )
        }

        const model = await modelRepo.findOneBy({ id: item.modelId })
        if (!model) {
          throw new NotFoundException(`Модель с id ${item.modelId} не найдена`)
        }

        const lockKey = `${item.modelId}:${item.size}`
        let sizeStock = lockedSizeStocks.get(lockKey)

        if (!sizeStock) {
          const lockedSizeStock = await sizeStockRepo
            .createQueryBuilder('sizeStock')
            .setLock('pessimistic_write')
            .where('sizeStock.model_id = :modelId', { modelId: item.modelId })
            .andWhere('sizeStock.size = :size', { size: item.size })
            .getOne()

          if (!lockedSizeStock) {
            throw new BadRequestException(
              `Размер ${item.size} для модели ${model.name} отсутствует`,
            )
          }

          sizeStock = lockedSizeStock
          lockedSizeStocks.set(lockKey, sizeStock)
        }

        const reservedQuantity = (reservedByKey.get(lockKey) || 0) + item.quantity
        if (sizeStock.stock < reservedQuantity) {
          throw new BadRequestException(
            `Недостаточно остатка для модели ${model.name}, размер ${item.size}`,
          )
        }

        reservedByKey.set(lockKey, reservedQuantity)
        subtotalAmount += item.price * item.quantity
      }

      const user = await userRepo
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne()

      if (!user) {
        throw new NotFoundException(`Пользователь с id ${userId} не найден`)
      }

      const bonusPointsToSpend = dto.bonusPointsToSpend ?? 0
      const maxBonusPointsToSpend = Math.floor(subtotalAmount * 0.1)
      if (bonusPointsToSpend > user.bonusPoints) {
        throw new BadRequestException('Недостаточно бонусов для списания')
      }

      if (bonusPointsToSpend > maxBonusPointsToSpend) {
        throw new BadRequestException(
          'Можно списать бонусами не более 10% стоимости заказа',
        )
      }

      if (bonusPointsToSpend > 0) {
        user.bonusPoints -= bonusPointsToSpend
        await userRepo.save(user)
      }

      const totalAmount = subtotalAmount - bonusPointsToSpend

      const order = await orderRepo.save(
        orderRepo.create({
          userId,
          deliveryAddress: dto.deliveryAddress,
          totalAmount,
          status: OrderStatus.ACCEPTED,
          bonusPointsSpent: bonusPointsToSpend,
        }),
      )

      for (const item of dto.items) {
        await orderItemRepo.save(
          orderItemRepo.create({
            orderId: order.id,
            modelId: item.modelId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          }),
        )

        const lockKey = `${item.modelId}:${item.size}`
        const sizeStock = lockedSizeStocks.get(lockKey)
        if (!sizeStock) {
          throw new BadRequestException('Ошибка списания остатка')
        }

        sizeStock.stock -= item.quantity
        await sizeStockRepo.save(sizeStock)
      }

      return orderRepo.findOneOrFail({
        where: { id: order.id },
        relations: ['orderItems', 'orderItems.model', 'user'],
      })
    })
  }

  async update(id: string, dto: UpdateOrderDto, userId?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.getOrderWithItems(manager, id, userId)
      const nextStatus = dto.status
      const shouldCancelOrder =
        nextStatus === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      const shouldAwardBonus =
        nextStatus === OrderStatus.COMPLETED &&
        order.status !== OrderStatus.COMPLETED &&
        !order.bonusAwarded

      if (shouldCancelOrder && order.status === OrderStatus.COMPLETED) {
        throw new ForbiddenException('Нельзя отменить выполненный заказ')
      }

      if (shouldCancelOrder) {
        await this.restoreOrderStock(manager, order)
        await this.restoreSpentBonusPoints(manager, order)
      }

      Object.assign(order, dto)

      if (shouldAwardBonus) {
        const bonusPoints = this.calculateBonusPoints(order.totalAmount)
        if (bonusPoints > 0) {
          await manager
            .getRepository(User)
            .increment({ id: order.userId }, 'bonusPoints', bonusPoints)
        }
        order.bonusAwarded = true
      }

      await manager.getRepository(Order).save(order)
      return this.getOrderWithItems(manager, id, userId)
    })
  }

  async cancel(id: string, userId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.getOrderWithItems(manager, id, userId)

      if (order.status === OrderStatus.COMPLETED) {
        throw new ForbiddenException('Нельзя отменить выполненный заказ')
      }

      if (order.status !== OrderStatus.CANCELLED) {
        await this.restoreOrderStock(manager, order)
        await this.restoreSpentBonusPoints(manager, order)
      }

      order.status = OrderStatus.CANCELLED
      await manager.getRepository(Order).save(order)

      return this.getOrderWithItems(manager, id, userId)
    })
  }

  async remove(id: string, userId?: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.getOrderWithItems(manager, id, userId)

      if (
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.COMPLETED
      ) {
        await this.restoreOrderStock(manager, order)
        await this.restoreSpentBonusPoints(manager, order)
      }

      await manager.getRepository(Order).remove(order)
    })
  }

  private async getOrderWithItems(
    manager: EntityManager,
    id: string,
    userId?: string,
  ): Promise<Order> {
    const order = await manager.getRepository(Order).findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.model', 'user'],
    })

    if (!order) {
      throw new NotFoundException(`Заказ с id ${id} не найден`)
    }
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому заказу')
    }

    return order
  }

  private async restoreOrderStock(manager: EntityManager, order: Order): Promise<void> {
    const sizeStockRepo = manager.getRepository(ModelSizeStock)

    for (const item of order.orderItems) {
      let sizeStock = await sizeStockRepo
        .createQueryBuilder('sizeStock')
        .setLock('pessimistic_write')
        .where('sizeStock.model_id = :modelId', { modelId: item.modelId })
        .andWhere('sizeStock.size = :size', { size: item.size })
        .getOne()

      if (!sizeStock) {
        sizeStock = sizeStockRepo.create({
          modelId: item.modelId,
          size: item.size,
          stock: 0,
        })
      }

      sizeStock.stock += item.quantity
      await sizeStockRepo.save(sizeStock)
    }
  }

  private async restoreSpentBonusPoints(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    if (order.bonusPointsSpent <= 0) {
      return
    }

    await manager
      .getRepository(User)
      .increment({ id: order.userId }, 'bonusPoints', order.bonusPointsSpent)
  }

  private calculateBonusPoints(totalAmount: number): number {
    return Math.floor(Number(totalAmount) * 0.1)
  }
}
