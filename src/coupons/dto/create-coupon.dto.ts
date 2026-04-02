import { IsDateString, IsInt, IsNotEmpty, Max, Min } from "class-validator"

export class CreateCouponDto {
    @IsNotEmpty({ message: 'El nombre del cupón es obligatorio' })
    name: string
    @IsNotEmpty()
    @IsInt()
    @Max(100, { message: 'El descuento máximo es de 100' })
    @Min(1, { message: 'El descuento minímo es de 1' })
    percentage: number
    @IsNotEmpty({ message: 'La fecha no puede ir vacía' })
    @IsDateString({}, { message: 'Fecha no válida' })
    expirationDate: Date
}
