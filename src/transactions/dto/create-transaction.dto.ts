import { Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, ValidateNested } from "class-validator"

export class TransactionContentDto {
    @IsNotEmpty({message: "El ID del producto no puede ir vacío"})
    @IsInt({message: "Valor no válido"})
    productId: number
    @IsNotEmpty({ message: "La cantidad del producto no puede ir vacío" })
    @IsInt({ message: "Valor no válido" })
    quantity: number

    @IsNotEmpty({ message: "El precio del producto no puede ir vacío" })
    @IsNumber({},{ message: "Valor no válido" })
    price: number
}



export class CreateTransactionDto {
    @IsNotEmpty({ message: "El total no puede ir vacío" })
    @IsNumber({}, { message: "Cantidad no valida" })
    total: number
    @IsArray()
    @ArrayNotEmpty({ message: "El array no puede venir vacío" })
    @ValidateNested()
    @Type(() => TransactionContentDto)
    contents: TransactionContentDto[]

}
