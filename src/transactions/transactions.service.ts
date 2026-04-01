import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents) private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ) { }


  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      total: createTransactionDto.total
    })

    await this.transactionRepository.save(transaction)

    for (const item of createTransactionDto.contents) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      

      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      const content = this.transactionContentsRepository.create({
        ...item,
        transaction: transaction, 
        product: product
      });

      product.inventory -= content.quantity

      await this.transactionContentsRepository.save(content);
    }
    return transaction
  }

  findAll() {
    return `This action returns all transactions`;
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
