import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ProductMaterial } from './product-material.entity'
import { CreateMaterialDto } from "./dto/create-material.dto"
import { UpdateMaterialDto } from "./dto/update-material.dto"

@Injectable()
export class MaterialService {
    constructor(
        @InjectRepository(ProductMaterial)
        private readonly materialsRepo: Repository<ProductMaterial>,
    ) { }


    async findAll(): Promise<ProductMaterial[]> {
        return this.materialsRepo.find({ relations: ['products'] })
    }

    async findById(id: string): Promise<ProductMaterial> {
        const material = await this.materialsRepo.findOne({
            where: { id },
            relations: ['products'],
        })
        if (!material) throw new NotFoundException(`Материал с id ${id} не найден`)
        return material
    }

    async create(dto: CreateMaterialDto): Promise<ProductMaterial> {
        const material = this.materialsRepo.create(dto)
        return this.materialsRepo.save(material)
    }

    async update(id: string, dto: UpdateMaterialDto): Promise<ProductMaterial> {
        const material = await this.findById(id)
        Object.assign(material, dto)
        return this.materialsRepo.save(material)
    }

    async remove(id: string): Promise<void> {
        const material = await this.findById(id)
        await this.materialsRepo.remove(material)
    }
}

