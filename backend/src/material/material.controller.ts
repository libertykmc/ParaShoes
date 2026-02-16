import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { MaterialService } from "./material.service";
import { ProductMaterial } from "./product-material.entity";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
    constructor(private readonly materialsService: MaterialService) { }

    @Get()
    @ApiOkResponse({ type: [ProductMaterial], description: 'Список всех материалов' })
    findAll() {
        return this.materialsService.findAll()
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: String, description: 'UUID Материала' })
    @ApiOkResponse({ type: ProductMaterial, description: 'Информация о материале' })
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.materialsService.findById(id)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiCreatedResponse({ type: ProductMaterial, description: 'Создан новый материал' })
    create(@Body() dto: CreateMaterialDto) {
        return this.materialsService.create(dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOkResponse({ type: ProductMaterial, description: 'Материал обновлен' })
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateMaterialDto,
    ) {
        return this.materialsService.update(id, dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOkResponse({ description: 'Материал удален' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this, this.materialsService.remove(id)
    }
}