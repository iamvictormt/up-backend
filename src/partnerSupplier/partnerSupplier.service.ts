import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerSupplierDto } from './dto/create-partnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PartnerSupplierService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createPartnerSupplier(partnerSupplierDto: CreatePartnerSupplierDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(userDto.email);

    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const partnerSupplier = await this.prisma.partnerSupplier.create({
      data: {
        tradeName: partnerSupplierDto.tradeName,
        companyName: partnerSupplierDto.companyName,
        document: partnerSupplierDto.document,
        stateRegistration: partnerSupplierDto.stateRegistration,
        address: partnerSupplierDto.address,
        contact: partnerSupplierDto.contact,
      },
    });

    const user = await this.userService.createUserWithRelation(userDto, partnerSupplier.id, undefined);
    return { partnerSupplier, user };
  }
}
