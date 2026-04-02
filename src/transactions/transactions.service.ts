import { BadRequestException, HttpCode, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionContents } from './entities/transaction.entity';
import { Between, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { FindManyOptions } from 'typeorm/browser';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';

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

  findAll(transactionDate? : string) {
    const options : FindManyOptions<Transaction>= {
      relations:{
        contents:true
      }
    }
    if(transactionDate){
      const date = parseISO(transactionDate)
      if(!isValid(date)){
        throw new BadRequestException("Fecha no válida")
      }
      const start = startOfDay(date)
      const end = endOfDay(date)
      
      options.where = {
        transactionDate: Between(start,end)
      }

    }

    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id
      },
      relations:{
        contents: true
      }
    })
    if(!transaction){
      throw new NotFoundException('Transacción no encontrada')
    }
    return transaction;
  }

  async remove(id: number) {

    const transaction = await this.findOne(id)

    for(const contents of transaction.contents){
      const product = await this.productRepository.findOneBy({id: contents.product.id})
      const transactionContents = await this.transactionContentsRepository.findOneBy({id: contents.id})
      
      if (product) {
        product.inventory += contents.quantity
        await this.productRepository.save(product)
      }

      if (transactionContents) {
        await this.transactionContentsRepository.remove(transactionContents)
      }
    }

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada')
    }
    await this.transactionRepository.remove(transaction)

    return `La venta de #${id} fue eliminada correctamente`;
  }
}
