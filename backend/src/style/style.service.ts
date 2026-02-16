import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ProductStyle } from './product-style.entity'
import { CreateStyleDto } from "./dto/create-style.dto"
import { UpdateStyleDto } from "./dto/update-style.dto"

@Injectable()
export class StyleService {
    constructor(
        @InjectRepository(ProductStyle)
        private readonly stylesRepo: Repository<ProductStyle>,
    ) { }


    async findAll(): Promise<ProductStyle[]> {
        return this.stylesRepo.find({ relations: ['products'] })
    }

    async findById(id: string): Promise<ProductStyle> {
        const style = await this.stylesRepo.findOne({
            where: { id },
            relations: ['products'],
        })
        if (!style) throw new NotFoundException(`Стиль с id ${id} не найден`)
        return style
    }

    async create(dto: CreateStyleDto): Promise<ProductStyle> {
        const style = this.stylesRepo.create(dto)
        return this.stylesRepo.save(style)
    }

    async update(id: string, dto: UpdateStyleDto): Promise<ProductStyle> {
        const style = await this.findById(id)
        Object.assign(style, dto)
        return this.stylesRepo.save(style)
    }

    async remove(id: string): Promise<void> {
        const style = await this.findById(id)
        await this.stylesRepo.remove(style)
    }
}

