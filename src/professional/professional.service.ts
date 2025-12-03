import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

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
        professionId: dto.professionId,
        document: dto.document,
        generalRegister: dto.generalRegister,
        registrationAgency: dto.registrationAgency,
        description: dto.description,
        experience: dto.experience,
        officeName: dto.officeName,
        verified: dto.verified ?? false,
        featured: dto.featured ?? false,
        level: dto.level ?? 'BRONZE',
        phone: dto.phone,
      },
    });

    const user = await this.userService.createUserWithRelation(
      userDto,
      undefined,
      professional.id,
      undefined,
    );
    return { professional, user };
  }

  async update(userId: string, dto: UpdateProfessionalDto) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.professional) {
      throw new NotFoundException('Profissional não encontrado!');
    }

    return await this.updateProfessional(user.professional.id, dto);
  }

  async updateProfessional(professionalId: string, dto: UpdateProfessionalDto) {
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: { ...dto },
    });
  }

  async findAll() {
    return this.prisma.professional.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.professional.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findProfessionalIdByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional: true,
      },
    });

    if (!user || !user.professional) {
      throw new NotFoundException('Profissional não encontrado para este usuário.');
    }

    return user.professional.id;
  }
}
