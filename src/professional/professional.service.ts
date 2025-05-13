import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProfessionalService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(dto: CreateProfessionalDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );

    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const professional = await this.prisma.professional.create({
      data: {
        name: dto.name,
        profession: dto.profession,
        document: dto.document,
        generalRegister: dto.generalRegister,
        registrationAgency: dto.registrationAgency,
        description: dto.description,
        experience: dto.experience,
        officeName: dto.officeName,
        verified: dto.verified ?? false,
        featured: dto.featured ?? false,
        level: dto.level ?? 'BRONZE',
        profileImage: dto.profileImage,
        phone: dto.phone,
        address: dto.address
          ? {
            create: {
              state: dto.address.state,
              city: dto.address.city,
              district: dto.address.district,
              street: dto.address.street,
              complement: dto.address.complement,
              number: dto.address.number,
              zipCode: dto.address.zipCode,
            },
          }
          : undefined,
      },
      include: {
        address: true,
      },
    });

    const user = await this.userService.createUserWithRelation(
      userDto,
      undefined,
      professional.id,
    );
    return { professional, user };
  }
}
