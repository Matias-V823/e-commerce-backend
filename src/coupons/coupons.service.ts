import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {

  constructor(
    @InjectRepository(Coupon) private readonly couponRepository : Repository<Coupon>
  ){}


  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({id})
    if(!coupon){
      throw new NotFoundException(`El cupón con el ID: ${id} no fue encontrado`)
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id)
    Object.assign(coupon, updateCouponDto)
    return await this. couponRepository.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id)
    if(!coupon){
      throw new NotFoundException(`No se encuentra el cupón con el ID #${id}`)
    }
    await this.couponRepository.delete(coupon)
    return {message: "Cupon eliminado correctamente"};
  }
  async applyCoupon(couponName : string ) {
    const coupon = await this.couponRepository.findOneBy({
      name:couponName
    })
    if(!coupon){
      throw new NotFoundException('El cupón no existe')
    }

    const currentDate = new Date()

    const expirationDate = endOfDay(coupon.expirationDate)

    if(isAfter(currentDate, expirationDate)){
      throw new UnprocessableEntityException('Cupón ya expirado')
    }

    
    return {
      message: 'Cupon Válido',
      coupon
    }
  }
}
