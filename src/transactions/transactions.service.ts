import { BadRequestException, HttpCode, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { FindManyOptions } from 'typeorm/browser';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ) { }


  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (transactionEntityManager) => {

      const transactionRepository = transactionEntityManager.getRepository(Transaction);
      const transactionContentsRepository = transactionEntityManager.getRepository(TransactionContents);
      const productRepository = transactionEntityManager.getRepository(Product);


      const transaction = transactionRepository.create({
        total: createTransactionDto.total
      })

      transaction.total = createTransactionDto.contents.reduce((total, item) => total + (item.quantity * item.price), 0)

      await transactionRepository.save(transaction)

      for (const item of createTransactionDto.contents) {
        const product = await productRepository.findOneBy({ id: item.productId });

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        const content = transactionContentsRepository.create({
          ...item,
          transaction: transaction,
          product: product
        });

        if (content.quantity > product.inventory) {
          throw new BadRequestException(`El articulo ${product.name} excede la cantidad disponible`)
        }
        product.inventory -= content.quantity

        // Create transactionContents intance
        const transactionContent = new TransactionContents()
        transactionContent.price = content.price
        transactionContent.product = product
        transactionContent.quantity = content.quantity
        transactionContent.transaction = transaction

        await transactionContentsRepository.save(content);
        await productRepository.save(product);
      }
    })
    return "Venta almacenada correctamente"
  }

  findAll() {
    const options : FindManyOptions<Transaction>= {
      relations:{
        contents:true
      }
    }
    return this.transactionRepository.find(options);
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
