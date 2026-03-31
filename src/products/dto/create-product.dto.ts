import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateProductDto {
    @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
    @IsString({message: 'Nombre no válido'})
    name: string
    @IsNotEmpty({ message: 'El precio es obligatorio' })
    @IsNumber({maxDecimalPlaces:2}, {message:'Precio no válido'})
    price: number
    @IsString({ message: 'descripción no valida' })
    description: string
    @IsNotEmpty({ message: 'El valor del inventario es obligatorio' })
    @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Cantidad no valida' })
    inventory: number
    @IsNotEmpty({ message: 'La categoría es obligatoria' })
    @IsInt({ message: 'Categoría no valida' })
    categoryId: number
}
