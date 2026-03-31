import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ) { }


  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId })
    if (!category) {
      throw new NotFoundException('La categoría no existe')
    }

    return this.productRepository.save({
      ...createProductDto,
      category
    })
  }

  async findAll(categoryId : number, take: number, skip: number) {
    if(categoryId){
      const [data, total] = await this.productRepository.findAndCount(
        {
          where:{
            category: {
              id: categoryId
            }
          },
          relations: {
            category: true
          },
          order: {
            id: 'ASC'
          },
          take,
          skip
        });
      return {
        data,
        total
      }

    }
    const [ data, total ] = await this.productRepository.findAndCount(
      {
        relations: {
          category: true
        },
        order:{
          id:'ASC'
        },
        take,
        skip
      });
    return {
      data,
      total
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
