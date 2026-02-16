import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductMaterial } from "./product-material.entity";
import { MaterialService } from "./material.service";
import { MaterialsController } from "./material.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductMaterial])],
    providers: [MaterialService],
    controllers: [MaterialsController],
    exports: [MaterialService],
})

export class MaterialModule { }