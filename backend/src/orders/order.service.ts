import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order, OrderStatus } from './order.entity'
import { OrderItem } from './order-item.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Model } from '../products/product.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(Model)
    private readonly productsRepo: Repository<Model>,
  ) {}

  async findAll(userId?: string): Promise<Order[]> {
    const where = userId ? { userId } : {}
    return this.ordersRepo.find({
      where,
      relations: ['orderItems', 'orderItems.product', 'user'],
      order: { orderDate: 'DESC' },
    })
  }

  async findById(id: string, userId?: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'user'],
    })
    if (!order) throw new NotFoundException(`Заказ с id ${id} не найден`)
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому заказу')
    }
    return order
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    let totalAmount = 0

    for (const item of dto.items) {
      const product = await this.productsRepo.findOneBy({ id: item.productId })
      if (!product) {
        throw new NotFoundException(`Товар с id ${item.productId} не найден`)
      }
      if (product.quantityInStock < item.quantity) {
        throw new NotFoundException(
          `Недостаточно товара ${product.name} на складе`,
        )
      }
      totalAmount += item.price * item.quantity
    }

    const order = this.ordersRepo.create({
      userId,
      deliveryAddress: dto.deliveryAddress,
      totalAmount,
      status: OrderStatus.ACCEPTED,
    })
    const savedOrder = await this.ordersRepo.save(order)

    const orderItems: OrderItem[] = []
    for (const item of dto.items) {
      const orderItem = this.orderItemsRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })
      const savedOrderItem = await this.orderItemsRepo.save(orderItem)

      const product = await this.productsRepo.findOneBy({ id: item.productId })
      if (!product) {
        throw new NotFoundException(`Товар с id ${item.productId} не найден`)
      }
      product.quantityInStock -= item.quantity
      await this.productsRepo.save(product)

      orderItems.push(savedOrderItem)
    }

    return this.findById(savedOrder.id)
  }

  async update(id: string, dto: UpdateOrderDto, userId?: string): Promise<Order> {
    const order = await this.findById(id, userId)
    Object.assign(order, dto)
    return this.ordersRepo.save(order)
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findById(id, userId)
    if (order.status === OrderStatus.COMPLETED) {
      throw new ForbiddenException('Нельзя отменить выполненный заказ')
    }
    order.status = OrderStatus.CANCELLED

    for (const item of order.orderItems) {
      const product = await this.productsRepo.findOneBy({ id: item.productId })
      if (product) {
        product.quantityInStock += item.quantity
        await this.productsRepo.save(product)
      }
    }

    return this.ordersRepo.save(order)
  }

  async remove(id: string): Promise<void> {
    const order = await this.findById(id)
    await this.ordersRepo.remove(order)
  }
}
