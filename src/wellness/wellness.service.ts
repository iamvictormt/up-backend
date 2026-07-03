import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PartnerBaseService } from 'src/partner/partner-base.service';
import { isValidDocument } from 'src/partner/document.validator';
import { CreateWellnessDto } from './dto/create-wellness.dto';
import { UpdateWellnessDto } from './dto/update-wellness.dto';

@Injectable()
export class WellnessService {
  constructor(private readonly base: PartnerBaseService) {}

  async create(dto: CreateWellnessDto, userDto: CreateUserDto) {
    if (!isValidDocument(dto.documentType, dto.document)) {
      throw new BadRequestException(`${dto.documentType} inválido.`);
    }
    return this.base.create(
      {
        tradeName: dto.tradeName,
        companyName: dto.companyName,
        document: dto.document,
        documentType: dto.documentType,
        stateRegistration:
          dto.documentType === 'CPF' ? undefined : dto.stateRegistration,
        contact: dto.contact,
        type: 'WELLNESS',
      },
      userDto,
    );
  }

  async update(userId: string, dto: UpdateWellnessDto) {
    if (
      dto.document &&
      dto.documentType &&
      !isValidDocument(dto.documentType, dto.document)
    ) {
      throw new BadRequestException(`${dto.documentType} inválido.`);
    }
    const partnerId = await this.base.findPartnerIdByUserId(userId);
    return this.base.update(partnerId, {
      ...dto,
      stateRegistration:
        dto.documentType === 'CPF' ? undefined : dto.stateRegistration,
    });
  }

  findAll(search?: string, page = 1, limit = 10, state?: string, city?: string) {
    return this.base.findAll('WELLNESS', search, page, limit, state, city);
  }
}
