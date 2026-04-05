import { Category } from "../../categories/entities/category.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: 'varchar', length: 80 })
    name: string
    @Column({ type: 'varchar', length: 200 })
    description: string
    @Column({ type: 'varchar', nullable: true, default: 'default.svg' })
    image: string
    @Column({ type: 'decimal' })
    price: number
    @Column({ type: 'int' })
    inventory: number
    @Column({ type: 'int' })
    categoryId: number
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'categoryId' })
    category: Category
}
