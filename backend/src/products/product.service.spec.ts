import { BadRequestException, NotFoundException } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { CategoriesService } from '../categories/category.service'
import { ModelSizeStock } from './model-size-stock.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { Model } from './product.entity'
import { ProductsService } from './product.service'

type MockRepo<T = unknown> = {
  findOne: jest.Mock
  findOneOrFail: jest.Mock
  save: jest.Mock
  create: jest.Mock
  remove: jest.Mock
  delete: jest.Mock
}

const createRepoMock = (): MockRepo => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn((payload) => payload),
  remove: jest.fn(),
  delete: jest.fn(),
})

describe('ProductsService', () => {
  let service: ProductsService
  let productsRepo: MockRepo<Model>
  let modelRepo: MockRepo<Model>
  let sizeStockRepo: MockRepo<ModelSizeStock>
  let categoriesService: Pick<CategoriesService, 'findById'>
  let dataSource: { transaction: jest.Mock }

  beforeEach(() => {
    productsRepo = createRepoMock()
    modelRepo = createRepoMock()
    sizeStockRepo = createRepoMock()
    categoriesService = {
      findById: jest.fn(),
    }

    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Model) {
          return modelRepo
        }
        if (entity === ModelSizeStock) {
          return sizeStockRepo
        }
        throw new Error(`Unexpected repository request: ${entity?.name}`)
      }),
    }

    dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    }

    service = new ProductsService(
      productsRepo as never,
      categoriesService as CategoriesService,
      dataSource as never,
    )
  })

  it('creates a product with normalized and sorted sizes', async () => {
    ;(categoriesService.findById as jest.Mock).mockResolvedValue({ id: 'cat-1' })
    modelRepo.save.mockResolvedValue({ id: 'model-1' })
    modelRepo.findOneOrFail.mockResolvedValue({
      id: 'model-1',
      sizes: [
        { size: 36, stock: 2 },
        { size: 38, stock: 1 },
      ],
    })

    const dto: CreateProductDto = {
      name: 'Air Runner',
      price: 10000,
      categoryId: 'cat-1',
      sizes: [
        { size: 38 as never, stock: 1 as never },
        { size: 36 as never, stock: 2 as never },
      ],
    }

    const result = await service.create(dto)

    expect(categoriesService.findById).toHaveBeenCalledWith('cat-1')
    expect(modelRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Air Runner',
        price: 10000,
        categoryId: 'cat-1',
      }),
    )
    expect(sizeStockRepo.save).toHaveBeenCalledWith([
      { modelId: 'model-1', size: 36, stock: 2 },
      { modelId: 'model-1', size: 38, stock: 1 },
    ])
    expect(result).toEqual(
      expect.objectContaining({
        id: 'model-1',
      }),
    )
  })

  it('replaces size stocks on update when new sizes are provided', async () => {
    const existingProduct = { id: 'model-1', name: 'Old name' } as Model
    jest.spyOn(service, 'findById').mockResolvedValue(existingProduct)

    modelRepo.findOneOrFail.mockResolvedValue({
      id: 'model-1',
      sizes: [{ size: 37, stock: 4 }],
    })

    await service.update('model-1', {
      name: 'New name',
      sizes: [
        { size: 37, stock: 4 },
        { size: 36, stock: 1 },
      ],
    })

    expect(modelRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'model-1',
        name: 'New name',
      }),
    )
    expect(sizeStockRepo.delete).toHaveBeenCalledWith({ modelId: 'model-1' })
    expect(sizeStockRepo.save).toHaveBeenCalledWith([
      { modelId: 'model-1', size: 36, stock: 1 },
      { modelId: 'model-1', size: 37, stock: 4 },
    ])
  })

  it('converts missing category into a business validation error', async () => {
    ;(categoriesService.findById as jest.Mock).mockRejectedValue(
      new NotFoundException('Category not found'),
    )

    await expect(
      service.create({
        name: 'Air Runner',
        price: 10000,
        categoryId: 'missing-category',
        sizes: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('rejects duplicate sizes in product sizes payload', async () => {
    await expect(
      service.create({
        name: 'Air Runner',
        price: 10000,
        sizes: [
          { size: 40, stock: 1 },
          { size: 40, stock: 2 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('returns a business error when removing a product blocked by relations', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue({ id: 'model-1' } as Model)
    productsRepo.remove.mockRejectedValue(
      new QueryFailedError('DELETE FROM model', [], new Error('fk_violation')),
    )

    await expect(service.remove('model-1')).rejects.toBeInstanceOf(BadRequestException)
  })
})
