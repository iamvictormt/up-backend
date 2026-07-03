import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PartnerBaseService } from 'src/partner/partner-base.service';
import { isValidDocument } from 'src/partner/document.validator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly base: PartnerBaseService) {}

  async create(dto: CreateSupplierDto, userDto: CreateUserDto) {
    if (dto.documentType !== 'CNPJ') {
      throw new BadRequestException('Lojista parceiro deve usar CNPJ.');
    }
    if (!isValidDocument('CNPJ', dto.document)) {
      throw new BadRequestException('CNPJ inválido.');
    }
    return this.base.create(
      {
        tradeName: dto.tradeName,
        companyName: dto.companyName,
        document: dto.document,
        documentType: 'CNPJ',
        stateRegistration: dto.stateRegistration,
        contact: dto.contact,
        type: 'SUPPLIER',
      },
      userDto,
    );
  }

  async update(userId: string, dto: UpdateSupplierDto) {
    if (dto.document && !isValidDocument('CNPJ', dto.document)) {
      throw new BadRequestException('CNPJ inválido.');
    }
    const partnerId = await this.base.findPartnerIdByUserId(userId);
    return this.base.update(partnerId, { ...dto, documentType: 'CNPJ' });
  }

  findAll(search?: string, page = 1, limit = 10, state?: string, city?: string) {
    return this.base.findAll('SUPPLIER', search, page, limit, state, city);
  }
}
