import { BadRequestException } from '@nestjs/common'
import { ModelSizeStock } from '../products/model-size-stock.entity'
import { Model } from '../products/product.entity'
import { Cart } from './cart.entity'
import { CartService } from './cart.service'

type MockRepo<T = unknown> = {
  findOne: jest.Mock
  findOneBy: jest.Mock
  save: jest.Mock
  create: jest.Mock
}

const createRepoMock = (): MockRepo => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((payload) => payload),
})

describe('CartService', () => {
  let service: CartService
  let cartRepo: MockRepo<Cart>
  let modelsRepo: MockRepo<Model>
  let sizeStocksRepo: MockRepo<ModelSizeStock>

  beforeEach(() => {
    cartRepo = createRepoMock()
    modelsRepo = createRepoMock()
    sizeStocksRepo = createRepoMock()

    service = new CartService(
      cartRepo as never,
      modelsRepo as never,
      sizeStocksRepo as never,
    )
  })

  it('adds a new cart item when stock is available', async () => {
    modelsRepo.findOneBy.mockResolvedValue({ id: 'model-1' })
    sizeStocksRepo.findOne.mockResolvedValue({ modelId: 'model-1', size: 42, stock: 5 })
    cartRepo.findOne.mockResolvedValue(null)
    cartRepo.save.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 2,
    })

    jest.spyOn(service, 'findById').mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 2,
    } as Cart)

    const result = await service.addToCart('user-1', {
      modelId: 'model-1',
      size: 42,
      quantity: 2,
    })

    expect(cartRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 2,
    })
    expect(result).toEqual(
      expect.objectContaining({
        id: 'cart-1',
        quantity: 2,
      }),
    )
  })

  it('merges quantity into an existing cart item', async () => {
    const existingItem = {
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 1,
    } as Cart

    modelsRepo.findOneBy.mockResolvedValue({ id: 'model-1' })
    sizeStocksRepo.findOne.mockResolvedValue({ modelId: 'model-1', size: 42, stock: 5 })
    cartRepo.findOne.mockResolvedValue(existingItem)
    cartRepo.save.mockResolvedValue({ ...existingItem, quantity: 3 })

    jest.spyOn(service, 'findById').mockResolvedValue({
      ...existingItem,
      quantity: 3,
    })

    const result = await service.addToCart('user-1', {
      modelId: 'model-1',
      size: 42,
      quantity: 2,
    })

    expect(cartRepo.create).not.toHaveBeenCalled()
    expect(cartRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cart-1',
        quantity: 3,
      }),
    )
    expect(result.quantity).toBe(3)
  })

  it('rejects adding more items than available in stock', async () => {
    modelsRepo.findOneBy.mockResolvedValue({ id: 'model-1' })
    sizeStocksRepo.findOne.mockResolvedValue({ modelId: 'model-1', size: 42, stock: 2 })
    cartRepo.findOne.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 1,
    })

    await expect(
      service.addToCart('user-1', {
        modelId: 'model-1',
        size: 42,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('updates quantity when the requested stock is available', async () => {
    const initialItem = {
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 1,
    } as Cart

    const updatedItem = {
      ...initialItem,
      quantity: 3,
    }

    jest
      .spyOn(service, 'findById')
      .mockResolvedValueOnce(initialItem)
      .mockResolvedValueOnce(updatedItem)

    sizeStocksRepo.findOne.mockResolvedValue({ modelId: 'model-1', size: 42, stock: 4 })
    cartRepo.save.mockResolvedValue(updatedItem)

    const result = await service.updateQuantity('cart-1', 'user-1', { quantity: 3 })

    expect(cartRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cart-1',
        quantity: 3,
      }),
    )
    expect(result.quantity).toBe(3)
  })

  it('rejects quantity updates when stock is not enough', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      modelId: 'model-1',
      size: 42,
      quantity: 1,
    } as Cart)
    sizeStocksRepo.findOne.mockResolvedValue({ modelId: 'model-1', size: 42, stock: 2 })

    await expect(
      service.updateQuantity('cart-1', 'user-1', { quantity: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})
