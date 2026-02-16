import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ProductSeason } from './product-season.entity'
import { CreateSeasonDto } from "./dto/create-season.dto"
import { UpdateSeasonDto } from "./dto/update-season.dto"

@Injectable()
export class SeasonService {
    constructor(
        @InjectRepository(ProductSeason)
        private readonly seasonsRepo: Repository<ProductSeason>,
    ) { }


    async findAll(): Promise<ProductSeason[]> {
        return this.seasonsRepo.find({ relations: ['products'] })
    }

    async findById(id: string): Promise<ProductSeason> {
        const season = await this.seasonsRepo.findOne({
            where: { id },
            relations: ['products'],
        })
        if (!season) throw new NotFoundException(`Сезон с id ${id} не найден`)
        return season
    }

    async create(dto: CreateSeasonDto): Promise<ProductSeason> {
        const season = this.seasonsRepo.create(dto)
        return this.seasonsRepo.save(season)
    }

    async update(id: string, dto: UpdateSeasonDto): Promise<ProductSeason> {
        const season = await this.findById(id)
        Object.assign(season, dto)
        return this.seasonsRepo.save(season)
    }

    async remove(id: string): Promise<void> {
        const season = await this.findById(id)
        await this.seasonsRepo.remove(season)
    }
}

