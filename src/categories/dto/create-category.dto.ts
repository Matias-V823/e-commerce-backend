import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
    @IsNotEmpty({message: 'El nombre de la categoría no puede ir vacío'})
    name: string
}
