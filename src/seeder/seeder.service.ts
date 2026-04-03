import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepository : Repository<Category>,
        @InjectRepository(Product) private readonly productRepository : Repository<Product>
    ){}
    async seed() {
        console.log('Desde seed en seeder.service')
    }
}
