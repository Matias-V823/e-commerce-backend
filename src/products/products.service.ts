import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

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

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: id
      },
      relations: {
        category: true
      }
    })

    if (!product) {
      throw new NotFoundException(`El ID #${id} no fue encontrado`)
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id)
    Object.assign(product, updateProductDto)

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: updateProductDto.categoryId })
      if (!category) {
        throw new NotFoundException('La categoría no existe')
      }
      product.category = category
    }

    return await this.productRepository.save(product)
  }

  async remove(id: number) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
    return "Producto eliminado";
  }
}
