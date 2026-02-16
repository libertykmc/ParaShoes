import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductStyle } from "./product-style.entity";
import { StyleService } from "./style.service";
import { StyleController } from "./style.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductStyle])],
    providers: [StyleService],
    controllers: [StyleController],
    exports: [StyleService],
})

export class StyleModule { }