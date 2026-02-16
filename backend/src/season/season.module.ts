import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductSeason } from "./product-season.entity";
import { SeasonService } from "./season.service";
import { SeasonsController } from "./season.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductSeason])],
    providers: [SeasonService],
    controllers: [SeasonsController],
    exports: [SeasonService],
})

export class SeasonModule { }